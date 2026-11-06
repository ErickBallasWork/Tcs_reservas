'use client';

import { useMemo, useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { AgendaReservation } from '@/api/types';
import { AgendaGrid } from '@/features/spoc-agenda/AgendaGrid';
import { AgendaList } from '@/features/spoc-agenda/AgendaList';
import { AgendaToolbar } from '@/features/spoc-agenda/AgendaToolbar';
import { ReallocateDialog } from '@/features/spoc-agenda/ReallocateDialog';
import { useSpocAgenda } from '@/features/spoc-agenda/useSpocAgenda';
import { dayRange, todayLocal } from '@/lib/booking-time';
import { spocAgendaLabels as labels } from '@/lib/labels';
import { dayWindow } from '@/lib/spoc-agenda';

export function SpocAgendaView() {
  const [date, setDate] = useState(() => todayLocal());
  const [chosenBuilding, setChosenBuilding] = useState<string>();
  const [roomId, setRoomId] = useState('');
  const [target, setTarget] = useState<AgendaReservation | null>(null);
  const [moved, setMoved] = useState(false);

  const range = useMemo(() => dayRange(date), [date]);
  const agenda = useSpocAgenda({ buildingId: chosenBuilding, ...range });
  const data = agenda.data;

  const rooms = useMemo(
    () => data?.buildings.find((building) => building.id === data.buildingId)?.rooms ?? [],
    [data],
  );
  const visibleRooms = roomId ? rooms.filter((room) => room.id === roomId) : rooms;
  const hours = useMemo(() => dayWindow(date, data?.reservations ?? []), [date, data]);

  const changeBuilding = (buildingId: string) => {
    setChosenBuilding(buildingId);
    setRoomId('');
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-ink-soft">{labels.intro}</p>

      {data && (
        <AgendaToolbar
          buildings={data.buildings}
          buildingId={data.buildingId}
          rooms={rooms}
          roomId={roomId}
          date={date}
          onBuilding={changeBuilding}
          onRoom={setRoomId}
          onDate={setDate}
        />
      )}

      {moved && (
        <div
          role="status"
          className="panel flex flex-wrap items-center justify-between gap-2 border-green-200 bg-green-50 p-3 text-sm text-green-900"
        >
          <span>{labels.moved}</span>
          <button type="button" className="btn btn-outline" onClick={() => setMoved(false)}>
            {labels.dismiss}
          </button>
        </div>
      )}

      {agenda.isPending && (
        <p role="status" className="flex items-center gap-2">
          <span className="spinner" aria-hidden />
          {labels.loading}
        </p>
      )}

      {agenda.isError && (
        <div role="alert" className="alert flex flex-wrap items-center justify-between gap-2">
          <span>{messageForError(agenda.error)}</span>
          <button type="button" className="btn btn-outline" onClick={() => void agenda.refetch()}>
            {labels.retry}
          </button>
        </div>
      )}

      {data && rooms.length === 0 && <p className="text-ink-soft">{labels.noRooms}</p>}

      {data && rooms.length > 0 && (
        <>
          <AgendaGrid
            date={date}
            hours={hours}
            rooms={rooms}
            reservations={data.reservations}
            onReassign={setTarget}
          />
          <AgendaList
            rooms={visibleRooms}
            reservations={data.reservations}
            onReassign={setTarget}
          />
        </>
      )}

      {data && target && (
        <ReallocateDialog
          reservation={target}
          buildings={data.buildings}
          onClose={() => setTarget(null)}
          onReallocated={() => {
            setTarget(null);
            setMoved(true);
          }}
        />
      )}
    </div>
  );
}
