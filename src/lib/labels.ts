import type { ResourceType as ApiResourceType, Role } from '@/api/types';
import type { ReservationReason, ReservationStatus, ResourceType } from '@/types';

export const appLabels = {
  title: 'Reservas TCS · Banco Pichincha',
  description: 'Reserva de salas de reuniones, laboratorios y laptops de IA',
};

export const statusLabels: Record<ReservationStatus, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
};

export const reasonLabels: Record<ReservationReason, string> = {
  internal_meeting: 'Reunión interna',
  client_meeting: 'Reunión con cliente',
  training: 'Entrenamiento',
  client_event: 'Evento con cliente',
};

export const resourceTypeLabels: Record<ResourceType, string> = {
  room: 'Sala',
  ai_lab: 'Laboratorio IA',
  laptop: 'Laptop',
};

export const catalogResourceTypeLabels: Record<ApiResourceType, string> = {
  MEETING_ROOM: 'Sala',
  AI_LAB: 'Laboratorio IA',
  LAPTOP: 'Laptop',
};

export const catalogLabels = {
  loading: 'Cargando catálogo…',
  empty: 'Todavía no hay edificios en el catálogo.',
  noResources: 'Este edificio no tiene salas ni laboratorios.',
  retry: 'Reintentar',
  capacity: (people: number) => `${people} ${people === 1 ? 'persona' : 'personas'}`,
  laptops: (count: number) => `${count} ${count === 1 ? 'laptop' : 'laptops'}`,
};

export const roleLabels: Record<Role, string> = {
  ASOCIADO: 'Asociado',
  ADMIN: 'Administrador',
  SPOC_ADMIN: 'SPOC Administrativo',
  LIDER: 'Líder de Conocimiento',
  SPOC_EDIFICIO: 'SPOC de Edificio',
  SUPERADMIN: 'Superadministrador',
};
