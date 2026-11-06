'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { CatalogBuilding } from '@/api/types';
import { Tag } from '@/components/shared/Tag';
import { CatalogAdminBoundary } from '@/features/catalog/admin/CatalogAdminBoundary';
import { CreateFloorPlanDialog } from '@/features/floor-plans/admin/CreateFloorPlanDialog';
import { editorHref } from '@/features/floor-plans/admin/routes';
import { useFloorPlans } from '@/features/floor-plans/useFloorPlans';
import { floorPlanAdminLabels as labels } from '@/lib/labels';

function PlansByBuilding({ buildings }: { buildings: CatalogBuilding[] }) {
  const plans = useFloorPlans(true);
  const router = useRouter();
  const [creatingFor, setCreatingFor] = useState<CatalogBuilding | null>(null);
  const active = buildings.filter((building) => building.isActive);

  if (plans.isPending) {
    return (
      <p role="status" className="flex items-center gap-2">
        <span className="spinner" aria-hidden />
        {labels.loading}
      </p>
    );
  }

  if (plans.isError) {
    return (
      <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
        <span>{messageForError(plans.error)}</span>
        <button type="button" className="btn btn-outline" onClick={() => void plans.refetch()}>
          {labels.retry}
        </button>
      </div>
    );
  }

  if (active.length === 0) return <p className="text-ink-soft">{labels.noBuildings}</p>;

  return (
    <>
      <ul className="grid gap-3 md:grid-cols-2">
        {active.map((building) => {
          const plan = plans.data.find((candidate) => candidate.buildingId === building.id);
          return (
            <li key={building.id} className="panel flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{building.name}</h2>
                  <p className="truncate text-sm text-ink-soft">
                    {plan
                      ? `${plan.name} · ${labels.size(plan.width, plan.height)}`
                      : labels.noPlan}
                  </p>
                </div>
                {plan && !plan.isActive && <Tag variant="gold">{labels.inactive}</Tag>}
              </div>
              {plan ? (
                <Link href={editorHref(plan.id)} className="btn btn-gold self-start">
                  {labels.edit}
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline self-start"
                  onClick={() => setCreatingFor(building)}
                >
                  {labels.createPlan}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {creatingFor && (
        <CreateFloorPlanDialog
          building={creatingFor}
          onClose={() => setCreatingFor(null)}
          onCreated={(plan) => router.push(editorHref(plan.id))}
        />
      )}
    </>
  );
}

export function FloorPlansList() {
  return (
    <CatalogAdminBoundary>
      {(buildings) => <PlansByBuilding buildings={buildings} />}
    </CatalogAdminBoundary>
  );
}
