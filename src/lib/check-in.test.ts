import { describe, expect, it } from 'vitest';
import { checkInState, upcomingBoundary } from '@/lib/check-in';

const START = '2026-11-11T15:00:00Z';

function at(iso: string) {
  return new Date(iso);
}

describe('checkInState', () => {
  it('is open from 15 minutes before the start', () => {
    expect(
      checkInState({ status: 'CONFIRMED', startDateTime: START }, at('2026-11-11T14:45:00Z')),
    ).toEqual({
      kind: 'OPEN',
    });
  });

  it('stays open until 15 minutes after the start', () => {
    expect(
      checkInState({ status: 'CONFIRMED', startDateTime: START }, at('2026-11-11T15:15:00Z')),
    ).toEqual({
      kind: 'OPEN',
    });
  });

  it('closes right after the window', () => {
    expect(
      checkInState({ status: 'CONFIRMED', startDateTime: START }, at('2026-11-11T15:16:00Z')),
    ).toEqual({
      kind: 'NOT_APPLICABLE',
    });
  });

  it('tells when it opens if the start is within a day', () => {
    const state = checkInState(
      { status: 'CONFIRMED', startDateTime: START },
      at('2026-11-11T12:00:00Z'),
    );
    expect(state).toEqual({ kind: 'TOO_EARLY', opensAt: at('2026-11-11T14:45:00Z') });
  });

  it('shows nothing when the start is more than a day away', () => {
    expect(
      checkInState({ status: 'CONFIRMED', startDateTime: START }, at('2026-11-09T12:00:00Z')),
    ).toEqual({
      kind: 'NOT_APPLICABLE',
    });
  });

  it.each(['PENDING_APPROVAL', 'CHECKED_IN', 'NO_SHOW', 'CANCELLED', 'REJECTED'] as const)(
    'does not apply to a reservation in %s',
    (status) => {
      expect(checkInState({ status, startDateTime: START }, at('2026-11-11T15:00:00Z'))).toEqual({
        kind: 'NOT_APPLICABLE',
      });
    },
  );
});

describe('upcomingBoundary', () => {
  it('keeps reservations in their check-in window under the upcoming tab', () => {
    expect(upcomingBoundary(at('2026-11-11T15:20:00Z'))).toEqual(at('2026-11-11T15:05:00Z'));
  });
});
