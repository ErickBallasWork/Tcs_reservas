import { apiClient } from '@/api/api-client';
import type {
  CreateReservationBody,
  CreateSeriesBody,
  MyReservationPage,
  ReservationDetail,
  ReservationStatus,
  SeriesCancelResult,
  SeriesCreated,
  SeriesPreview,
  UpdateReservationBody,
} from '@/api/types';
import { unwrap } from '@/api/unwrap';

export interface MyReservationsFilter {
  page: number;
  pageSize: number;
  status?: ReservationStatus;
  from?: string;
  to?: string;
}

export async function fetchMyReservations(
  filter: MyReservationsFilter,
): Promise<MyReservationPage> {
  return unwrap(await apiClient.GET('/reservations/mine', { params: { query: filter } }));
}

export async function createReservation(body: CreateReservationBody): Promise<ReservationDetail> {
  return unwrap(await apiClient.POST('/reservations', { body }));
}

export async function updateReservation(
  id: string,
  body: UpdateReservationBody,
): Promise<ReservationDetail> {
  return unwrap(await apiClient.PATCH('/reservations/{id}', { params: { path: { id } }, body }));
}

export async function cancelReservation(id: string): Promise<ReservationDetail> {
  return unwrap(await apiClient.PATCH('/reservations/{id}/cancel', { params: { path: { id } } }));
}

export async function previewSeries(body: CreateSeriesBody): Promise<SeriesPreview> {
  return unwrap(await apiClient.POST('/reservation-series/preview', { body }));
}

export async function createSeries(body: CreateSeriesBody): Promise<SeriesCreated> {
  return unwrap(await apiClient.POST('/reservation-series', { body }));
}

export async function cancelSeries(id: string): Promise<SeriesCancelResult> {
  return unwrap(
    await apiClient.PATCH('/reservation-series/{id}/cancel', { params: { path: { id } } }),
  );
}
