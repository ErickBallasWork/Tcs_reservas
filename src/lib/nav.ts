import type { Role } from '@/types';

export interface NavItem {
  href: string;
  label: string; // desktop sidebar label
  shortLabel: string; // mobile bottom-nav label
}

export const navByRole: Record<Role, NavItem[]> = {
  associate: [
    { href: '/availability', label: 'Disponibilidad', shortLabel: 'Disponib.' },
    { href: '/my-reservations', label: 'Mis reservas', shortLabel: 'Mis reservas' },
    { href: '/notifications', label: 'Notificaciones', shortLabel: 'Avisos' },
  ],
  admin: [
    { href: '/admin/buildings', label: 'Edificios', shortLabel: 'Edificios' },
    { href: '/admin/resources', label: 'Salas y laboratorios', shortLabel: 'Salas' },
    { href: '/admin/catalog', label: 'Catálogo y laptops', shortLabel: 'Catálogo' },
    { href: '/admin/sanctions', label: 'Sanciones y auditoría', shortLabel: 'Sanciones' },
    { href: '/admin/reports', label: 'Reportes', shortLabel: 'Reportes' },
  ],
  admin_spoc: [{ href: '/leader/dashboard', label: 'Panel de seguimiento', shortLabel: 'Panel' }],
  knowledge_leader: [
    { href: '/leader/inbox', label: 'Bandeja de entrenamientos', shortLabel: 'Bandeja' },
    { href: '/leader/dashboard', label: 'Panel de seguimiento', shortLabel: 'Panel' },
  ],
  building_spoc: [{ href: '/spoc/agenda', label: 'Agenda de salas', shortLabel: 'Agenda' }],
};

export const homeByRole: Record<Role, string> = {
  associate: '/availability',
  admin: '/admin/buildings',
  admin_spoc: '/leader/dashboard',
  knowledge_leader: '/leader/inbox',
  building_spoc: '/spoc/agenda',
};
