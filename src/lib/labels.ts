import type { ReservationReason, ReservationStatus, ResourceType, Role } from '@/types';

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

export const roleLabels: Record<Role, string> = {
  associate: 'Asociado',
  admin: 'Administrador',
  admin_spoc: 'SPOC Administrativo / Líder',
  knowledge_leader: 'Líder de Conocimiento',
  building_spoc: 'SPOC de Edificio',
};
