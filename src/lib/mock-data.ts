import type { AppNotification } from '@/types';

export const notifications: AppNotification[] = [
  {
    id: 'n-1',
    title: 'Reserva reasignada',
    detail: 'Sala 101. Motivo: evento con cliente',
    message: 'Tu reserva de Sala 101 fue reasignada. Motivo: evento con cliente',
    read: false,
  },
  {
    id: 'n-2',
    title: 'Solicitud rechazada',
    detail: 'Entrenamiento · Lab IA 1',
    message: 'Tu solicitud de Entrenamiento fue rechazada.',
    read: false,
  },
  {
    id: 'n-3',
    title: 'Reserva modificada',
    detail: 'Lab IA 1',
    message: 'Reserva modificada: Lab IA 1',
    read: true,
  },
];

export const pendingUsage = {
  resourceName: 'Sala 101',
  slotLabel: 'hoy 10:00-12:00',
};

export const isUserBlocked = true;
