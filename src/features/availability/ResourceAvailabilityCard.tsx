'use client';

import { messageForError } from '@/api/error-messages';
import type { CatalogResource } from '@/api/types';
import { Tag } from '@/components/shared/Tag';
import { SlotAxis, SlotRow } from '@/features/availability/SlotRow';
import { useResourceAvailability } from '@/features/availability/useAvailability';
import { dayRange } from '@/lib/booking-time';
import {
  availabilityLabels as labels,
  catalogLabels,
  catalogResourceTypeLabels,
} from '@/lib/labels';
import { buildCells, type TimeRange } from '@/lib/slot-grid';

interface ResourceAvailabilityCardProps {
  resource: CatalogResource;
  date: string;
  slotStarts: readonly string[];
  onReserve: (resourceId: string, range: TimeRange) => void;
}

export function ResourceAvailabilityCard({
  resource,
  date,
  slotStarts,
  onReserve,
}: ResourceAvailabilityCardProps) {
  const { from, to } = dayRange(date);
  const availability = useResourceAvailability(resource.id, from, to);
  const isLab = resource.type === 'AI_LAB';

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-bold text-brand">{resource.name}</h3>
      <div className="flex gap-2">
        <Tag variant={isLab ? 'gold' : 'default'}>{catalogResourceTypeLabels[resource.type]}</Tag>
        <Tag variant="dark">{catalogLabels.capacity(resource.capacity)}</Tag>
      </div>
    </div>
  );

  if (availability.isPending) {
    return (
      <div className="panel flex flex-col gap-3" aria-busy>
        {header}
        <p role="status" className="flex items-center gap-2 text-sm">
          <span className="spinner" aria-hidden />
          {labels.loading}
        </p>
      </div>
    );
  }

  if (availability.isError) {
    return (
      <div className="panel flex flex-col gap-3">
        {header}
        <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
          <span>{messageForError(availability.error)}</span>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => void availability.refetch()}
          >
            {labels.retry}
          </button>
        </div>
      </div>
    );
  }

  const data = availability.data;
  const laptopBusy = data.laptops.flatMap((laptop) => laptop.busySlots);
  const ownCells = buildCells(slotStarts, {
    busySlots: isLab ? [...data.busySlots, ...laptopBusy] : data.busySlots,
    openWindows: data.openWindows,
  });
  const reserve = (range: TimeRange) => onReserve(resource.id, range);

  return (
    <div className="panel flex flex-col gap-3">
      {header}
      <SlotAxis cells={ownCells} />
      <SlotRow
        name={isLab ? labels.labFull(resource.name) : resource.name}
        cells={ownCells}
        onPick={reserve}
      />

      {data.laptops.length > 0 && (
        <details className="flex flex-col gap-2">
          <summary className="min-h-11 cursor-pointer py-2.5 text-sm font-bold text-brand">
            {labels.laptopsToggle} ({labels.laptops(data.laptops.length)})
          </summary>
          <div className="flex flex-col gap-3 pt-1">
            {data.laptops.map((laptop) => (
              <SlotRow
                key={laptop.id}
                name={laptop.name}
                cells={buildCells(slotStarts, {
                  busySlots: laptop.busySlots,
                  lockingBusySlots: data.busySlots,
                  openWindows: laptop.openWindows,
                })}
                onPick={(range) => onReserve(laptop.id, range)}
              />
            ))}
            <small className="text-ink-soft">{labels.blockedHint}</small>
          </div>
        </details>
      )}
    </div>
  );
}
