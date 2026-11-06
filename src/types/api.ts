export type BackendRole =
  | 'ASOCIADO'
  | 'ADMIN'
  | 'SPOC_ADMIN'
  | 'LIDER'
  | 'SPOC_EDIFICIO';

export type BackendResourceType = 'MEETING_ROOM' | 'AI_LAB' | 'LAPTOP';

export type BackendReservationType = 'ROOM' | 'FULL_LAB' | 'LAPTOP';

export type BackendPurpose = 'INTERNAL_MEETING' | 'CLIENT_MEETING' | 'TRAINING';

export type BackendReservationStatus =
  | 'PENDING_APPROVAL'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CHECKED_IN'
  | 'NO_SHOW';

export interface ApiErrorResponse {
  statusCode: number;
  code?: string;
  message: string | string[];
  timestamp?: string;
  path?: string;
}

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  messages: string[];

  constructor(res: ApiErrorResponse) {
    const msgs = Array.isArray(res.message) ? res.message : [res.message || 'Error desconocido'];
    super(msgs.join(', '));
    this.name = 'ApiError';
    this.statusCode = res.statusCode;
    this.code = res.code;
    this.messages = msgs;
  }
}

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  roles: BackendRole[];
  spocBuildingIds: string[];
  activeSanction?: {
    id: string;
    reason: string;
    startDate: string;
  } | null;
}

export interface AuthSessionResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: CurrentUser;
}

export interface AuthConfigResponse {
  authMode: 'demo' | 'google';
  googleClientId: string | null;
}

export interface ApiBuilding {
  id: string;
  name: string;
  address: string | null;
  isActive: boolean;
  resources?: ApiResource[];
  _count?: {
    resources?: number;
  };
}

export interface CreateBuildingPayload {
  name: string;
  address?: string;
}

export interface UpdateBuildingPayload {
  name?: string;
  address?: string;
  isActive?: boolean;
}

export interface ApiResource {
  id: string;
  buildingId: string;
  parentResourceId: string | null;
  type: BackendResourceType;
  name: string;
  capacity: number;
  equipment: string | null;
  rules: string | null;
  assetTag: string | null;
  isActive: boolean;
  children?: ApiResource[];
  building?: {
    id: string;
    name: string;
  };
  parent?: {
    id: string;
    name: string;
  };
}

export interface CreateResourcePayload {
  buildingId: string;
  type: BackendResourceType;
  name: string;
  capacity?: number;
  equipment?: string;
  rules?: string;
  parentResourceId?: string;
  assetTag?: string;
}

export interface UpdateResourcePayload {
  name?: string;
  capacity?: number;
  equipment?: string;
  rules?: string;
  parentResourceId?: string;
  assetTag?: string;
  isActive?: boolean;
}

export interface FutureReservationAffected {
  id: string;
  startDateTime: string;
  endDateTime: string;
  status: string;
  user: {
    fullName: string;
    email: string;
  };
}

export interface ApiAvailabilityItem {
  id: string;
  name: string;
  type: 'MEETING_ROOM' | 'AI_LAB';
  capacity: number;
  equipment: string | null;
  building: {
    id: string;
    name: string;
  };
  free: boolean;
  totalLaptops?: number;
  freeLaptops?: number;
}

export interface ApiResourceAvailability {
  resourceId: string;
  name: string;
  type: string;
  slotMinutes: number;
  from: string;
  to: string;
  busySlots: string[];
  laptops: {
    id: string;
    name: string;
    busySlots: string[];
  }[];
}

export interface CreateReservationPayload {
  resourceId: string;
  startDateTime: string;
  endDateTime: string;
  purpose: BackendPurpose;
  justification: string;
}

export interface ApiReservation {
  id: string;
  userId: string;
  resourceId: string;
  reservationType: BackendReservationType;
  purpose: BackendPurpose;
  justification: string;
  startDateTime: string;
  endDateTime: string;
  status: BackendReservationStatus;
  createdAt: string;
  updatedAt: string;
  resource: {
    id: string;
    name: string;
    type: BackendResourceType;
    buildingId?: string;
    building?: {
      id: string;
      name: string;
    };
  };
  user?: {
    id: string;
    fullName: string;
    email: string;
    department?: string | null;
  };
}

export interface ApiNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  channel: string;
  isRead: boolean;
  createdAt: string;
  sentAt: string | null;
}

export interface DecideApprovalPayload {
  decision: 'APPROVE' | 'REJECT';
  comments?: string;
}

export interface ReallocatePayload {
  newResourceId?: string;
  newStartDateTime?: string;
  newEndDateTime?: string;
  justification: string;
}

export interface ApiSanction {
  id: string;
  userId: string;
  reservationId: string;
  type: string;
  reason: string;
  startDate: string;
  endDate: string | null;
  status: 'ACTIVE' | 'RESOLVED';
  resolvedById: string | null;
  resolvedAt: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  resolvedBy: {
    id: string;
    fullName: string;
  } | null;
  reservation: {
    id: string;
    startDateTime: string;
    endDateTime: string;
    resource: {
      name: string;
    };
  };
}

export interface DashboardMetrics {
  total: number;
  byStatus: Record<BackendReservationStatus, number>;
  byPurpose: Record<BackendPurpose, number>;
  byReservationType: Record<BackendReservationType, number>;
  noShowRate: number;
}

export interface OccupancyReportRow {
  id: string;
  name: string;
  building: string;
  type: string;
  reservedHours: number;
  availableHours: number;
  occupancyRate: number;
}

export interface DepartmentUsageRow {
  department: string;
  users: number;
  reservations: number;
  checkedIn: number;
  noShows: number;
  cancelled: number;
}

export interface ApiAuditLog {
  id: number;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  eventDate: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}
