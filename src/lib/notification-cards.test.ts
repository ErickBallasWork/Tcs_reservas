import { describe, expect, it } from 'vitest';
import type { Notification, NotificationType } from '@/api/types';
import { featuredCards, inboxCard, withoutFeaturedReminders } from '@/lib/notification-cards';

const START = '2026-11-11T15:00:00Z';
const END = '2026-11-11T16:00:00Z';

function reservation(overrides: Record<string, unknown> = {}) {
  return {
    id: 'res-1',
    status: 'CONFIRMED' as const,
    startDateTime: START,
    endDateTime: END,
    resource: { name: 'Sala Board' },
    ...overrides,
  };
}

function at(iso: string) {
  return new Date(iso);
}

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n-1',
    type: 'RESERVATION_CONFIRMED',
    title: 'Reserva confirmada',
    message: 'Tu reserva quedó confirmada.',
    isRead: false,
    createdAt: '2026-11-10T12:00:00Z',
    reservationId: null,
    eventAt: null,
    expiresAt: null,
    ...overrides,
  };
}

describe('featuredCards: check-in open', () => {
  it('shows the entry card with the countdown to the close of the window', () => {
    const [card] = featuredCards([reservation()], at('2026-11-11T15:03:00Z'));

    expect(card).toMatchObject({
      tone: 'urgent',
      eyebrow: 'TU PRÓXIMA RESERVA',
      title: 'Check-in abierto',
      detail: 'Sala Board · 10:00 a 11:00 · quedan 12 min',
      action: { kind: 'check-in', label: 'Registrar llegada', reservationId: 'res-1' },
    });
    expect(card.consequence).toContain('antes de las 10:15');
    expect(card.consequence).toContain('inasistencia');
  });

  it('opens 15 minutes before the start and closes 15 minutes after', () => {
    expect(featuredCards([reservation()], at('2026-11-11T14:45:00Z'))[0].title).toBe(
      'Check-in abierto',
    );
    expect(featuredCards([reservation()], at('2026-11-11T15:15:00Z'))[0].title).toBe(
      'Check-in abierto',
    );
    expect(featuredCards([reservation()], at('2026-11-11T15:16:00Z'))).toEqual([]);
  });

  it('never shows less than one minute left', () => {
    const [card] = featuredCards([reservation()], at('2026-11-11T15:14:50Z'));

    expect(card.detail).toContain('quedan 1 min');
  });
});

describe('featuredCards: starts soon', () => {
  it('announces the reservation during the hour before the check-in opens', () => {
    const [card] = featuredCards([reservation()], at('2026-11-11T14:20:00Z'));

    expect(card).toMatchObject({
      tone: 'default',
      title: 'Tu reserva empieza pronto',
      detail: 'Sala Board · 10:00 a 11:00 · empieza en 40 min',
      consequence: 'El registro de llegada abre a las 09:45.',
      action: { kind: 'link', href: '/my-reservations' },
    });
  });

  it('stays quiet more than an hour before the start', () => {
    expect(featuredCards([reservation()], at('2026-11-11T13:59:00Z'))).toEqual([]);
  });

  it('does not announce reservations that are not confirmed', () => {
    const pending = reservation({ status: 'PENDING_APPROVAL' });

    expect(featuredCards([pending], at('2026-11-11T14:30:00Z'))).toEqual([]);
  });
});

describe('featuredCards: ends soon', () => {
  const checkedIn = reservation({ status: 'CHECKED_IN' });

  it('warns during the last 10 minutes of a reservation in use', () => {
    const [card] = featuredCards([checkedIn], at('2026-11-11T15:52:00Z'));

    expect(card).toMatchObject({
      eyebrow: 'EN CURSO',
      title: 'Tu reserva termina pronto',
      detail: 'Sala Board · hasta 11:00 · quedan 8 min',
      consequence: 'A las 11:00 el espacio queda libre para la siguiente persona.',
      action: { kind: 'link', label: 'Ver reserva' },
    });
  });

  it('stays quiet earlier than 10 minutes before the end', () => {
    expect(featuredCards([checkedIn], at('2026-11-11T15:49:00Z'))).toEqual([]);
  });

  it('disappears once the reservation ended', () => {
    expect(featuredCards([checkedIn], at('2026-11-11T16:00:00Z'))).toEqual([]);
  });

  it('is informative: it asks for no check-out', () => {
    const [card] = featuredCards([checkedIn], at('2026-11-11T15:55:00Z'));

    expect(card.action.kind).toBe('link');
  });
});

describe('featuredCards: order', () => {
  it('puts the card that needs an action first, then the closest in time', () => {
    const soon = reservation({
      id: 'soon',
      startDateTime: '2026-11-11T15:40:00Z',
      endDateTime: '2026-11-11T16:40:00Z',
    });
    const open = reservation({ id: 'open' });
    const ending = reservation({
      id: 'ending',
      status: 'CHECKED_IN',
      startDateTime: '2026-11-11T14:00:00Z',
      endDateTime: '2026-11-11T15:08:00Z',
    });

    const cards = featuredCards([soon, ending, open], at('2026-11-11T15:03:00Z'));

    expect(cards.map((card) => card.reservationId)).toEqual(['open', 'ending', 'soon']);
  });

  it('keeps a stable key per reservation and kind', () => {
    const [card] = featuredCards([reservation()], at('2026-11-11T15:03:00Z'));

    expect(card.key).toBe('check-in-res-1');
    expect(card.notificationId).toBeNull();
  });
});

describe('inboxCard', () => {
  const ALL_TYPES: NotificationType[] = [
    'ACCESS_REQUEST',
    'APPROVAL_REALLOCATED',
    'APPROVAL_REQUESTED',
    'NO_SHOW_NO_SANCTION',
    'NO_SHOW_SANCTION',
    'RESERVATION_APPROVED',
    'RESERVATION_CONFIRMED',
    'RESERVATION_PENDING',
    'RESERVATION_REALLOCATED',
    'RESERVATION_REJECTED',
    'RESERVATION_REMINDER',
    'RESERVATION_UPDATED',
    'SANCTION_RESOLVED',
    'TRAINING_EXPIRED',
  ];

  it.each(ALL_TYPES)('gives %s a label, a detail and an action', (type) => {
    const card = inboxCard(notification({ type }));

    expect(card.eyebrow).not.toBe('');
    expect(card.detail).toBe('Tu reserva quedó confirmada.');
    expect(card.action.label).not.toBe('');
  });

  it('keeps the title and the text the backend wrote', () => {
    const card = inboxCard(notification({ title: 'Tu reserva fue reasignada', message: 'Antes…' }));

    expect(card).toMatchObject({ title: 'Tu reserva fue reasignada', detail: 'Antes…' });
  });

  it('marks as unread what was not read', () => {
    expect(inboxCard(notification()).unread).toBe(true);
    expect(inboxCard(notification({ isRead: true })).unread).toBe(false);
  });

  it('sends a rejection back to the availability to book again', () => {
    const card = inboxCard(notification({ type: 'RESERVATION_REJECTED' }));

    expect(card).toMatchObject({
      tone: 'danger',
      action: { kind: 'link', label: 'Reservar de nuevo', href: '/availability' },
    });
    expect(card.consequence).toContain('Puedes volver a solicitarlo');
  });

  it('asks the superadmin to review an access request', () => {
    const card = inboxCard(notification({ type: 'ACCESS_REQUEST' }));

    expect(card.action).toEqual({
      kind: 'link',
      label: 'Revisar solicitud',
      href: '/admin/access-requests',
    });
  });

  it('sends the leader to the training inbox', () => {
    const card = inboxCard(notification({ type: 'APPROVAL_REQUESTED' }));

    expect(card.action).toMatchObject({ href: '/leader/inbox' });
  });

  it('only asks to acknowledge a sanction, whose banner already explains how to clear it', () => {
    const sanction = inboxCard(notification({ type: 'NO_SHOW_SANCTION' }));
    const withoutSanction = inboxCard(notification({ type: 'NO_SHOW_NO_SANCTION' }));

    expect(sanction).toMatchObject({ tone: 'danger', action: { kind: 'mark-read' } });
    expect(withoutSanction).toMatchObject({ tone: 'default', action: { kind: 'mark-read' } });
  });

  it('lets the owner open a reallocated reservation to decide whether to cancel', () => {
    const card = inboxCard(notification({ type: 'RESERVATION_REALLOCATED' }));

    expect(card).toMatchObject({
      tone: 'urgent',
      eyebrow: 'CAMBIO EN TU RESERVA',
      action: { href: '/my-reservations' },
    });
  });
});

describe('withoutFeaturedReminders', () => {
  const reminder = notification({
    id: 'n-rem',
    type: 'RESERVATION_REMINDER',
    reservationId: 'res-1',
  });

  it('hides the saved reminder while its live card is on screen', () => {
    const featured = featuredCards([reservation()], at('2026-11-11T14:30:00Z'));

    expect(withoutFeaturedReminders([reminder], featured)).toEqual([]);
  });

  it('keeps the reminder when no live card covers that reservation', () => {
    expect(withoutFeaturedReminders([reminder], [])).toEqual([reminder]);
  });

  it('keeps every other notice', () => {
    const other = notification({ id: 'n-2', reservationId: 'res-1' });
    const featured = featuredCards([reservation()], at('2026-11-11T14:30:00Z'));

    expect(withoutFeaturedReminders([reminder, other], featured)).toEqual([other]);
  });
});
