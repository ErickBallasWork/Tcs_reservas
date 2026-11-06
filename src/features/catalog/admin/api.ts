import { apiClient } from '@/api/api-client';
import type {
  Building,
  CatalogBuilding,
  CatalogItem,
  CreateBuildingBody,
  CreateResourceBody,
  FutureReservation,
  UpdateBuildingBody,
  UpdateResourceBody,
} from '@/api/types';
import { unwrap } from '@/api/unwrap';

export async function fetchAdminCatalogTree(): Promise<CatalogBuilding[]> {
  return unwrap(
    await apiClient.GET('/catalog/tree', { params: { query: { includeInactive: true } } }),
  );
}

export async function createBuilding(body: CreateBuildingBody): Promise<Building> {
  return unwrap(await apiClient.POST('/buildings', { body }));
}

export async function patchBuilding(id: string, body: UpdateBuildingBody): Promise<Building> {
  return unwrap(await apiClient.PATCH('/buildings/{id}', { params: { path: { id } }, body }));
}

export async function createResource(body: CreateResourceBody): Promise<CatalogItem> {
  return unwrap(await apiClient.POST('/resources', { body }));
}

export async function patchResource(id: string, body: UpdateResourceBody): Promise<CatalogItem> {
  return unwrap(await apiClient.PATCH('/resources/{id}', { params: { path: { id } }, body }));
}

export async function fetchBuildingFutureReservations(id: string): Promise<FutureReservation[]> {
  return unwrap(
    await apiClient.GET('/buildings/{id}/future-reservations', { params: { path: { id } } }),
  );
}

export async function fetchResourceFutureReservations(id: string): Promise<FutureReservation[]> {
  return unwrap(
    await apiClient.GET('/resources/{id}/future-reservations', { params: { path: { id } } }),
  );
}
