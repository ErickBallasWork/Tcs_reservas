import { useQuery } from '@tanstack/react-query';
import { fetchCatalogTree } from '@/features/catalog/api';

export const catalogKeys = {
  tree: ['catalog', 'tree'] as const,
};

export function useCatalogTree() {
  return useQuery({ queryKey: catalogKeys.tree, queryFn: fetchCatalogTree });
}
