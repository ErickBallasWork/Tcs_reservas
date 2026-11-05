import { API_URL } from "@/lib/config";
import { ApiError } from "./errors";

type TokenProvider = () => Promise<string | null>;
type QueryValue = string | number | boolean | null | undefined;

interface RequestOptions extends Omit<RequestInit, "body"> {
  query?: Record<string, QueryValue>;
  body?: unknown;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15_000;

let tokenProvider: TokenProvider = async () => null;
let unauthorizedHandler: (() => void) | null = null;

// The auth layer registers how to get the access token (MSAL later)
export const setTokenProvider = (provider: TokenProvider) => {
  tokenProvider = provider;
};

// Called on any 401 so the app can close the session
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    query,
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers,
    signal: callerSignal,
    ...init
  } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  callerSignal?.addEventListener("abort", () => controller.abort());

  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  if (body !== undefined) finalHeaders.set("Content-Type", "application/json");
  const token = await tokenProvider();
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...init,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (callerSignal?.aborted) throw error; // cancelled on purpose (e.g. by React Query)
    throw new ApiError(
      0,
      controller.signal.aborted
        ? "El servidor tardó demasiado en responder."
        : "No se pudo conectar con el servidor. Revisa tu conexión.",
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const raw = payload?.message;
    const details: string[] = Array.isArray(raw)
      ? raw.map(String)
      : raw
        ? [String(raw)]
        : [];
    if (response.status === 401) unauthorizedHandler?.();
    throw new ApiError(
      response.status,
      details[0] ?? response.statusText,
      details,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, query?: Record<string, QueryValue>, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "GET", query }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};