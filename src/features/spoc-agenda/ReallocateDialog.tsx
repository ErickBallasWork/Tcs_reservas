'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { AgendaBuilding, AgendaReservation } from '@/api/types';
import { Field } from '@/components/shared/Field';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { TimeSelect } from '@/features/booking/BookingFields';
import { useReallocateReservation } from '@/features/spoc-agenda/useSpocAgenda';
import { formatRange, todayLocal } from '@/lib/booking-time';
import { purposeLabels, reallocationLabels as labels } from '@/lib/labels';
import {
  checkReallocation,
  initialReallocationValues,
  instantsOfReallocation,
  MAX_JUSTIFICATION_LENGTH,
  toReallocateBody,
  type ReallocationProblem,
  type ReallocationValues,
} from '@/lib/reallocation-form';

const BLOCKING_PROBLEMS: readonly ReallocationProblem[] = [
  'ATTENDEES_EXCEED_CAPACITY',
  'END_NOT_AFTER_START',
  'JUSTIFICATION_TOO_LONG',
];

interface ReallocateDialogProps {
  reservation: AgendaReservation;
  buildings: readonly AgendaBuilding[];
  onClose: () => void;
  onReallocated: () => void;
}

export function ReallocateDialog({
  reservation,
  buildings,
  onClose,
  onReallocated,
}: ReallocateDialogProps) {
  const [values, setValues] = useState<ReallocationValues>(() =>
    initialReallocationValues(reservation),
  );
  const mutation = useReallocateReservation();

  const rooms = buildings.flatMap((building) => building.rooms);
  const currentRoom = rooms.find((room) => room.id === reservation.resourceId);
  const selectedRoom = rooms.find((room) => room.id === values.roomId);
  const problem = checkReallocation(values, reservation, selectedRoom);
  const after = instantsOfReallocation(values);
  const update = (patch: Partial<ReallocationValues>) =>
    setValues((previous) => ({ ...previous, ...patch }));

  const handleSubmit = () => {
    if (problem !== null || mutation.isPending) return;
    mutation.mutate(
      { id: reservation.id, body: toReallocateBody(values, reservation) },
      { onSuccess: onReallocated },
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] gap-4 overflow-y-auto rounded-[14px] p-5 sm:max-w-[560px] sm:p-6">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-lg font-bold text-brand">{labels.title}</DialogTitle>
          <DialogDescription>{labels.description(reservation.owner.fullName)}</DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <div className="rounded-[10px] border border-line bg-surface p-3 text-sm">
            <b className="text-brand">{labels.current}</b>
            <p>
              {currentRoom?.name} ·{' '}
              {formatRange(reservation.startDateTime, reservation.endDateTime)}
            </p>
            <p className="text-ink-soft">
              {purposeLabels[reservation.purpose]} · {reservation.owner.fullName}
            </p>
          </div>

          <Field label={labels.newRoom}>
            <select
              className="field"
              value={values.roomId}
              onChange={(event) => update({ roomId: event.target.value })}
            >
              {buildings.map((building) => (
                <optgroup key={building.id} label={building.name}>
                  {building.rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {labels.roomOption(room.name, room.capacity)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={labels.startDate}>
              <input
                className="field"
                type="date"
                min={todayLocal()}
                value={values.startDate}
                onChange={(event) => update({ startDate: event.target.value })}
              />
            </Field>
            <TimeSelect
              label={labels.startTime}
              value={values.startTime}
              onChange={(startTime) => update({ startTime })}
            />
            <Field label={labels.endDate}>
              <input
                className="field"
                type="date"
                min={values.startDate}
                value={values.endDate}
                onChange={(event) => update({ endDate: event.target.value })}
              />
            </Field>
            <TimeSelect
              label={labels.endTime}
              value={values.endTime}
              onChange={(endTime) => update({ endTime })}
            />
          </div>

          <label className="field-label">
            {labels.justification}
            <Textarea
              value={values.justification}
              maxLength={MAX_JUSTIFICATION_LENGTH + 100}
              rows={3}
              aria-required
              onChange={(event) => update({ justification: event.target.value })}
            />
            <span className="flex justify-between gap-2 text-xs font-normal text-ink-soft">
              <span>{labels.justificationHint}</span>
              <span>{labels.counter(values.justification.length, MAX_JUSTIFICATION_LENGTH)}</span>
            </span>
          </label>

          <dl className="grid gap-1 rounded-[10px] bg-soft p-3 text-sm">
            <div className="flex gap-2">
              <dt className="font-bold text-brand">{labels.before}:</dt>
              <dd>
                {currentRoom?.name} ·{' '}
                {formatRange(reservation.startDateTime, reservation.endDateTime)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-bold text-brand">{labels.after}:</dt>
              <dd>
                {selectedRoom?.name} · {formatRange(after.start, after.end)}
              </dd>
            </div>
          </dl>

          <ul className="flex flex-col gap-1 text-xs text-ink-soft">
            <li>{labels.noAdvanceNote}</li>
            {reservation.status === 'PENDING_APPROVAL' && <li>{labels.pendingNote}</li>}
            {reservation.seriesId && <li>{labels.seriesNote}</li>}
          </ul>

          {problem !== null && (
            <p
              role={BLOCKING_PROBLEMS.includes(problem) ? 'alert' : 'status'}
              className={
                BLOCKING_PROBLEMS.includes(problem)
                  ? 'text-sm font-semibold text-red-700'
                  : 'text-sm text-ink-soft'
              }
            >
              {labels.problems[problem]}
            </p>
          )}
          {mutation.isError && (
            <p role="alert" className="font-semibold text-red-700">
              {messageForError(mutation.error)}
            </p>
          )}

          <DialogFooter className="gap-2 sm:flex-row-reverse">
            <button
              type="submit"
              className="btn btn-gold"
              disabled={problem !== null || mutation.isPending}
            >
              {mutation.isPending ? labels.saving : labels.submit}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              {labels.cancel}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
