import type { Notification, NotificationType, Reservation } from '@/api/types';
import { toLocal } from '@/lib/booking-time';
import { CHECKIN_AFTER_MIN, CHECKIN_BEFORE_MIN } from '@/lib/check-in';
import { notificationCardLabels as labels } from '@/lib/labels';

export const STARTS_SOON_LEAD_MIN = 60;
export const ENDS_SOON_LEAD_MIN = 10;

const MINUTE_MS = 60_000;

export type CardTone = 'urgent' | 'default' | 'danger';

export type CardAction =
  | { kind: 'link'; label: string; href: string }
  | { kind: 'check-in'; label: string; reservationId: string }
  | { kind: 'mark-read'; label: string };

export interface NotificationCardModel {
  key: string;
  notificationId: string | null;
  reservationId: string | null;
  tone: CardTone;
  eyebrow: string;
  title: string;
  detail: string;
  consequence: string | null;
  action: CardAction;
  unread: boolean;
}

type FeaturedTarget = Pick<Reservation, 'id' | 'status' | 'startDateTime' | 'endDateTime'> & {
  resource: Pick<Reservation['resource'], 'name'>;
};

interface FeaturedEntry {
  card: NotificationCardModel;
  sortAt: number;
}

function minutesLeft(until: number, now: number): number {
  return Math.max(1, Math.ceil((until - now) / MINUTE_MS));
}

function featuredCard(
  reservation: FeaturedTarget,
  fields: Pick<NotificationCardModel, 'tone' | 'eyebrow' | 'title' | 'detail' | 'consequence'>,
  action: CardAction,
  kind: string,
): NotificationCardModel {
  return {
    key: `${kind}-${reservation.id}`,
    notificationId: null,
    reservationId: reservation.id,
    action,
    unread: true,
    ...fields,
  };
}

function checkInOpen(reservation: FeaturedTarget, start: number, now: number) {
  const closesAt = start + CHECKIN_AFTER_MIN * MINUTE_MS;
  const from = toLocal(reservation.startDateTime).time;
  const to = toLocal(reservation.endDateTime).time;
  return featuredCard(
    reservation,
    {
      tone: 'urgent',
      eyebrow: labels.eyebrow.nextReservation,
      title: labels.checkInOpen.title,
      detail: labels.checkInOpen.detail(
        reservation.resource.name,
        from,
        to,
        minutesLeft(closesAt, now),
      ),
      consequence: labels.checkInOpen.consequence(toLocal(new Date(closesAt)).time),
    },
    { kind: 'check-in', label: labels.checkInOpen.action, reservationId: reservation.id },
    'check-in',
  );
}

function startsSoon(reservation: FeaturedTarget, start: number, now: number) {
  const opensAt = start - CHECKIN_BEFORE_MIN * MINUTE_MS;
  return featuredCard(
    reservation,
    {
      tone: 'default',
      eyebrow: labels.eyebrow.nextReservation,
      title: labels.startsSoon.title,
      detail: labels.startsSoon.detail(
        reservation.resource.name,
        toLocal(reservation.startDateTime).time,
        toLocal(reservation.endDateTime).time,
        minutesLeft(start, now),
      ),
      consequence: labels.startsSoon.consequence(toLocal(new Date(opensAt)).time),
    },
    { kind: 'link', label: labels.startsSoon.action, href: '/my-reservations' },
    'starts-soon',
  );
}

function endsSoon(reservation: FeaturedTarget, end: number, now: number) {
  const endsAt = toLocal(reservation.endDateTime).time;
  return featuredCard(
    reservation,
    {
      tone: 'default',
      eyebrow: labels.eyebrow.inProgress,
      title: labels.endsSoon.title,
      detail: labels.endsSoon.detail(reservation.resource.name, endsAt, minutesLeft(end, now)),
      consequence: labels.endsSoon.consequence(endsAt),
    },
    { kind: 'link', label: labels.endsSoon.action, href: '/my-reservations' },
    'ends-soon',
  );
}

function featuredEntry(reservation: FeaturedTarget, nowDate: Date): FeaturedEntry | null {
  const now = nowDate.getTime();
  const start = new Date(reservation.startDateTime).getTime();
  const end = new Date(reservation.endDateTime).getTime();

  if (reservation.status === 'CONFIRMED') {
    const opensAt = start - CHECKIN_BEFORE_MIN * MINUTE_MS;
    const closesAt = start + CHECKIN_AFTER_MIN * MINUTE_MS;
    if (now >= opensAt && now <= closesAt) {
      return { card: checkInOpen(reservation, start, now), sortAt: start };
    }
    if (now < opensAt && now >= start - STARTS_SOON_LEAD_MIN * MINUTE_MS) {
      return { card: startsSoon(reservation, start, now), sortAt: start };
    }
  }
  if (
    reservation.status === 'CHECKED_IN' &&
    now < end &&
    end - now <= ENDS_SOON_LEAD_MIN * MINUTE_MS
  ) {
    return { card: endsSoon(reservation, end, now), sortAt: end };
  }
  return null;
}

function urgencyRank(card: NotificationCardModel): number {
  return card.tone === 'urgent' ? 0 : 1;
}

export function featuredCards(
  reservations: readonly FeaturedTarget[],
  now: Date = new Date(),
): NotificationCardModel[] {
  return reservations
    .flatMap((reservation) => {
      const entry = featuredEntry(reservation, now);
      return entry ? [entry] : [];
    })
    .sort((a, b) => urgencyRank(a.card) - urgencyRank(b.card) || a.sortAt - b.sortAt)
    .map((entry) => entry.card);
}

interface InboxSpec {
  eyebrow: string;
  tone: CardTone;
  consequence: string | null;
  action: CardAction;
}

const link = (label: string, href: string): CardAction => ({ kind: 'link', label, href });
const understood: CardAction = { kind: 'mark-read', label: labels.actions.understood };
const viewReservation = link(labels.actions.viewReservation, '/my-reservations');
const reviewApproval = link(labels.actions.reviewRequest, '/leader/inbox');

const inboxSpecs: Record<NotificationType, InboxSpec> = {
  ACCESS_REQUEST: {
    eyebrow: labels.eyebrow.accessRequest,
    tone: 'default',
    consequence: labels.consequences.accessRequest,
    action: link(labels.actions.reviewRequest, '/admin/access-requests'),
  },
  APPROVAL_REALLOCATED: {
    eyebrow: labels.eyebrow.toApprove,
    tone: 'default',
    consequence: null,
    action: reviewApproval,
  },
  APPROVAL_REQUESTED: {
    eyebrow: labels.eyebrow.toApprove,
    tone: 'default',
    consequence: labels.consequences.approvalRequested,
    action: reviewApproval,
  },
  NO_SHOW_NO_SANCTION: {
    eyebrow: labels.eyebrow.noShow,
    tone: 'default',
    consequence: null,
    action: understood,
  },
  NO_SHOW_SANCTION: {
    eyebrow: labels.eyebrow.noShow,
    tone: 'danger',
    consequence: null,
    action: understood,
  },
  RESERVATION_APPROVED: {
    eyebrow: labels.eyebrow.leaderAnswer,
    tone: 'default',
    consequence: null,
    action: viewReservation,
  },
  RESERVATION_CONFIRMED: {
    eyebrow: labels.eyebrow.yourReservation,
    tone: 'default',
    consequence: null,
    action: viewReservation,
  },
  RESERVATION_PENDING: {
    eyebrow: labels.eyebrow.yourReservation,
    tone: 'default',
    consequence: null,
    action: viewReservation,
  },
  RESERVATION_REALLOCATED: {
    eyebrow: labels.eyebrow.reservationChange,
    tone: 'urgent',
    consequence: null,
    action: viewReservation,
  },
  RESERVATION_REJECTED: {
    eyebrow: labels.eyebrow.leaderAnswer,
    tone: 'danger',
    consequence: labels.consequences.rejected,
    action: link(labels.actions.bookAgain, '/availability'),
  },
  RESERVATION_REMINDER: {
    eyebrow: labels.eyebrow.nextReservation,
    tone: 'urgent',
    consequence: null,
    action: viewReservation,
  },
  RESERVATION_UPDATED: {
    eyebrow: labels.eyebrow.yourReservation,
    tone: 'default',
    consequence: null,
    action: viewReservation,
  },
  SANCTION_RESOLVED: {
    eyebrow: labels.eyebrow.sanction,
    tone: 'default',
    consequence: null,
    action: link(labels.actions.book, '/availability'),
  },
  TRAINING_EXPIRED: {
    eyebrow: labels.eyebrow.expiredRequest,
    tone: 'danger',
    consequence: labels.consequences.expired,
    action: link(labels.actions.bookAgain, '/availability'),
  },
};

export function inboxCard(notification: Notification): NotificationCardModel {
  const spec = inboxSpecs[notification.type];
  return {
    key: notification.id,
    notificationId: notification.id,
    reservationId: notification.reservationId,
    tone: spec.tone,
    eyebrow: spec.eyebrow,
    title: notification.title,
    detail: notification.message,
    consequence: spec.consequence,
    action: spec.action,
    unread: !notification.isRead,
  };
}

export function withoutFeaturedReminders(
  notifications: readonly Notification[],
  featured: readonly NotificationCardModel[],
): Notification[] {
  const shown = new Set(featured.map((card) => card.reservationId));
  return notifications.filter(
    (notification) =>
      notification.type !== 'RESERVATION_REMINDER' ||
      notification.reservationId === null ||
      !shown.has(notification.reservationId),
  );
}
