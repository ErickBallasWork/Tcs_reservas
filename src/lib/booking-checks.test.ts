import { describe, expect, it } from 'vitest';
import { checkDraft, parseAttendees, type BookingDraft } from '@/lib/booking-checks';

const NOW = new Date('2026-11-06T12:00:00Z');
const at = (hours: number) => new Date(NOW.getTime() + hours * 3_600_000).toISOString();

const draft = (overrides: Partial<BookingDraft> = {}): BookingDraft => ({
  start: at(48),
  end: at(49),
  resourceType: 'MEETING_ROOM',
  capacity: 8,
  attendees: '4',
  purpose: 'INTERNAL_MEETING',
  detail: 'Planificación',
  ...overrides,
});

describe('checkDraft', () => {
  it('accepts a complete draft', () => {
    expect(checkDraft(draft(), NOW)).toEqual([]);
  });

  it('accepts exactly 24 h of advance and exactly 48 h of duration', () => {
    expect(checkDraft(draft({ start: at(24), end: at(24 + 48) }), NOW)).toEqual([]);
  });

  it('rejects less than 24 h of advance', () => {
    expect(checkDraft(draft({ start: at(23.5), end: at(24.5) }), NOW)).toEqual(['MIN_ADVANCE']);
  });

  it('rejects more than 48 h', () => {
    expect(checkDraft(draft({ start: at(48), end: at(96.5) }), NOW)).toEqual(['MAX_DURATION']);
  });

  it('rejects an end that is not after the start', () => {
    expect(checkDraft(draft({ end: at(48) }), NOW)).toEqual(['END_BEFORE_START']);
    expect(checkDraft(draft({ end: '' }), NOW)).toEqual(['END_BEFORE_START']);
  });

  it('rejects times that are not on a 30 minute slot', () => {
    expect(checkDraft(draft({ start: at(48.25), end: at(49) }), NOW)).toEqual(['NOT_ALIGNED']);
  });

  it('requires a purpose and a detail with something other than spaces', () => {
    expect(checkDraft(draft({ purpose: '', detail: '   ' }), NOW)).toEqual([
      'MISSING_PURPOSE',
      'MISSING_DETAIL',
    ]);
  });

  it('requires attendees for rooms and labs up to the capacity', () => {
    expect(checkDraft(draft({ attendees: '' }), NOW)).toEqual(['ATTENDEES_REQUIRED']);
    expect(checkDraft(draft({ attendees: '0' }), NOW)).toEqual(['ATTENDEES_REQUIRED']);
    expect(checkDraft(draft({ attendees: '8' }), NOW)).toEqual([]);
    expect(checkDraft(draft({ attendees: '9' }), NOW)).toEqual(['ATTENDEES_EXCEEDS_CAPACITY']);
    expect(checkDraft(draft({ resourceType: 'AI_LAB', attendees: '' }), NOW)).toEqual([
      'ATTENDEES_REQUIRED',
    ]);
  });

  it('does not ask attendees for a laptop', () => {
    expect(checkDraft(draft({ resourceType: 'LAPTOP', attendees: '' }), NOW)).toEqual([]);
  });

  describe('editing', () => {
    it('allows a detail-only change close to the start', () => {
      const soon = draft({
        start: at(2),
        end: at(3),
        editing: { originalStart: at(2), slotChanged: false },
      });

      expect(checkDraft(soon, NOW)).toEqual([]);
    });

    it('requires 24 h before the original start to move the slot', () => {
      const late = draft({ editing: { originalStart: at(10), slotChanged: true } });

      expect(checkDraft(late, NOW)).toEqual(['EDIT_TOO_LATE']);
    });

    it('requires 24 h before the new start as well', () => {
      const early = draft({
        start: at(12),
        end: at(13),
        editing: { originalStart: at(72), slotChanged: true },
      });

      expect(checkDraft(early, NOW)).toEqual(['MIN_ADVANCE']);
    });
  });
});

describe('parseAttendees', () => {
  it('accepts whole numbers from one', () => {
    expect(parseAttendees('6')).toBe(6);
    expect(parseAttendees(' 12 ')).toBe(12);
  });

  it('rejects empty, zero, decimals and text', () => {
    expect(parseAttendees('')).toBeNull();
    expect(parseAttendees('0')).toBeNull();
    expect(parseAttendees('2.5')).toBeNull();
    expect(parseAttendees('dos')).toBeNull();
  });
});
