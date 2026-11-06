export type Role = 'associate' | 'admin' | 'admin_spoc' | 'knowledge_leader' | 'building_spoc';

export type ResourceType = 'room' | 'ai_lab' | 'laptop';

export type ReservationStatus = 'confirmed' | 'pending' | 'rejected' | 'cancelled';

export type ReservationReason = 'internal_meeting' | 'client_meeting' | 'training' | 'client_event';

export type SlotStatus = 'free' | 'occupied' | 'blocked';

export interface Building {
  id: string;
  name: string;
  address: string;
  active: boolean;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  buildingId: string;
  capacity?: number;
  active: boolean;
  parentLabId?: string;
}

export interface Reservation {
  id: string;
  resourceId: string;
  associateName: string;
  date: string;
  startHour: number;
  endHour: number;
  reason: ReservationReason;
  detail: string;
  status: ReservationStatus;
}

export interface AppNotification {
  id: string;
  title: string;
  detail: string;
  message: string;
  read: boolean;
}
