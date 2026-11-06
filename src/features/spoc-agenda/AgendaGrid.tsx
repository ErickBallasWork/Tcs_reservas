'use client';

import type { AgendaReservation, AgendaRoom } from '@/api/types';
import { toLocal } from '@/lib/booking-time';
import { purposeLabels, reservationStatusLabels, spocAgendaLabels as labels } from '@/lib/labels';
import {
  blockPlacement,
  canReallocate,
  formatHour,
  hourMarks,
  reservationsByRoom,
  type DayWindow,
} from '@/lib/spoc-agenda';
import { cn } from '@/lib/utils';

const HOUR_HEIGHT_PX = 56;
const HEADER_HEIGHT_CLASS = 'h-12';

interface AgendaGridProps {
  date: string;
  hours: DayWindow;
  rooms: readonly AgendaRoom[];
  reservations: readonly AgendaReservation[];
  onReassign: (reservation: AgendaReservation) => void;
}

function blockTone(reservation: AgendaReservation, movable: boolean): string {
  if (!movable) return 'border-line bg-surface text-ink-soft';
  if (reservation.status === 'PENDING_APPROVAL') {
    return 'border-gold bg-gold-soft text-gold-ink hover:brightness-95';
  }
  return 'border-brand/40 bg-soft text-brand hover:bg-white';
}

function GridBlock({
  date,
  hours,
  reservation,
  onReassign,
}: {
  date: string;
  hours: DayWindow;
  reservation: AgendaReservation;
  onReassign: (reservation: AgendaReservation) => void;
}) {
  const placement = blockPlacement(date, reservation, hours);
  if (!placement) return null;
  const movable = canReallocate(reservation);
  const start = toLocal(reservation.startDateTime).time;
  const end = toLocal(reservation.endDateTime).time;
  const range = `${start}–${end}`;
  const summary = [
    reservation.owner.fullName,
    range,
    purposeLabels[reservation.purpose],
    reservationStatusLabels[reservation.status],
    reservation.reallocated ? labels.reallocated : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const className = cn(
    'absolute inset-x-1 flex min-h-7 flex-col overflow-hidden rounded-md border px-2 py-1 text-left text-xs leading-tight transition',
    blockTone(reservation, movable),
  );
  const style = { top: `${placement.top}%`, height: `${placement.height}%` };
  const content = (
    <>
      <b className="truncate">{reservation.owner.fullName}</b>
      <span className="truncate">
        {range}
        {reservation.reallocated && ` · ${labels.reallocated}`}
      </span>
    </>
  );

  if (!movable) {
    return (
      <div className={className} style={style} title={summary}>
        {content}
      </div>
    );
  }
  return (
    <button
      type="button"
      className={cn(
        className,
        'cursor-pointer focus-visible:outline-2 focus-visible:outline-brand',
      )}
      style={style}
      title={summary}
      aria-label={labels.reassignAria(reservation.owner.fullName, summary)}
      onClick={() => onReassign(reservation)}
    >
      {content}
    </button>
  );
}

export function AgendaGrid({ date, hours, rooms, reservations, onReassign }: AgendaGridProps) {
  const marks = hourMarks(hours);
  const grouped = reservationsByRoom(reservations, rooms);
  const bodyHeight = marks.length * HOUR_HEIGHT_PX;
  return (
    <div
      role="group"
      aria-label={labels.gridLabel}
      className="panel hidden overflow-x-auto p-0 lg:block"
    >
      <div className="flex min-w-max">
        <div className="sticky left-0 z-10 w-16 shrink-0 border-r border-line bg-white">
          <div className={cn(HEADER_HEIGHT_CLASS, 'border-b border-line')} />
          <div className="relative" style={{ height: bodyHeight }}>
            {marks.map((minute, index) => (
              <span
                key={minute}
                className="absolute right-2 -translate-y-1/2 text-xs text-ink-soft"
                style={{ top: index * HOUR_HEIGHT_PX }}
              >
                {formatHour(minute)}
              </span>
            ))}
          </div>
        </div>
        {rooms.map((room) => (
          <div key={room.id} className="w-52 shrink-0 border-r border-line last:border-r-0">
            <div
              className={cn(
                HEADER_HEIGHT_CLASS,
                'flex flex-col justify-center border-b border-line px-3',
              )}
            >
              <b className="truncate text-sm text-brand">{room.name}</b>
              <small className="text-ink-soft">{labels.roomCapacity(room.capacity)}</small>
            </div>
            <div className="relative" style={{ height: bodyHeight }}>
              {marks.map((minute, index) => (
                <div
                  key={minute}
                  aria-hidden
                  className="absolute inset-x-0 border-t border-line/70"
                  style={{ top: index * HOUR_HEIGHT_PX }}
                />
              ))}
              {grouped[room.id].map((reservation) => (
                <GridBlock
                  key={reservation.id}
                  date={date}
                  hours={hours}
                  reservation={reservation}
                  onReassign={onReassign}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
