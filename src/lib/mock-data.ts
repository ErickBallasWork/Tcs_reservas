import type {
    AppNotification,
    Building,
    Reservation,
    Resource,
} from "@/types";

export const buildings: Building[] = [
    { id: "b-a", name: "Edificio A", address: "Av. Principal 123", active: true },
    { id: "b-b", name: "Edificio B", address: "Calle Secundaria 456", active: true },
    { id: "b-c", name: "Edificio C", address: "Av. Norte 789", active: false },
];

export const resources: Resource[] = [
    { id: "r-101", name: "Sala 101", type: "room", buildingId: "b-a", capacity: 8, active: true },
    { id: "r-102", name: "Sala 102", type: "room", buildingId: "b-a", capacity: 12, active: true },
    { id: "r-lab1", name: "Lab IA 1", type: "ai_lab", buildingId: "b-a", capacity: 10, active: true },
    { id: "r-201", name: "Sala 201", type: "room", buildingId: "b-b", capacity: 6, active: false },
    { id: "r-lap1", name: "Laptop 01", type: "laptop", buildingId: "b-a", active: true, parentLabId: "r-lab1" },
    { id: "r-lap2", name: "Laptop 02", type: "laptop", buildingId: "b-a", active: true, parentLabId: "r-lab1" },
];

export const reservations: Reservation[] = [
    {
        id: "res-1",
        resourceId: "r-101",
        associateName: "Ana Pérez",
        date: "2026-11-10",
        startHour: 10,
        endHour: 12,
        reason: "internal_meeting",
        detail: "Planificación semanal",
        status: "confirmed",
    },
    {
        id: "res-2",
        resourceId: "r-lab1",
        associateName: "Ana Pérez",
        date: "2026-11-12",
        startHour: 9,
        endHour: 11,
        reason: "training",
        detail: "Capacitación en IA generativa",
        status: "pending",
    },
    {
        id: "res-3",
        resourceId: "r-lap2",
        associateName: "Ana Pérez",
        date: "2026-11-13",
        startHour: 14,
        endHour: 16,
        reason: "training",
        detail: "Práctica de modelos",
        status: "rejected",
    },
    {
        id: "res-4",
        resourceId: "r-102",
        associateName: "Ana Pérez",
        date: "2026-11-11",
        startHour: 15,
        endHour: 16,
        reason: "client_meeting",
        detail: "Reunión de seguimiento",
        status: "cancelled",
    },
    {
        id: "res-5",
        resourceId: "r-lab1",
        associateName: "Luis Gómez",
        date: "2026-11-10",
        startHour: 10,
        endHour: 12,
        reason: "client_meeting",
        detail: "Demo con cliente",
        status: "confirmed",
    },
    {
        id: "res-6",
        resourceId: "r-102",
        associateName: "Carla Ruiz",
        date: "2026-11-18",
        startHour: 9,
        endHour: 11,
        reason: "internal_meeting",
        detail: "Revisión trimestral",
        status: "confirmed",
    },
];

export const notifications: AppNotification[] = [
  {
    id: "n-1",
    title: "Reserva reasignada",
    detail: "Sala 101. Motivo: evento con cliente",
    message: "Tu reserva de Sala 101 fue reasignada. Motivo: evento con cliente",
    read: false,
  },
  {
    id: "n-2",
    title: "Solicitud rechazada",
    detail: "Entrenamiento · Lab IA 1",
    message: "Tu solicitud de Entrenamiento fue rechazada.",
    read: false,
  },
  {
    id: "n-3",
    title: "Reserva modificada",
    detail: "Lab IA 1",
    message: "Reserva modificada: Lab IA 1",
    read: true,
  },
];

export const pendingUsage = {
  resourceName: "Sala 101",
  slotLabel: "hoy 10:00-12:00",
};

// Demo: the user has an active No-Show sanction
export const isUserBlocked = true;