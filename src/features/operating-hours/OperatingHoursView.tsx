'use client';

import { useMemo, useState } from 'react';
import { messageForError } from '@/api/error-messages';
import { Field } from '@/components/shared/Field';
import { CatalogAdminBoundary } from '@/features/catalog/admin/CatalogAdminBoundary';
import { ClosedDatesPanel } from '@/features/operating-hours/ClosedDatesPanel';
import { WeeklyScheduleEditor } from '@/features/operating-hours/WeeklyScheduleEditor';
import { useOperatingHours } from '@/features/operating-hours/useOperatingHours';
import { operatingHoursLabels as labels } from '@/lib/labels';
import type { CatalogBuilding } from '@/api/types';

function scopeOptions(buildings: readonly CatalogBuilding[]) {
  return buildings.flatMap((building) =>
    building.resources.flatMap((resource) => [
      { id: resource.id, label: `${resource.name} · ${building.name}` },
      ...resource.children.map((laptop) => ({
        id: laptop.id,
        label: `${laptop.name} · ${resource.name}`,
      })),
    ]),
  );
}

function ScheduleScope({ buildings }: { buildings: readonly CatalogBuilding[] }) {
  const scopes = useMemo(() => scopeOptions(buildings), [buildings]);
  const [resourceId, setResourceId] = useState('');
  const hours = useOperatingHours(resourceId || undefined);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <Field label={labels.scope}>
          <select
            className="field"
            value={resourceId}
            onChange={(event) => setResourceId(event.target.value)}
          >
            <option value="">{labels.global}</option>
            {scopes.map((scope) => (
              <option key={scope.id} value={scope.id}>
                {scope.label}
              </option>
            ))}
          </select>
        </Field>

        {hours.isPending && (
          <p role="status" className="flex items-center gap-2">
            <span className="spinner" aria-hidden />
            {labels.loading}
          </p>
        )}
        {hours.isError && (
          <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
            <span>{messageForError(hours.error)}</span>
            <button type="button" className="btn btn-outline" onClick={() => void hours.refetch()}>
              {labels.retry}
            </button>
          </div>
        )}
        {hours.data && (
          <>
            <p className="text-sm text-ink-soft">{labels.source[hours.data.source]}</p>
            <WeeklyScheduleEditor
              key={`${resourceId}-${JSON.stringify(hours.data.windows)}`}
              scopeResourceId={resourceId || undefined}
              current={hours.data}
            />
          </>
        )}
      </section>

      <ClosedDatesPanel scopes={scopes} />
    </div>
  );
}

export function OperatingHoursView() {
  return (
    <CatalogAdminBoundary>
      {(buildings) => <ScheduleScope buildings={buildings} />}
    </CatalogAdminBoundary>
  );
}
