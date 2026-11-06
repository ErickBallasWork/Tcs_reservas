import { ApiError } from '@/api/api-error';

interface FetchResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

export function unwrap<T>({ data, error, response }: FetchResult<T>): T {
  if (error !== undefined) throw ApiError.fromBody(response.status, error);
  if (data === undefined) throw new ApiError({ status: response.status, code: 'UNKNOWN_ERROR' });
  return data;
}
