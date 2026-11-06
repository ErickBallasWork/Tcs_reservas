import { useMemo, useSyncExternalStore } from 'react';
import {
  type PendingRequest,
  parsePendingRequest,
  PENDING_REQUEST_KEY,
} from '@/features/auth/device-credentials';
import { readStorageItem, subscribeToStorage } from '@/lib/browser-storage';

export function usePendingRequest(): PendingRequest | null {
  const raw = useSyncExternalStore(
    subscribeToStorage,
    () => readStorageItem(PENDING_REQUEST_KEY),
    () => null,
  );
  return useMemo(() => parsePendingRequest(raw), [raw]);
}
