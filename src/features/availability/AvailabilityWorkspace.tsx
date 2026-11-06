'use client';

import { List, Map as MapIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CatalogBuilding } from '@/api/types';
import { AvailabilityFilters } from '@/features/availability/AvailabilityFilters';
import { AvailabilityList } from '@/features/availability/AvailabilityList';
import { useAvailabilityDraft } from '@/features/availability/useAvailabilityDraft';
import { FloorPlanWorkspace } from '@/features/floor-plans/FloorPlanWorkspace';
import { useFloorPlans } from '@/features/floor-plans/useFloorPlans';
import { floorPlanLabels as labels } from '@/lib/labels';
import { bookableResources } from '@/lib/resource-options';
import { cn } from '@/lib/utils';

type ViewMode = 'plan' | 'list';

interface AvailabilityWorkspaceProps {
  buildings: CatalogBuilding[];
  firstDate: string;
  isSanctioned: boolean;
}

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (mode: ViewMode) => void }) {
  const options = [
    { mode: 'plan' as const, label: labels.plan, Icon: MapIcon },
    { mode: 'list' as const, label: labels.list, Icon: List },
  ];
  return (
    <div
      role="group"
      aria-label={labels.view}
      className="inline-grid grid-cols-2 gap-1 self-start rounded-lg border border-line bg-white p-1"
    >
      {options.map(({ mode, label, Icon }) => (
        <button
          key={mode}
          type="button"
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className={cn(
            'flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold',
            value === mode ? 'bg-brand text-white' : 'text-brand hover:bg-soft',
          )}
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

export function AvailabilityWorkspace({
  buildings,
  firstDate,
  isSanctioned,
}: AvailabilityWorkspaceProps) {
  const resources = useMemo(() => bookableResources(buildings), [buildings]);
  const draft = useAvailabilityDraft(resources, firstDate, buildings[0].id);
  const plans = useFloorPlans();
  const [mode, setMode] = useState<ViewMode | null>(null);

  const building = buildings.find((candidate) => candidate.id === draft.buildingId);
  const plan = plans.data?.find((candidate) => candidate.buildingId === draft.buildingId);
  const effectiveMode: ViewMode = mode ?? (plan ? 'plan' : 'list');

  return (
    <div className="flex flex-col gap-3">
      <AvailabilityFilters buildings={buildings} draft={draft} minDate={firstDate} />
      {plans.isPending ? (
        <p role="status" className="flex items-center gap-2">
          <span className="spinner" aria-hidden />
          {labels.loading}
        </p>
      ) : (
        <>
          <ViewToggle value={effectiveMode} onChange={setMode} />
          {effectiveMode === 'list' && (
            <AvailabilityList
              building={building}
              draft={draft}
              firstDate={firstDate}
              isSanctioned={isSanctioned}
            />
          )}
          {effectiveMode === 'plan' &&
            (plan ? (
              <FloorPlanWorkspace planId={plan.id} draft={draft} isSanctioned={isSanctioned} />
            ) : (
              <p className="text-ink-soft">{labels.noPlan}</p>
            ))}
        </>
      )}
    </div>
  );
}
