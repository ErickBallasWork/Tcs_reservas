'use client';

import { useState } from 'react';
import { messageForError } from '@/api/error-messages';
import type { Reservation } from '@/api/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCancelReservation, useCancelSeries } from '@/features/reservations/useReservations';
import { formatRange } from '@/lib/booking-time';
import { myReservationsLabels as labels } from '@/lib/labels';
import { seriesPosition } from '@/lib/reservation-actions';

interface CancelReservationDialogProps {
  reservation: Reservation;
  onClose: () => void;
}

export function CancelReservationDialog({ reservation, onClose }: CancelReservationDialogProps) {
  const cancelOne = useCancelReservation();
  const cancelAll = useCancelSeries();
  const [seriesResult, setSeriesResult] = useState<{ cancelled: number; kept: number } | null>(
    null,
  );
  const position = seriesPosition(reservation);
  const error = cancelOne.error ?? cancelAll.error;
  const isPending = cancelOne.isPending || cancelAll.isPending;

  const handleCancelSeries = () => {
    if (!reservation.series) return;
    cancelAll.mutate(reservation.series.id, {
      onSuccess: (result) => setSeriesResult({ cancelled: result.cancelled, kept: result.kept }),
    });
  };

  if (seriesResult) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="gap-4 rounded-[14px] p-6 sm:max-w-[480px]">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-bold text-brand">
              {labels.seriesCancelled}
            </DialogTitle>
            <DialogDescription className="text-ink-soft">
              {labels.seriesCancelledSummary(seriesResult.cancelled, seriesResult.kept)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button" className="btn btn-gold" onClick={onClose}>
              {labels.close}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-4 rounded-[14px] p-6 sm:max-w-[480px]">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-brand">{labels.cancelTitle}</DialogTitle>
          <DialogDescription className="text-ink-soft">
            {reservation.resource.name} ·{' '}
            {formatRange(reservation.startDateTime, reservation.endDateTime)}
          </DialogDescription>
        </DialogHeader>
        {position && (
          <p className="text-sm text-ink-soft">{labels.cancelSeriesHint(position.total)}</p>
        )}
        {error !== null && (
          <p role="alert" className="font-semibold text-red-700">
            {messageForError(error)}
          </p>
        )}
        <DialogFooter className="gap-2 sm:flex-col-reverse sm:items-stretch">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            {labels.keep}
          </button>
          {position && (
            <button
              type="button"
              className="btn btn-outline"
              disabled={isPending}
              onClick={handleCancelSeries}
            >
              {cancelAll.isPending ? labels.cancelling : labels.cancelSeries}
            </button>
          )}
          <button
            type="button"
            className="btn btn-gold"
            disabled={isPending}
            onClick={() => cancelOne.mutate(reservation.id, { onSuccess: onClose })}
          >
            {cancelOne.isPending
              ? labels.cancelling
              : position
                ? labels.cancelOnlyThis
                : labels.cancelConfirm}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
