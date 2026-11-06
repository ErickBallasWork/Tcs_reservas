import createClient from 'openapi-fetch';
import { ApiError } from '@/api/api-error';
import type { paths } from '@/api/schema';

const DEFAULT_TIMEOUT_MS = 15_000;

type WithoutGlobalPrefix<T> = {
  [K in keyof T as K extends `/api/v1${infer Path}` ? Path : K]: T[K];
};

export type ApiPaths = WithoutGlobalPrefix<paths>;

export interface ApiClientOptions {
  baseUrl: string;
  getToken: () => string | null;
  onUnauthorized?: () => void;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

async function fetchWithTimeout(
  request: Request,
  timeoutMs: number,
  baseFetch: typeof fetch,
): Promise<Response> {
  const timeout = AbortSignal.timeout(timeoutMs);
  const signal = AbortSignal.any([request.signal, timeout]);
  try {
    return await baseFetch(new Request(request, { signal }));
  } catch (error) {
    if (request.signal.aborted) throw error;
    throw new ApiError({ status: 0, code: timeout.aborted ? 'TIMEOUT' : 'NETWORK_ERROR' });
  }
}

export function createApiClient(options: ApiClientOptions) {
  const { baseUrl, getToken, onUnauthorized, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const baseFetch = options.fetch ?? globalThis.fetch.bind(globalThis);

  const client = createClient<ApiPaths>({
    baseUrl,
    fetch: (request) => fetchWithTimeout(request, timeoutMs, baseFetch),
  });

  client.use({
    onRequest({ request }) {
      const token = getToken();
      if (token) request.headers.set('Authorization', `Bearer ${token}`);
      return request;
    },
    onResponse({ response }) {
      if (response.status === 401) onUnauthorized?.();
    },
  });

  return client;
}
