'use client';

import { Users } from 'lucide-react';
import { STATE_ICONS } from '@/features/floor-plans/state-styles';
import { onActivate } from '@/features/floor-plans/svg-keys';
import type { FloorZone, FloorZoneStatus } from '@/lib/floor-plan/types';
import {
  presentState,
  seatSummary,
  stateText,
  zoneAriaLabel,
  type StateTone,
} from '@/lib/floor-plan/zone-presentation';
import { floorPlanLabels as labels } from '@/lib/labels';
import { cn } from '@/lib/utils';

type ZoneTone = StateTone | 'idle';

const RECT_TONE: Record<ZoneTone, string> = {
  free: 'fill-plan-zone stroke-plan-free',
  occupied: 'stroke-plan-occupied',
  mine: 'fill-plan-mine stroke-plan-mine',
  muted: 'fill-plan-zone stroke-plan-muted-ink',
  idle: 'fill-plan-zone stroke-plan-grid',
};

const TEXT_TONE: Record<ZoneTone, string> = {
  free: 'fill-plan-zone-ink text-plan-free',
  occupied: 'fill-plan-zone-ink text-plan-occupied',
  mine: 'fill-plan-mine-ink text-plan-mine-ink',
  muted: 'fill-plan-muted-ink text-plan-muted-ink',
  idle: 'fill-plan-zone-ink text-plan-muted-ink',
};

const RADIUS = 12;

interface FloorZoneShapeProps {
  zone: FloorZone;
  status: FloorZoneStatus | undefined;
  interactive: boolean;
  selected: boolean;
  hatchId: string;
  onSelect: ((zone: FloorZone) => void) | undefined;
}

function StaticZone({ zone }: { zone: FloorZone }) {
  if (zone.kind === 'LABEL') {
    return (
      <text
        aria-hidden
        x={zone.x + zone.width / 2}
        y={zone.y + zone.height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-plan-muted-ink text-[12px] font-semibold tracking-[0.2em] uppercase"
      >
        {zone.name}
      </text>
    );
  }
  return (
    <g aria-hidden>
      <rect
        x={zone.x}
        y={zone.y}
        width={zone.width}
        height={zone.height}
        rx={RADIUS}
        strokeWidth={1}
        className="fill-plan-muted stroke-plan-grid"
      />
      <svg x={zone.x} y={zone.y} width={zone.width} height={zone.height}>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-plan-muted-ink text-[13px] font-bold tracking-wider uppercase"
        >
          {zone.name}
        </text>
      </svg>
    </g>
  );
}

function ZoneDetails({ zone, status }: { zone: FloorZone; status: FloorZoneStatus | undefined }) {
  const presentation = status ? presentState(status.state) : null;
  const Icon = presentation ? STATE_ICONS[presentation.icon] : null;
  const isLab = zone.kind === 'LAB';
  const seats = seatSummary(status);
  const stateLine = isLab || zone.height >= 84;

  return (
    <>
      <text x={12} y={22} className="text-[15px] font-bold">
        {zone.name}
      </text>
      {isLab ? (
        <text x={12} y={36} className="text-[11px] font-semibold">
          {seats ? labels.seatsFree(seats.free, seats.total) : stateText(status)}
        </text>
      ) : (
        zone.resource &&
        zone.height >= 52 && (
          <>
            <Users x={12} y={30} width={14} height={14} aria-hidden />
            <text x={30} y={42} className="text-[12px] font-semibold">
              {zone.resource.capacity}
            </text>
          </>
        )
      )}
      {Icon && !isLab && stateLine && (
        <>
          <Icon x={12} y={zone.height - 30} width={16} height={16} aria-hidden />
          <text x={32} y={zone.height - 17} className="text-[12px] font-bold">
            {stateText(status)}
          </text>
        </>
      )}
      {Icon && (isLab || !stateLine) && (
        <Icon x={zone.width - 28} y={8} width={16} height={16} aria-hidden />
      )}
    </>
  );
}

export function FloorZoneShape({
  zone,
  status,
  interactive,
  selected,
  hatchId,
  onSelect,
}: FloorZoneShapeProps) {
  if (!interactive) return <StaticZone zone={zone} />;

  const presentation = status ? presentState(status.state) : null;
  const tone: ZoneTone = presentation?.tone ?? 'idle';
  const select = onSelect ? () => onSelect(zone) : undefined;

  return (
    <g
      role={select ? 'button' : 'img'}
      tabIndex={select ? 0 : undefined}
      aria-label={zoneAriaLabel(zone, status)}
      aria-pressed={select ? selected : undefined}
      onClick={select}
      onKeyDown={select && onActivate(select)}
      className={cn('group outline-none', select && 'cursor-pointer')}
    >
      <rect
        x={zone.x}
        y={zone.y}
        width={zone.width}
        height={zone.height}
        rx={RADIUS}
        strokeWidth={2.5}
        strokeDasharray={presentation?.border === 'dashed' ? '8 6' : undefined}
        fill={presentation?.pattern === 'hatch' ? `url(#${hatchId})` : undefined}
        opacity={presentation?.dimmed ? 0.55 : 1}
        className={cn(RECT_TONE[tone], 'transition-[stroke-width] group-hover:stroke-[3.5]')}
      />
      {selected && (
        <rect
          x={zone.x - 5}
          y={zone.y - 5}
          width={zone.width + 10}
          height={zone.height + 10}
          rx={RADIUS + 4}
          strokeWidth={4}
          className="fill-none stroke-plan-selected"
        />
      )}
      <rect
        x={zone.x - 9}
        y={zone.y - 9}
        width={zone.width + 18}
        height={zone.height + 18}
        rx={RADIUS + 6}
        strokeWidth={3}
        strokeDasharray="5 4"
        className="fill-none stroke-plan-free opacity-0 group-focus-visible:opacity-100"
      />
      <svg
        x={zone.x}
        y={zone.y}
        width={zone.width}
        height={zone.height}
        opacity={presentation?.dimmed ? 0.7 : 1}
        className={TEXT_TONE[tone]}
      >
        <ZoneDetails zone={zone} status={status} />
      </svg>
    </g>
  );
}
