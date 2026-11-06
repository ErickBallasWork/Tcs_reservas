'use client';

import { useId, useMemo } from 'react';
import { FloorSeatShape } from '@/features/floor-plans/FloorSeatShape';
import { FloorZoneShape } from '@/features/floor-plans/FloorZoneShape';
import { PlanBackdrop } from '@/features/floor-plans/PlanBackdrop';
import { svgId } from '@/features/floor-plans/svg-keys';
import { layoutSeats, seatArea } from '@/lib/floor-plan/seat-layout';
import type {
  FloorPlanDetail,
  FloorPlanStatus,
  FloorSeat,
  FloorZone,
} from '@/lib/floor-plan/types';
import { isZoneInteractive, seatStates, zoneStatuses } from '@/lib/floor-plan/zone-presentation';
import { floorPlanLabels as labels } from '@/lib/labels';

interface FloorPlanCanvasProps {
  plan: FloorPlanDetail;
  status: FloorPlanStatus | undefined;
  selectedResourceId: string | undefined;
  seatsInteractive: boolean;
  onSelectZone?: (zone: FloorZone) => void;
  onSelectSeat?: (zone: FloorZone, seat: FloorSeat) => void;
}

export function FloorPlanCanvas({
  plan,
  status,
  selectedResourceId,
  seatsInteractive,
  onSelectZone,
  onSelectSeat,
}: FloorPlanCanvasProps) {
  const reactId = useId();
  const hatchId = svgId(reactId, 'hatch');
  const gridId = svgId(reactId, 'grid');
  const byZone = useMemo(() => zoneStatuses(status), [status]);
  const bySeat = useMemo(() => seatStates(status), [status]);

  const isInteractive = (zone: FloorZone) =>
    isZoneInteractive(zone) && byZone.get(zone.id)?.state !== 'NOT_RESERVABLE';
  const labs = plan.zones.filter((zone) => zone.kind === 'LAB' && isInteractive(zone));

  return (
    <svg
      viewBox={`0 0 ${plan.width} ${plan.height}`}
      role="group"
      aria-label={labels.mapTitle(plan.buildingName)}
      className="block h-auto w-full touch-none select-none"
    >
      <PlanBackdrop size={plan} hatchId={hatchId} gridId={gridId} />
      {plan.zones.map((zone) => (
        <FloorZoneShape
          key={zone.id}
          zone={zone}
          status={byZone.get(zone.id)}
          interactive={isInteractive(zone)}
          selected={zone.resourceId !== null && zone.resourceId === selectedResourceId}
          hatchId={hatchId}
          onSelect={onSelectZone}
        />
      ))}
      {labs.map((zone) => {
        const spots = layoutSeats(seatArea(zone), zone.seats.length);
        return zone.seats.map((seat, index) => (
          <FloorSeatShape
            key={seat.resourceId}
            seat={seat}
            spot={spots[index]}
            state={bySeat.get(seat.resourceId)}
            interactive={seatsInteractive && onSelectSeat !== undefined}
            selected={seat.resourceId === selectedResourceId}
            hatchId={hatchId}
            onSelect={(picked) => onSelectSeat?.(zone, picked)}
          />
        ));
      })}
    </svg>
  );
}
