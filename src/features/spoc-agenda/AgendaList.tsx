'use client';

import type { AgendaReservation, AgendaRoom } from '@/api/types';
import { AgendaTags } from '@/features/spoc-agenda/AgendaTags';
import { formatRange } from '@/lib/booking-time';
import { purposeLabels, spocAgendaLabels as labels } from '@/lib/labels';
import { canReallocate, reservationsByRoom } from '@/lib/spoc-agenda';

interface AgendaListProps {
  rooms: readonly AgendaRoom[];
  reservations: readonly AgendaReservation[];
  onReassign: (reservation: AgendaReservation) => void;
}

function AgendaCard({
  reservation,
  onReassign,
}: {
  reservation: AgendaReservation;
  onReassign: (reservation: AgendaReservation) => void;
}) {
  const movable = canReallocate(reservation);
  const range = formatRange(reservation.startDateTime, reservation.endDateTime);
  return (
    <li className="panel flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <b className="text-brand">{range}</b>
          <span className="truncate text-sm">{reservation.owner.fullName}</span>
        </div>
        <AgendaTags reservation={reservation} />
      </div>
      <div className="flex flex-col gap-0.5 text-sm">
        <span className="font-medium text-brand">
          {purposeLabels[reservation.purpose]}
          {reservation.attendees !== null && ` · ${labels.attendees(reservation.attendees)}`}
        </span>
        <span className="text-ink-soft">{reservation.justification}</span>
      </div>
      {movable ? (
        <button
          type="button"
          className="btn btn-outline"
          aria-label={labels.reassignAria(reservation.owner.fullName, range)}
          onClick={() => onReassign(reservation)}
        >
          {labels.reassign}
        </button>
      ) : (
        <small className="text-ink-soft">{labels.notMovable}</small>
      )}
    </li>
  );
}

export function AgendaList({ rooms, reservations, onReassign }: AgendaListProps) {
  const grouped = reservationsByRoom(reservations, rooms);
  return (
    <div className="flex flex-col gap-5 lg:hidden">
      {rooms.map((room) => (
        <section key={room.id} aria-labelledby={`room-${room.id}`} className="flex flex-col gap-2">
          <h2 id={`room-${room.id}`} className="flex flex-wrap items-baseline gap-2">
            <span className="text-base font-bold text-brand">{room.name}</span>
            <small className="text-ink-soft">{labels.roomCapacity(room.capacity)}</small>
          </h2>
          {grouped[room.id].length === 0 ? (
            <p className="text-sm text-ink-soft">{labels.empty}</p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {grouped[room.id].map((reservation) => (
                <AgendaCard
                  key={reservation.id}
                  reservation={reservation}
                  onReassign={onReassign}
                />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
