import { describe, expect, it } from 'vitest';
import {
  DASHBOARD_PAGE_SIZE,
  defaultDashboardFilter,
  hasValidRange,
  toHistoryQuery,
  toRangeQuery,
} from '@/lib/dashboard-filter';

describe('defaultDashboardFilter', () => {
  it('covers the last 30 days with no status or purpose', () => {
    const filter = defaultDashboardFilter(new Date('2026-11-06T15:00:00Z'));
    expect(filter).toEqual({
      from: '2026-10-07',
      to: '2026-11-06',
      status: '',
      purpose: '',
      page: 1,
    });
  });
});

describe('hasValidRange', () => {
  it('accepts an ordered or open range', () => {
    expect(hasValidRange({ from: '2026-11-01', to: '2026-11-02' })).toBe(true);
    expect(hasValidRange({ from: '2026-11-01', to: '2026-11-01' })).toBe(true);
    expect(hasValidRange({ from: '', to: '2026-11-02' })).toBe(true);
  });

  it('rejects an inverted range', () => {
    expect(hasValidRange({ from: '2026-11-03', to: '2026-11-02' })).toBe(false);
  });
});

describe('toRangeQuery', () => {
  it('includes the whole last day by ending at the next local midnight', () => {
    expect(toRangeQuery({ from: '2026-11-01', to: '2026-11-02' })).toEqual({
      from: '2026-11-01T05:00:00.000Z',
      to: '2026-11-03T05:00:00.000Z',
    });
  });

  it('omits empty dates', () => {
    expect(toRangeQuery({ from: '', to: '' })).toEqual({});
  });
});

describe('toHistoryQuery', () => {
  it('adds the page size and only the chosen filters', () => {
    const query = toHistoryQuery({
      from: '',
      to: '',
      status: 'PENDING_APPROVAL',
      purpose: '',
      page: 2,
    });
    expect(query).toEqual({ status: 'PENDING_APPROVAL', page: 2, pageSize: DASHBOARD_PAGE_SIZE });
  });
});
