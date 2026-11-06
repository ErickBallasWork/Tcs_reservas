'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AgendaBuilding, AgendaRoom } from '@/api/types';
import { Field } from '@/components/shared/Field';
import { addDaysToDate, todayLocal } from '@/lib/booking-time';
import { spocAgendaLabels as labels } from '@/lib/labels';

interface AgendaToolbarProps {
  buildings: readonly AgendaBuilding[];
  buildingId: string;
  rooms: readonly AgendaRoom[];
  roomId: string;
  date: string;
  onBuilding: (buildingId: string) => void;
  onRoom: (roomId: string) => void;
  onDate: (date: string) => void;
}

export function AgendaToolbar({
  buildings,
  buildingId,
  rooms,
  roomId,
  date,
  onBuilding,
  onRoom,
  onDate,
}: AgendaToolbarProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
      {buildings.length > 1 ? (
        <Field label={labels.building}>
          <select
            className="field"
            value={buildingId}
            onChange={(event) => onBuilding(event.target.value)}
          >
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <p className="text-base font-bold text-brand">{buildings[0]?.name}</p>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          className="btn btn-outline px-3"
          aria-label={labels.previousDay}
          onClick={() => onDate(addDaysToDate(date, -1))}
        >
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <Field label={labels.day}>
            <input
              className="field"
              type="date"
              value={date}
              onChange={(event) => event.target.value && onDate(event.target.value)}
            />
          </Field>
        </div>
        <button
          type="button"
          className="btn btn-outline px-3"
          aria-label={labels.nextDay}
          onClick={() => onDate(addDaysToDate(date, 1))}
        >
          <ChevronRight aria-hidden className="size-5" />
        </button>
        <button type="button" className="btn btn-outline" onClick={() => onDate(todayLocal())}>
          {labels.today}
        </button>
      </div>

      {rooms.length > 1 && (
        <div className="lg:hidden">
          <Field label={labels.room}>
            <select
              className="field"
              value={roomId}
              onChange={(event) => onRoom(event.target.value)}
            >
              <option value="">{labels.allRooms}</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}
    </div>
  );
}
