import type { Role } from '@/api/types';

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
}

const ACCESS_REQUESTS: NavItem = {
  href: '/admin/access-requests',
  label: 'Solicitudes de acceso',
  shortLabel: 'Accesos',
};

const USERS: NavItem = { href: '/admin/users', label: 'Usuarios y roles', shortLabel: 'Usuarios' };

const CATALOG: NavItem = { href: '/catalog', label: 'Catálogo', shortLabel: 'Catálogo' };

const BUILDINGS: NavItem = {
  href: '/admin/buildings',
  label: 'Edificios',
  shortLabel: 'Edificios',
};

const RESOURCES: NavItem = {
  href: '/admin/resources',
  label: 'Salas y laboratorios',
  shortLabel: 'Salas',
};

const ADMIN_CATALOG: NavItem = {
  href: '/admin/catalog',
  label: 'Catálogo y laptops',
  shortLabel: 'Catálogo',
};

export const navByRole: Record<Role, NavItem[]> = {
  ASOCIADO: [
    { href: '/availability', label: 'Disponibilidad', shortLabel: 'Disponib.' },
    CATALOG,
    { href: '/my-reservations', label: 'Mis reservas', shortLabel: 'Mis reservas' },
    { href: '/notifications', label: 'Notificaciones', shortLabel: 'Avisos' },
  ],
  ADMIN: [
    USERS,
    BUILDINGS,
    RESOURCES,
    ADMIN_CATALOG,
    { href: '/admin/sanctions', label: 'Sanciones y auditoría', shortLabel: 'Sanciones' },
    { href: '/admin/reports', label: 'Reportes', shortLabel: 'Reportes' },
  ],
  SPOC_ADMIN: [{ href: '/leader/dashboard', label: 'Panel de seguimiento', shortLabel: 'Panel' }],
  LIDER: [
    { href: '/leader/inbox', label: 'Bandeja de entrenamientos', shortLabel: 'Bandeja' },
    { href: '/leader/dashboard', label: 'Panel de seguimiento', shortLabel: 'Panel' },
  ],
  SPOC_EDIFICIO: [{ href: '/spoc/agenda', label: 'Agenda de salas', shortLabel: 'Agenda' }],
  SUPERADMIN: [ACCESS_REQUESTS, USERS, BUILDINGS, RESOURCES, ADMIN_CATALOG, CATALOG],
};

const ROLE_PRIORITY: readonly Role[] = [
  'SUPERADMIN',
  'ADMIN',
  'LIDER',
  'SPOC_ADMIN',
  'SPOC_EDIFICIO',
  'ASOCIADO',
];

export function navForRoles(roles: readonly Role[]): NavItem[] {
  const seen = new Set<string>();
  return ROLE_PRIORITY.filter((role) => roles.includes(role))
    .flatMap((role) => navByRole[role])
    .filter((item) => !seen.has(item.href) && seen.add(item.href));
}

export function homeForRoles(roles: readonly Role[]): string {
  return navForRoles(roles)[0]?.href ?? '/availability';
}

export function canOpen(roles: readonly Role[], pathname: string): boolean {
  return navForRoles(roles).some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/'),
  );
}
