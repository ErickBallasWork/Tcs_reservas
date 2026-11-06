import { describe, expect, it } from 'vitest';
import { matchesSearch } from '@/lib/user-search';

const ana = { fullName: 'Ana Pérez', email: 'ana.perez@tcs.com' };

describe('matchesSearch', () => {
  it('matches everything on an empty search', () => {
    expect(matchesSearch(ana, '')).toBe(true);
    expect(matchesSearch(ana, '   ')).toBe(true);
  });

  it('ignores case and accents', () => {
    expect(matchesSearch(ana, 'PEREZ')).toBe(true);
    expect(matchesSearch(ana, 'pérez')).toBe(true);
  });

  it('searches the email too', () => {
    expect(matchesSearch(ana, 'perez@tcs')).toBe(true);
  });

  it('rejects other people', () => {
    expect(matchesSearch(ana, 'luis')).toBe(false);
  });
});
