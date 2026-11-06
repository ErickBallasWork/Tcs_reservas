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

  it.each([
    ['ASOCIADO'],
    ['ADMIN'],
    ['SUPERADMIN'],
    ['LIDER'],
    ['SPOC_ADMIN'],
    ['SPOC_EDIFICIO'],
  ] as const)('lets %s open the notifications they receive', (role) => {
    expect(hrefs([role])).toContain('/notifications');
    expect(canOpen([role], '/notifications')).toBe(true);
  });

  it('gives the access requests only to the SUPERADMIN', () => {
    expect(hrefs(['ADMIN'])).not.toContain('/admin/access-requests');
    expect(hrefs(['SUPERADMIN'])).toContain('/admin/access-requests');
  });

  it.each([['LIDER'], ['ADMIN'], ['SUPERADMIN']] as const)(
    'gives the training inbox to %s',
    (role) => {
      expect(hrefs([role])).toContain('/leader/inbox');
    },
  );

  it.each([['LIDER'], ['SPOC_ADMIN'], ['ADMIN'], ['SUPERADMIN']] as const)(
    'gives the tracking panel to %s',
    (role) => {
      expect(hrefs([role])).toContain('/leader/dashboard');
    },
  );

  it('keeps the tracking panel away from associates', () => {
    expect(hrefs(['ASOCIADO'])).not.toContain('/leader/dashboard');
  });

  it('keeps the training inbox away from associates', () => {
    expect(hrefs(['ASOCIADO'])).not.toContain('/leader/inbox');
  });

  it('lets an ADMIN manage users', () => {
    expect(hrefs(['ADMIN'])).toContain('/admin/users');
  });

  it.each([['ADMIN'], ['SUPERADMIN']] as const)(
    'gives the catalog administration screens to %s',
    (role) => {
      expect(hrefs([role])).toEqual(
        expect.arrayContaining([
          '/admin/buildings',
          '/admin/resources',
          '/admin/catalog',
          '/admin/operating-hours',
        ]),
      );
    },
  );

  it.each([['ADMIN'], ['SUPERADMIN']] as const)('lets %s edit the floor plans', (role) => {
    expect(hrefs([role])).toContain('/admin/floor-plans');
    expect(canOpen([role], '/admin/floor-plans')).toBe(true);
  });

  it.each([['ASOCIADO'], ['LIDER'], ['SPOC_ADMIN'], ['SPOC_EDIFICIO']] as const)(
    'keeps the floor plan editor away from %s',
    (role) => {
      expect(canOpen([role], '/admin/floor-plans')).toBe(false);
    },
  );

  it('keeps the catalog administration away from associates', () => {
    expect(hrefs(['ASOCIADO', 'LIDER'])).not.toContain('/admin/buildings');
    expect(canOpen(['ASOCIADO'], '/admin/catalog')).toBe(false);
    expect(canOpen(['ASOCIADO'], '/admin/operating-hours')).toBe(false);
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
