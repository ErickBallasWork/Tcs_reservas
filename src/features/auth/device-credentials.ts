import { z } from 'zod';
import { readStorageItem, writeStorageItem } from '@/lib/browser-storage';

export const REFRESH_TOKEN_KEY = 'reservas.refresh-token';
export const PENDING_REQUEST_KEY = 'reservas.pending-request';

const DEVICE_SECRET_BYTES = 32;

const pendingRequestSchema = z.object({
  requestId: z.uuid(),
  deviceSecret: z.string().min(43),
  email: z.string(),
});

export type PendingRequest = z.infer<typeof pendingRequestSchema>;

export function readRefreshToken(): string | null {
  return readStorageItem(REFRESH_TOKEN_KEY);
}

export function writeRefreshToken(token: string): void {
  writeStorageItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken(): void {
  writeStorageItem(REFRESH_TOKEN_KEY, null);
}

export function parsePendingRequest(raw: string | null): PendingRequest | null {
  if (!raw) return null;
  try {
    const result = pendingRequestSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function readPendingRequest(): PendingRequest | null {
  return parsePendingRequest(readStorageItem(PENDING_REQUEST_KEY));
}

export function writePendingRequest(request: PendingRequest): void {
  writeStorageItem(PENDING_REQUEST_KEY, JSON.stringify(request));
}

export function clearPendingRequest(): void {
  writeStorageItem(PENDING_REQUEST_KEY, null);
}

export function generateDeviceSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(DEVICE_SECRET_BYTES));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, 'Edge'],
  [/OPR\//, 'Opera'],
  [/Firefox\//, 'Firefox'],
  [/Chrome\//, 'Chrome'],
  [/Safari\//, 'Safari'],
];

const SYSTEMS: [RegExp, string][] = [
  [/Windows/, 'Windows'],
  [/Android/, 'Android'],
  [/iPhone|iPad|iPod/, 'iOS'],
  [/Mac OS X/, 'macOS'],
  [/Linux/, 'Linux'],
];

function firstMatch(table: [RegExp, string][], userAgent: string): string | null {
  return table.find(([pattern]) => pattern.test(userAgent))?.[1] ?? null;
}

export function describeDevice(userAgent: string): string {
  const browser = firstMatch(BROWSERS, userAgent) ?? 'Navegador';
  const system = firstMatch(SYSTEMS, userAgent);
  return system ? `${browser} en ${system}` : browser;
}
