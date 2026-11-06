'use client';

import Link from 'next/link';
import { messageForError } from '@/api/error-messages';
import { useCheckIn } from '@/features/reservations/useReservations';
import { notificationsLabels as labels } from '@/lib/labels';
import type { CardAction, CardTone, NotificationCardModel } from '@/lib/notification-cards';
import { cn } from '@/lib/utils';

interface ToneStyle {
  card: string;
  button: string;
}

const toneStyles: Record<CardTone, ToneStyle> = {
  urgent: {
    card: 'border-gold bg-gold text-brand-dark',
    button: 'bg-brand-dark text-gold hover:bg-brand',
  },
  default: {
    card: 'border-line bg-white text-ink',
    button: 'bg-brand text-white hover:bg-brand-dark',
  },
  danger: {
    card: 'border-red-300 bg-red-50 text-red-950',
    button: 'bg-red-700 text-white hover:bg-red-800',
  },
};

const PILL =
  'inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-6 font-bold whitespace-nowrap transition duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 sm:w-auto motion-reduce:transition-none motion-reduce:active:scale-100';

interface NotificationCardProps {
  card: NotificationCardModel;
  onMarkRead?: (notificationId: string) => void;
}

function CheckInAction({
  reservationId,
  label,
  className,
}: {
  reservationId: string;
  label: string;
  className: string;
}) {
  const checkIn = useCheckIn();
  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        className={className}
        disabled={checkIn.isPending}
        onClick={() => checkIn.mutate(reservationId)}
      >
        {checkIn.isPending && <span className="spinner" aria-hidden />}
        {checkIn.isPending ? labels.checkingIn : label}
      </button>
      {checkIn.isError && (
        <small role="alert" className="font-semibold">
          {messageForError(checkIn.error)}
        </small>
      )}
    </div>
  );
}

function ActionButton({
  action,
  className,
  onDone,
}: {
  action: CardAction;
  className: string;
  onDone: () => void;
}) {
  if (action.kind === 'link') {
    return (
      <Link href={action.href} className={className} onClick={onDone}>
        {action.label}
      </Link>
    );
  }
  if (action.kind === 'check-in') {
    return (
      <CheckInAction
        reservationId={action.reservationId}
        label={action.label}
        className={className}
      />
    );
  }
  return (
    <button type="button" className={className} onClick={onDone}>
      {action.label}
    </button>
  );
}

export function NotificationCard({ card, onMarkRead }: NotificationCardProps) {
  const style = toneStyles[card.tone];
  const { notificationId } = card;
  const markRead = () => {
    if (notificationId && card.unread) onMarkRead?.(notificationId);
  };
  const canMarkRead = notificationId !== null && card.unread && card.action.kind !== 'mark-read';

  return (
    <article
      aria-label={card.title}
      className={cn(
        'flex flex-col gap-2 rounded-2xl border p-4 md:p-5',
        style.card,
        !card.unread && 'opacity-80',
      )}
    >
      <p className="flex items-center gap-2 text-xs font-extrabold tracking-wide">
        <span
          aria-hidden
          className="grid size-4 shrink-0 place-items-center rounded-full border-2 border-current"
        >
          <span className={cn('size-1.5 rounded-full bg-current', !card.unread && 'opacity-0')} />
        </span>
        <span>{card.eyebrow}</span>
        {card.unread && notificationId && <span className="sr-only">{labels.unreadTag}</span>}
      </p>
      <h3 className="text-[22px] leading-tight font-extrabold md:text-2xl">{card.title}</h3>
      <p className="text-sm font-semibold break-words">{card.detail}</p>
      {card.consequence && <p className="text-sm break-words">{card.consequence}</p>}
      <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <ActionButton action={card.action} className={cn(PILL, style.button)} onDone={markRead} />
        {canMarkRead && (
          <button
            type="button"
            className="min-h-11 cursor-pointer rounded-full px-3 text-sm font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            onClick={markRead}
          >
            {labels.markRead}
          </button>
        )}
      </div>
    </article>
  );
}
