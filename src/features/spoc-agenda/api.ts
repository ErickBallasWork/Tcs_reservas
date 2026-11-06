import { apiClient } from '@/api/api-client';
import type { ReallocateBody, ReservationDetail, SpocAgenda } from '@/api/types';
import { unwrap } from '@/api/unwrap';

export interface SpocAgendaFilter {
  buildingId?: string;
  from: string;
  to: string;
}

export async function fetchSpocAgenda(filter: SpocAgendaFilter): Promise<SpocAgenda> {
  return unwrap(await apiClient.GET('/spoc/agenda', { params: { query: filter } }));
}

export async function reallocateReservation(
  id: string,
  body: ReallocateBody,
): Promise<ReservationDetail> {
  return unwrap(
    await apiClient.POST('/reservations/{id}/reallocate', { params: { path: { id } }, body }),
  );
}
