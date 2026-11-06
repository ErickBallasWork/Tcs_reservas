'use client';

import Link from 'next/link';
import { messageForCode } from '@/api/error-messages';
import { FeedbackDialog } from '@/components/shared/FeedbackDialog';
import type { BookingFeedback } from '@/features/booking/useBookingSubmit';
import { formatRange } from '@/lib/booking-time';
import { bookingLabels as labels, purposeLabels } from '@/lib/labels';
import type { ReservationDetail } from '@/api/types';

interface BookingFeedbackDialogsProps {
  feedback: BookingFeedback | null;
  onDismiss: () => void;
  onAnother: () => void;
  onClose: () => void;
}

function ReservationSummary({ reservation }: { reservation: ReservationDetail }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-[10px] border border-line bg-surface p-3 text-sm">
      <dt className="font-semibold text-ink-soft">{labels.summary.resource}</dt>
      <dd>{reservation.resource.name}</dd>
      <dt className="font-semibold text-ink-soft">{labels.summary.start}</dt>
      <dd>{formatRange(reservation.startDateTime, reservation.endDateTime)}</dd>
      <dt className="font-semibold text-ink-soft">{labels.summary.purpose}</dt>
      <dd>{purposeLabels[reservation.purpose]}</dd>
    </dl>
  );
}

export function BookingFeedbackDialogs({
  feedback,
  onDismiss,
  onAnother,
  onClose,
}: BookingFeedbackDialogsProps) {
  if (!feedback) return null;

  if (feedback.kind === 'error') {
    return (
      <FeedbackDialog
        open
        onOpenChange={(open) => !open && onDismiss()}
        variant="error"
        title={labels.errorTitle}
        description={labels.errorDescription}
        footer={
          <button type="button" className="btn btn-gold" onClick={onDismiss}>
            {labels.understood}
          </button>
        }
      >
        <div className="flex flex-col gap-2">
          {feedback.messages.map((message) => (
            <div key={message} role="alert" className="alert">
              {message}
            </div>
          ))}
        </div>
      </FeedbackDialog>
    );
  }

  if (feedback.kind === 'edited') {
    const pending = feedback.reservation.status === 'PENDING_APPROVAL';
    return (
      <FeedbackDialog
        open
        onOpenChange={(open) => !open && onClose()}
        variant="success"
        title={pending ? labels.editedPendingTitle : labels.editedTitle}
        description={pending ? labels.editedPendingDescription : labels.editedDescription}
        footer={
          <button type="button" className="btn btn-gold" onClick={onClose}>
            {labels.close}
          </button>
        }
      >
        <ReservationSummary reservation={feedback.reservation} />
      </FeedbackDialog>
    );
  }

  const another = (
    <>
      <button type="button" className="btn btn-outline" onClick={onAnother}>
        {labels.makeAnother}
      </button>
      <Link href="/my-reservations" className="btn btn-gold">
        {labels.viewMine}
      </Link>
    </>
  );

  if (feedback.kind === 'created') {
    const pending = feedback.reservation.status === 'PENDING_APPROVAL';
    return (
      <FeedbackDialog
        open
        onOpenChange={(open) => !open && onClose()}
        variant="success"
        title={pending ? labels.successPendingTitle : labels.successTitle}
        description={pending ? labels.successPendingDescription : labels.successDescription}
        footer={another}
      >
        <ReservationSummary reservation={feedback.reservation} />
      </FeedbackDialog>
    );
  }

  const { created, skipped } = feedback.result;
  const pending = created.some((reservation) => reservation.status === 'PENDING_APPROVAL');
  return (
    <FeedbackDialog
      open
      onOpenChange={(open) => !open && onClose()}
      variant="success"
      title={labels.seriesTitle(created.length)}
      description={pending ? labels.seriesPendingNote : labels.successDescription}
      footer={another}
    >
      <div className="flex flex-col gap-3">
        <ul className="flex flex-col gap-1 text-sm">
          {created.map((reservation) => (
            <li key={reservation.id}>
              {formatRange(reservation.startDateTime, reservation.endDateTime)}
            </li>
          ))}
        </ul>
        {skipped.length > 0 && (
          <div className="alert">
            <b>{labels.seriesSkipped(skipped.length)}</b>
            <ul className="mt-1 flex flex-col gap-0.5 text-sm">
              {skipped.map((occurrence) => (
                <li key={occurrence.startDateTime}>
                  {formatRange(occurrence.startDateTime, occurrence.endDateTime)} ·{' '}
                  {messageForCode(occurrence.reason)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </FeedbackDialog>
  );
}
