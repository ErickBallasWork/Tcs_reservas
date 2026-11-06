import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/api-error';
import { createApiClient } from '@/api/client';
import { messageForError } from '@/api/error-messages';
import { unwrap } from '@/api/unwrap';

const BASE_URL = 'http://api.test/api/v1';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function makeClient(options: {
  fetch: typeof fetch;
  token?: string | null;
  onUnauthorized?: () => void;
  timeoutMs?: number;
}) {
  return createApiClient({
    baseUrl: BASE_URL,
    getToken: () => options.token ?? null,
    onUnauthorized: options.onUnauthorized,
    timeoutMs: options.timeoutMs,
    fetch: options.fetch,
  });
}

describe('createApiClient', () => {
  it('sends the bearer token when there is one', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse([]));
    const client = makeClient({ fetch: fetchMock, token: 'abc' });

    await client.GET('/catalog/tree');

    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.headers.get('Authorization')).toBe('Bearer abc');
    expect(request.url).toBe(`${BASE_URL}/catalog/tree`);
  });

  it('omits the authorization header without a token', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse([]));
    const client = makeClient({ fetch: fetchMock });

    await client.GET('/catalog/tree');

    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.headers.has('Authorization')).toBe(false);
  });

  it('notifies when the session is rejected', async () => {
    const onUnauthorized = vi.fn();
    const body = { statusCode: 401, code: 'INVALID_TOKEN', message: 'x' };
    const client = makeClient({
      fetch: vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(body, 401)),
      onUnauthorized,
    });

    await client.GET('/catalog/tree');

    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('fails with TIMEOUT when the server does not answer in time', async () => {
    const hangingFetch: typeof fetch = (input) =>
      new Promise((_, reject) => {
        (input as Request).signal.addEventListener('abort', () => reject(new Error('aborted')));
      });
    const client = makeClient({ fetch: hangingFetch, timeoutMs: 20 });

    await expect(client.GET('/catalog/tree')).rejects.toMatchObject({ code: 'TIMEOUT' });
  });

  it('fails with NETWORK_ERROR when the request cannot be sent', async () => {
    const client = makeClient({
      fetch: vi.fn<typeof fetch>().mockRejectedValue(new TypeError('failed')),
    });

    await expect(client.GET('/catalog/tree')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });
});

describe('unwrap', () => {
  it('returns the data of a successful response', async () => {
    const client = makeClient({
      fetch: vi.fn<typeof fetch>().mockResolvedValue(jsonResponse([{ id: '1' }])),
    });

    const data = unwrap(await client.GET('/catalog/tree'));

    expect(data).toEqual([{ id: '1' }]);
  });

  it('throws an ApiError carrying the code of the backend', async () => {
    const body = { statusCode: 404, code: 'RESOURCE_NOT_FOUND', message: 'No existe' };
    const client = makeClient({
      fetch: vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(body, 404)),
    });

    const call = async () => unwrap(await client.GET('/catalog/tree'));

    await expect(call()).rejects.toMatchObject({
      status: 404,
      code: 'RESOURCE_NOT_FOUND',
      isClientError: true,
    });
  });

  it('keeps every validation message as detail', () => {
    const error = ApiError.fromBody(400, { code: 'BAD_REQUEST', message: ['a', 'b'] });

    expect(error.details).toEqual(['a', 'b']);
  });

  it('falls back to UNKNOWN_ERROR for a body without code', () => {
    expect(ApiError.fromBody(500, '<html>').code).toBe('UNKNOWN_ERROR');
  });
});

describe('messageForError', () => {
  it('shows the Spanish message of the error code', () => {
    const error = new ApiError({ status: 409, code: 'SLOT_TAKEN' });

    expect(messageForError(error)).toBe('Ese horario ya fue reservado. Elige otro.');
  });

  it('shows a generic message for anything that is not an ApiError', () => {
    expect(messageForError(new Error('boom'))).toBe('Ocurrió un error inesperado.');
  });
});
