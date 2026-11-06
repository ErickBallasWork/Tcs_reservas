'use client';

import { messageForError } from '@/api/error-messages';
import type { Reservation } from '@/api/types';
import { useCheckIn } from '@/features/reservations/useReservations';
import { toLocal } from '@/lib/booking-time';
import { checkInState } from '@/lib/check-in';
import { myReservationsLabels as labels } from '@/lib/labels';

interface CheckInButtonProps {
  reservation: Reservation;
  now: Date;
}

export function CheckInButton({ reservation, now }: CheckInButtonProps) {
  const checkIn = useCheckIn();
  const state = checkInState(reservation, now);
  if (state.kind === 'NOT_APPLICABLE') return null;

  const isOpen = state.kind === 'OPEN';

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        className="btn btn-gold min-h-11 w-full"
        disabled={!isOpen || checkIn.isPending}
        onClick={() => checkIn.mutate(reservation.id)}
      >
        {checkIn.isPending && <span className="spinner" aria-hidden />}
        {checkIn.isPending ? labels.checkingIn : labels.checkIn}
      </button>
      {state.kind === 'TOO_EARLY' && (
        <small className="text-ink-soft">
          {labels.checkInOpensAt(toLocal(state.opensAt).time)}
        </small>
      )}
      {checkIn.isError && (
        <small role="alert" className="text-red-700">
          {messageForError(checkIn.error)}
        </small>
      )}
    </div>
  );
}
