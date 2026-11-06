'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { CatalogBuilding } from '@/api/types';
import { Field } from '@/components/shared/Field';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { AvailabilityDraft } from '@/features/availability/useAvailabilityDraft';
import { TimeSelect } from '@/features/booking/BookingFields';
import { TYPE_FILTERS, type TypeFilter } from '@/lib/floor-plan/plan-window';
import { floorPlanLabels as labels } from '@/lib/labels';
import { cn } from '@/lib/utils';

interface AvailabilityFiltersProps {
  buildings: readonly CatalogBuilding[];
  draft: AvailabilityDraft;
  minDate: string;
}

function TypeChoice({
  value,
  onChange,
}: {
  value: TypeFilter;
  onChange: (type: TypeFilter) => void;
}) {
  return (
    <div role="group" aria-label={labels.type} className="flex flex-col gap-1.5">
      <span className="field-label">{labels.type}</span>
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-line bg-white p-1">
        {TYPE_FILTERS.map((type) => (
          <button
            key={type}
            type="button"
            aria-pressed={value === type}
            onClick={() => onChange(type)}
            className={cn(
              'min-h-11 rounded-md px-2 text-sm font-semibold',
              value === type ? 'bg-brand text-white' : 'text-brand hover:bg-soft',
            )}
          >
            {labels.types[type]}
          </button>
        ))}
      </div>
    </div>
  );
}

function CapacityInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Field label={labels.minCapacity}>
      <input
        className="field"
        type="number"
        inputMode="numeric"
        min={1}
        placeholder={labels.anyCapacity}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function AvailabilityFilters({ buildings, draft, minDate }: AvailabilityFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { values, patch } = draft.booking;
  const capacity = (
    <CapacityInput value={values.attendees} onChange={(attendees) => patch({ attendees })} />
  );
  const type = <TypeChoice value={draft.type} onChange={draft.setType} />;

  return (
    <div className="sticky top-0 z-20 -mx-4 flex flex-col gap-2 border-b border-line bg-surface/95 px-4 py-2 backdrop-blur md:static md:mx-0 md:rounded-xl md:border md:bg-white md:p-4">
      <div className="grid grid-cols-[1fr_auto] items-end gap-2 md:grid-cols-[repeat(3,minmax(0,1fr))] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
        <Field label={labels.building}>
          <select
            className="field"
            value={draft.buildingId}
            onChange={(event) => draft.setBuildingId(event.target.value)}
          >
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </Field>
        <button
          type="button"
          className="btn btn-outline md:hidden"
          onClick={() => setSheetOpen(true)}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          {labels.filters}
        </button>
        <div className="col-span-2 grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 md:col-span-2 lg:col-span-3">
          <Field label={labels.date}>
            <input
              className="field"
              type="date"
              min={minDate}
              value={values.startDate}
              onChange={(event) => patch({ startDate: event.target.value })}
            />
          </Field>
          <TimeSelect
            label={labels.startTime}
            value={values.startTime}
            onChange={(startTime) => patch({ startTime })}
          />
          <TimeSelect
            label={labels.endTime}
            value={values.endTime}
            onChange={(endTime) => patch({ endTime })}
          />
        </div>
      </div>
      <div className="hidden gap-3 md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {type}
        {capacity}
      </div>
      {draft.problem && (
        <p role="alert" className="text-sm font-semibold text-red-700">
          {draft.problem === 'TOO_LONG' ? labels.windowTooLong : labels.windowEndBeforeStart}
        </p>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="rounded-t-2xl">
          <SheetHeader className="text-left">
            <SheetTitle className="text-lg font-bold text-brand">{labels.filtersTitle}</SheetTitle>
            <SheetDescription className="text-ink-soft">
              {labels.filtersDescription}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4">
            {type}
            {capacity}
          </div>
          <SheetFooter>
            <button type="button" className="btn btn-gold" onClick={() => setSheetOpen(false)}>
              {labels.applyFilters}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
