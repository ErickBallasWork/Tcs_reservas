'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { messageForError } from '@/api/error-messages';
import { CatalogAdminBoundary } from '@/features/catalog/admin/CatalogAdminBoundary';
import { FloorPlanEditor } from '@/features/floor-plans/admin/FloorPlanEditor';
import { FLOOR_PLANS_HREF } from '@/features/floor-plans/admin/routes';
import { FloorPlanCanvas } from '@/features/floor-plans/FloorPlanCanvas';
import { FloorPlanViewport } from '@/features/floor-plans/FloorPlanViewport';
import { useFloorPlan } from '@/features/floor-plans/useFloorPlans';
import { floorPlanAdminLabels as labels } from '@/lib/labels';
import { useMediaQuery } from '@/lib/useMediaQuery';

const EDITOR_QUERY = '(min-width: 768px)';

export function FloorPlanEditorScreen({ id }: { id: string }) {
  const plan = useFloorPlan(id);
  const canEdit = useMediaQuery(EDITOR_QUERY);
  const [dirty, setDirty] = useState(false);
  const trackDirty = useCallback((next: boolean) => setDirty(next), []);

  const back = (
    <Link
      href={FLOOR_PLANS_HREF}
      className="btn btn-outline self-start"
      onClick={(event) => {
        if (dirty && !window.confirm(labels.confirmLeave)) event.preventDefault();
      }}
    >
      <ArrowLeft className="size-4" aria-hidden />
      {labels.back}
    </Link>
  );

  if (plan.isPending) {
    return (
      <p role="status" className="flex items-center gap-2">
        <span className="spinner" aria-hidden />
        {labels.loading}
      </p>
    );
  }

  if (plan.isError) {
    return (
      <div className="flex flex-col gap-3">
        {back}
        <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
          <span>{messageForError(plan.error)}</span>
          <button type="button" className="btn btn-outline" onClick={() => void plan.refetch()}>
            {labels.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {back}
      <h2 className="text-lg font-bold text-brand">
        {plan.data.buildingName} · {plan.data.name}
      </h2>
      {canEdit ? (
        <CatalogAdminBoundary>
          {(buildings) => (
            <FloorPlanEditor
              key={plan.data.id}
              plan={plan.data}
              building={buildings.find((building) => building.id === plan.data.buildingId)}
              onDirtyChange={trackDirty}
            />
          )}
        </CatalogAdminBoundary>
      ) : (
        <>
          <p className="alert">{labels.phoneHint}</p>
          <FloorPlanViewport>
            <FloorPlanCanvas
              plan={plan.data}
              status={undefined}
              selectedResourceId={undefined}
              seatsInteractive={false}
            />
          </FloorPlanViewport>
        </>
      )}
    </div>
  );
}
