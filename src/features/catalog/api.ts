import { apiClient } from '@/api/api-client';
import type { CatalogBuilding } from '@/api/types';
import { unwrap } from '@/api/unwrap';

export async function fetchCatalogTree(): Promise<CatalogBuilding[]> {
  return unwrap(await apiClient.GET('/catalog/tree'));
}
