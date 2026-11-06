'use client';

import { Tag } from '@/components/shared/Tag';
import { toLocal } from '@/lib/booking-time';
import { availabilityLabels as labels } from '@/lib/labels';
import { freeRanges, type GridCell, type SlotStatus, type TimeRange } from '@/lib/slot-grid';
import { cn } from '@/lib/utils';

const cellStyles: Record<SlotStatus, string> = {
  free: 'cursor-pointer bg-soft hover:bg-gold-soft',
  occupied: 'bg-brand',
  blocked: 'bg-gold-soft',
  closed: 'bg-line/50',
};

const statusLabels: Record<SlotStatus, string> = {
  free: labels.free,
  occupied: labels.occupied,
  blocked: labels.blocked,
  closed: labels.closed,
};

interface SlotRowProps {
  name: string;
  cells: readonly GridCell[];
  onPick: (range: TimeRange) => void;
}

export function SlotAxis({ cells }: { cells: readonly GridCell[] }) {
  return (
    <div
      aria-hidden
      className="hidden gap-0.5 md:grid"
      style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
    >
      {cells.map((cell) => {
        const { time } = toLocal(cell.start);
        return (
          <span key={cell.start} className="text-[10px] text-ink-soft">
            {time.endsWith(':00') ? time : ''}
          </span>
        );
      })}
    </div>
  );
}

export function SlotRow({ name, cells, onPick }: SlotRowProps) {
  const ranges = freeRanges(cells);

  return (
    <div className="flex flex-col gap-1.5">
      <b className="text-sm text-brand">{name}</b>

      <div
        className="hidden gap-0.5 md:grid"
        style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
      >
        {cells.map((cell) => {
          const { time } = toLocal(cell.start);
          return (
            <button
              key={cell.start}
              type="button"
              disabled={cell.status !== 'free'}
              aria-label={`${name} ${time}: ${statusLabels[cell.status]}`}
              title={`${time} · ${statusLabels[cell.status]}`}
              onClick={() => onPick({ start: cell.start, end: cell.end })}
              className={cn('h-8 rounded-sm', cellStyles[cell.status])}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 md:hidden">
        {ranges.length === 0 ? (
          <small className="text-ink-soft">{labels.noFreeSlots}</small>
        ) : (
          ranges.map((range) => (
            <button
              key={range.start}
              type="button"
              onClick={() => onPick(range)}
              className="min-h-11 rounded-full bg-soft px-3 text-sm font-bold text-brand"
            >
              {toLocal(range.start).time}–{toLocal(range.end).time}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function SlotLegend() {
  return (
    <div className="hidden flex-wrap items-center gap-3 md:flex">
      <Tag>{labels.free}</Tag>
      <Tag variant="dark">{labels.occupied}</Tag>
      <Tag variant="gold">{labels.blocked}</Tag>
      <Tag className="bg-line/50 text-ink-soft">{labels.closed}</Tag>
    </div>
  );
}
