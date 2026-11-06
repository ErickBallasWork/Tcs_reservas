import { apiClient } from '@/api/api-client';
import type { ResourceAvailability } from '@/api/types';
import { unwrap } from '@/api/unwrap';

export async function fetchResourceAvailability(
  id: string,
  from: string,
  to: string,
): Promise<ResourceAvailability> {
  return unwrap(
    await apiClient.GET('/availability/resources/{id}', {
      params: { path: { id }, query: { from, to } },
    }),
  );
}
