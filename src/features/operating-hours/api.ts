import { apiClient } from '@/api/api-client';
import type {
  ClosedDate,
  CreateClosedDateBody,
  OperatingHours,
  ReplaceOperatingHoursBody,
} from '@/api/types';
import { unwrap } from '@/api/unwrap';

export async function fetchOperatingHours(resourceId?: string): Promise<OperatingHours> {
  return unwrap(await apiClient.GET('/operating-hours', { params: { query: { resourceId } } }));
}

export async function replaceOperatingHours(
  body: ReplaceOperatingHoursBody,
): Promise<OperatingHours> {
  return unwrap(await apiClient.PUT('/operating-hours', { body }));
}

export async function fetchClosedDates(): Promise<ClosedDate[]> {
  return unwrap(await apiClient.GET('/closed-dates'));
}

export async function createClosedDate(body: CreateClosedDateBody): Promise<ClosedDate> {
  return unwrap(await apiClient.POST('/closed-dates', { body }));
}

export async function deleteClosedDate(id: string): Promise<void> {
  const { error, response } = await apiClient.DELETE('/closed-dates/{id}', {
    params: { path: { id } },
  });
  if (error !== undefined) unwrap({ error, response });
}
