'use client';

import { Users } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { STATE_ICONS } from '@/features/floor-plans/state-styles';
import type { FloorState, FloorZone, FloorZoneStatus } from '@/lib/floor-plan/types';
import { presentState, seatSummary, stateText } from '@/lib/floor-plan/zone-presentation';
import { floorPlanLabels as labels, floorStateLabels, floorStateReasonLabels } from '@/lib/labels';
import { cn } from '@/lib/utils';

interface ZoneSheetProps {
  zone: FloorZone | null;
  status: FloorZoneStatus | undefined;
  seatStates: ReadonlyMap<string, FloorState>;
  blocked: boolean;
  onReserve: (resourceId: string) => void;
  onClose: () => void;
}

function StateLine({ status }: { status: FloorZoneStatus | undefined }) {
  if (!status) return null;
  const presentation = presentState(status.state);
  const Icon = STATE_ICONS[presentation.icon];
  const text =
    status.state === 'OUT_OF_FILTER' && status.reason
      ? labels.outOfFilter(floorStateReasonLabels[status.reason])
      : stateText(status);
  return (
    <span className="flex items-center gap-1.5 font-semibold text-ink">
      {Icon && <Icon className="size-4" aria-hidden />}
      {text}
    </span>
  );
}

function SeatPicker({
  zone,
  seatStates,
  blocked,
  onReserve,
}: {
  zone: FloorZone;
  seatStates: ReadonlyMap<string, FloorState>;
  blocked: boolean;
  onReserve: (resourceId: string) => void;
}) {
  if (zone.seats.length === 0) return <p className="text-sm text-ink-soft">{labels.noSeats}</p>;
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-bold text-brand">{labels.pickSeat}</legend>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {zone.seats.map((seat) => {
          const state = seatStates.get(seat.resourceId);
          const free = state === 'FREE';
          const Icon = state ? STATE_ICONS[presentState(state).icon] : null;
          return (
            <li key={seat.resourceId}>
              <button
                type="button"
                disabled={!free || blocked}
                onClick={() => onReserve(seat.resourceId)}
                className={cn(
                  'flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm font-semibold',
                  free
                    ? 'border-brand bg-white text-brand hover:bg-soft'
                    : 'border-line bg-surface text-ink-soft',
                )}
              >
                <span className="truncate">{seat.name}</span>
                <span className="flex items-center gap-1 text-xs">
                  {Icon && <Icon className="size-3.5" aria-hidden />}
                  {state ? floorStateLabels[state] : ''}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

export function ZoneSheet({
  zone,
  status,
  seatStates,
  blocked,
  onReserve,
  onClose,
}: ZoneSheetProps) {
  const free = status?.state === 'FREE';
  const isLab = zone?.kind === 'LAB';
  const seats = seatSummary(status);

  return (
    <Sheet open={zone !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[85dvh] gap-0 overflow-y-auto rounded-t-2xl"
      >
        {zone && (
          <>
            <SheetHeader className="gap-1.5 text-left">
              <SheetTitle className="text-lg font-bold text-brand">{zone.name}</SheetTitle>
              <SheetDescription asChild>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
                  <StateLine status={status} />
                  {isLab && seats ? (
                    <span>{labels.seatsFreeLong(seats.free, seats.total)}</span>
                  ) : (
                    zone.resource && (
                      <span className="flex items-center gap-1.5">
                        <Users className="size-4" aria-hidden />
                        {labels.people(zone.resource.capacity)}
                      </span>
                    )
                  )}
                </div>
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-4 px-4">
              {blocked && <p className="alert">{labels.sanctioned}</p>}
              {!free && status && <p className="text-sm text-ink-soft">{labels.notAvailable}</p>}
              {isLab && (
                <SeatPicker
                  zone={zone}
                  seatStates={seatStates}
                  blocked={blocked}
                  onReserve={onReserve}
                />
              )}
            </div>

            <SheetFooter className="sm:flex-row-reverse">
              {zone.resourceId && free && (
                <button
                  type="button"
                  className="btn btn-gold"
                  disabled={blocked}
                  onClick={() => zone.resourceId && onReserve(zone.resourceId)}
                >
                  {isLab ? labels.reserveLab : labels.reserve}
                </button>
              )}
              <button type="button" className="btn btn-outline" onClick={onClose}>
                {labels.close}
              </button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
