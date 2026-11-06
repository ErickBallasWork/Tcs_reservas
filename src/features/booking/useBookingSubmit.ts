import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type {
  CreateReservationBody,
  CreateSeriesBody,
  Reservation,
  ReservationDetail,
  SeriesCreated,
  UpdateReservationBody,
} from '@/api/types';
import {
  useCreateReservation,
  useCreateSeries,
  usePreviewSeries,
  useUpdateReservation,
} from '@/features/reservations/useReservations';

export type BookingFeedback =
  | { kind: 'error'; messages: string[] }
  | { kind: 'created'; reservation: ReservationDetail }
  | { kind: 'edited'; reservation: ReservationDetail }
  | { kind: 'series'; result: SeriesCreated };

export function useBookingSubmit(editing: Reservation | undefined) {
  const create = useCreateReservation();
  const update = useUpdateReservation();
  const createSeries = useCreateSeries();
  const preview = usePreviewSeries();
  const [feedback, setFeedback] = useState<BookingFeedback | null>(null);

  const fail = (error: unknown) =>
    setFeedback({ kind: 'error', messages: [messageForError(error)] });

  return {
    feedback,
    clearFeedback: () => setFeedback(null),
    reject: (messages: string[]) => setFeedback({ kind: 'error', messages }),
    isPending: create.isPending || update.isPending || createSeries.isPending,
    preview,
    create: (body: CreateReservationBody) =>
      create.mutate(body, {
        onSuccess: (reservation) => setFeedback({ kind: 'created', reservation }),
        onError: fail,
      }),
    createSeries: (body: CreateSeriesBody) =>
      createSeries.mutate(body, {
        onSuccess: (result) => setFeedback({ kind: 'series', result }),
        onError: fail,
      }),
    update: (body: UpdateReservationBody) => {
      if (!editing) return;
      update.mutate(
        { id: editing.id, body },
        {
          onSuccess: (reservation) => setFeedback({ kind: 'edited', reservation }),
          onError: fail,
        },
      );
    },
  };
}
