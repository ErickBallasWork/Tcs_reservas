'use client';

import { messageForError } from '@/api/error-messages';
import type { CatalogBuilding } from '@/api/types';
import { useAdminCatalogTree } from '@/features/catalog/admin/useCatalogAdmin';
import { catalogAdminLabels as labels } from '@/lib/labels';

interface CatalogAdminBoundaryProps {
  children: (buildings: CatalogBuilding[]) => React.ReactNode;
}

export function CatalogAdminBoundary({ children }: CatalogAdminBoundaryProps) {
  const tree = useAdminCatalogTree();

  if (tree.isPending) {
    return (
      <p role="status" className="flex items-center gap-2">
        <span className="spinner" aria-hidden />
        {labels.loading}
      </p>
    );
  }

  if (tree.isError) {
    return (
      <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
        <span>{messageForError(tree.error)}</span>
        <button type="button" className="btn btn-outline" onClick={() => void tree.refetch()}>
          {labels.retry}
        </button>
      </div>
    );
  }

  return <>{children(tree.data)}</>;
}
