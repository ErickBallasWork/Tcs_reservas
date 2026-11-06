import { apiClient } from '@/api/api-client';
import type { Me } from '@/api/types';
import { unwrap } from '@/api/unwrap';

export async function fetchMe(): Promise<Me> {
  return unwrap(await apiClient.GET('/me'));
}
