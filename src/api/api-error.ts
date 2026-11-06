import type { ErrorCode } from '@/api/types';

export const CLIENT_ERROR_CODES = ['NETWORK_ERROR', 'TIMEOUT', 'UNKNOWN_ERROR'] as const;

export type ClientErrorCode = (typeof CLIENT_ERROR_CODES)[number];
export type ApiErrorCode = ErrorCode | ClientErrorCode;

interface ApiErrorInit {
  status: number;
  code: ApiErrorCode;
  details?: string[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details: string[];

  constructor({ status, code, details = [] }: ApiErrorInit) {
    super(code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static fromBody(status: number, body: unknown): ApiError {
    if (!isErrorBody(body)) return new ApiError({ status, code: 'UNKNOWN_ERROR' });
    const details = Array.isArray(body.message) ? body.message : [body.message];
    return new ApiError({ status, code: body.code, details });
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

function isErrorBody(body: unknown): body is { code: ErrorCode; message: string | string[] } {
  if (typeof body !== 'object' || body === null) return false;
  return 'code' in body && typeof body.code === 'string' && 'message' in body;
}
