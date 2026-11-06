import { apiClient } from '@/api/api-client';
import type { Me, Sanction, SanctionPage, SanctionStatus } from '@/api/types';
import { unwrap } from '@/api/unwrap';

export const SANCTIONS_PAGE_SIZE = 50;

export async function fetchMe(): Promise<Me> {
  return unwrap(await apiClient.GET('/me'));
}

export async function fetchSanctions(status: SanctionStatus, page: number): Promise<SanctionPage> {
  return unwrap(
    await apiClient.GET('/sanctions', {
      params: { query: { status, page, pageSize: SANCTIONS_PAGE_SIZE } },
    }),
  );
}

export async function resolveSanction(id: string, comment: string): Promise<Sanction> {
  return unwrap(
    await apiClient.PATCH('/sanctions/{id}/resolve', {
      params: { path: { id } },
      body: { comment },
    }),
  );
}
