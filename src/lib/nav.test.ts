import { describe, expect, it } from 'vitest';
import { canOpen, homeForRoles, navForRoles } from '@/lib/nav';

const hrefs = (roles: Parameters<typeof navForRoles>[0]) =>
  navForRoles(roles).map((item) => item.href);

describe('navForRoles', () => {
  it('shows the associate screens to an associate', () => {
    expect(hrefs(['ASOCIADO'])).toEqual([
      '/availability',
      '/catalog',
      '/my-reservations',
      '/notifications',
    ]);
  });

  it('puts the screens of the higher role first and keeps the associate ones', () => {
    const items = hrefs(['ASOCIADO', 'LIDER']);

    expect(items.slice(0, 2)).toEqual(['/leader/inbox', '/leader/dashboard']);
    expect(items).toContain('/my-reservations');
  });

  it('does not repeat a screen shared by two roles', () => {
    const items = hrefs(['SUPERADMIN', 'ASOCIADO']);

    expect(items.filter((href) => href === '/catalog')).toHaveLength(1);
  });

  it('gives the access requests only to the SUPERADMIN', () => {
    expect(hrefs(['ADMIN'])).not.toContain('/admin/access-requests');
    expect(hrefs(['SUPERADMIN'])).toContain('/admin/access-requests');
  });

  it('lets an ADMIN manage users', () => {
    expect(hrefs(['ADMIN'])).toContain('/admin/users');
  });

  it('is empty without roles', () => {
    expect(navForRoles([])).toEqual([]);
  });
});

describe('homeForRoles', () => {
  it.each([
    [['ASOCIADO'], '/availability'],
    [['ASOCIADO', 'LIDER'], '/leader/inbox'],
    [['SUPERADMIN'], '/admin/access-requests'],
    [['ADMIN'], '/admin/users'],
    [[], '/availability'],
  ] as const)('sends %j to %s', (roles, expected) => {
    expect(homeForRoles(roles)).toBe(expected);
  });
});

describe('canOpen', () => {
  it('allows the screens of the user roles and their subpaths', () => {
    expect(canOpen(['SUPERADMIN'], '/admin/access-requests')).toBe(true);
    expect(canOpen(['ASOCIADO'], '/my-reservations/detail')).toBe(true);
  });

  it('blocks the screens of other roles', () => {
    expect(canOpen(['ASOCIADO'], '/admin/users')).toBe(false);
    expect(canOpen(['ADMIN'], '/admin/access-requests')).toBe(false);
  });
});
