import { apiClient } from '@/api/api-client';
import type {
  CreateFloorPlanBody,
  FloorPlanDetail,
  FloorPlanStatus,
  FloorPlanSummary,
  ReplaceFloorZonesBody,
  UpdateFloorPlanBody,
} from '@/api/types';
import { unwrap } from '@/api/unwrap';
import type { StatusQuery } from '@/lib/floor-plan/plan-window';

export async function fetchFloorPlans(includeInactive = false): Promise<FloorPlanSummary[]> {
  return unwrap(await apiClient.GET('/floor-plans', { params: { query: { includeInactive } } }));
}

export async function fetchFloorPlan(id: string): Promise<FloorPlanDetail> {
  return unwrap(await apiClient.GET('/floor-plans/{id}', { params: { path: { id } } }));
}

export async function fetchFloorPlanStatus(
  id: string,
  query: StatusQuery,
): Promise<FloorPlanStatus> {
  return unwrap(
    await apiClient.GET('/floor-plans/{id}/status', { params: { path: { id }, query } }),
  );
}

export async function createFloorPlan(body: CreateFloorPlanBody): Promise<FloorPlanDetail> {
  return unwrap(await apiClient.POST('/floor-plans', { body }));
}

export async function patchFloorPlan(
  id: string,
  body: UpdateFloorPlanBody,
): Promise<FloorPlanDetail> {
  return unwrap(await apiClient.PATCH('/floor-plans/{id}', { params: { path: { id } }, body }));
}

export async function replaceFloorZones(
  id: string,
  body: ReplaceFloorZonesBody,
): Promise<FloorPlanDetail> {
  return unwrap(await apiClient.PUT('/floor-plans/{id}/zones', { params: { path: { id } }, body }));
}
