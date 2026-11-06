'use client';

import { useMemo } from 'react';
import { messageForError } from '@/api/error-messages';
import { AvailabilityWorkspace } from '@/features/availability/AvailabilityWorkspace';
import { useCatalogTree } from '@/features/catalog/useCatalogTree';
import { useActiveSanction } from '@/features/sanctions/useActiveSanction';
import { firstBookableDate } from '@/lib/booking-time';
import { availabilityLabels as labels } from '@/lib/labels';

export function AvailabilityView() {
  const firstDate = useMemo(() => firstBookableDate(), []);
  const isSanctioned = Boolean(useActiveSanction().data);
  const tree = useCatalogTree();
  const buildings = useMemo(
    () => (tree.data ?? []).filter((building) => building.isActive),
    [tree.data],
  );

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

  if (buildings.length === 0) return <p>{labels.noResources}</p>;

  return (
    <AvailabilityWorkspace
      buildings={buildings}
      firstDate={firstDate}
      isSanctioned={isSanctioned}
    />
  );
}
