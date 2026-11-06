'use client';

import { STATE_SHAPE_TONE } from '@/features/floor-plans/state-styles';
import { onActivate } from '@/features/floor-plans/svg-keys';
import type { SeatSpot } from '@/lib/floor-plan/seat-layout';
import type { FloorSeat, FloorState } from '@/lib/floor-plan/types';
import { seatAriaLabel } from '@/lib/floor-plan/zone-presentation';
import { cn } from '@/lib/utils';

interface FloorSeatShapeProps {
  seat: FloorSeat;
  spot: SeatSpot;
  state: FloorState | undefined;
  interactive: boolean;
  selected: boolean;
  hatchId: string;
  onSelect: (seat: FloorSeat) => void;
}

export function FloorSeatShape({
  seat,
  spot,
  state,
  interactive,
  selected,
  hatchId,
  onSelect,
}: FloorSeatShapeProps) {
  const cx = spot.x + spot.size / 2;
  const cy = spot.y + spot.size / 2;
  const radius = spot.size / 2;
  const select = () => onSelect(seat);

  return (
    <g
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? seatAriaLabel(seat, state) : undefined}
      aria-pressed={interactive ? selected : undefined}
      aria-hidden={interactive ? undefined : true}
      onClick={interactive ? select : undefined}
      onKeyDown={interactive ? onActivate(select) : undefined}
      className={cn('group outline-none', interactive ? 'cursor-pointer' : 'pointer-events-none')}
    >
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        strokeWidth={2}
        strokeDasharray={state === 'OUT_OF_FILTER' ? '3 3' : undefined}
        fill={state === 'OCCUPIED' ? `url(#${hatchId})` : undefined}
        opacity={state === 'OUT_OF_FILTER' ? 0.55 : 1}
        className={state ? STATE_SHAPE_TONE[state] : 'fill-plan-zone stroke-plan-grid'}
      />
      {state === 'MINE' && <circle cx={cx} cy={cy} r={radius / 3} className="fill-plan-mine-ink" />}
      {state === 'OCCUPIED' && (
        <path
          d={`M${cx - radius / 2.5} ${cy - radius / 2.5}L${cx + radius / 2.5} ${cy + radius / 2.5}M${cx + radius / 2.5} ${cy - radius / 2.5}L${cx - radius / 2.5} ${cy + radius / 2.5}`}
          strokeWidth={2}
          className="stroke-plan-occupied"
        />
      )}
      {selected && (
        <circle
          cx={cx}
          cy={cy}
          r={radius + 4}
          strokeWidth={3}
          className="fill-none stroke-plan-selected"
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={radius + 7}
        strokeWidth={2}
        strokeDasharray="3 2"
        className="fill-none stroke-plan-free opacity-0 group-focus-visible:opacity-100"
      />
    </g>
  );
}
