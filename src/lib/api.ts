import {
  ApiAvailabilityItem,
  ApiBuilding,
  AuthConfigResponse,
  ApiError,
  ApiErrorResponse,
  ApiNotification,
  ApiReservation,
  ApiResource,
  ApiResourceAvailability,
  AuthSessionResponse,
  CreateReservationPayload,
  CurrentUser,
} from '@/types/api';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const ACCESS_TOKEN_KEY = 'tcs_reservas_access_token';
const DEMO_USER_KEY = 'tcs_reservas_demo_email';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getStoredDemoUser(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DEMO_USER_KEY);
}

export function setStoredDemoUser(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEMO_USER_KEY, email);
}

export function removeStoredDemoUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEMO_USER_KEY);
}

export interface RequestOptions extends RequestInit {
  demoUser?: string;
  skipAuth?: boolean;
}

/**
 * Cliente HTTP unificado con la API de Reservas en NestJS.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (!options.skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      const demoEmail = options.demoUser || getStoredDemoUser();
      if (demoEmail) {
        headers.set('x-demo-user', demoEmail);
      }
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeStoredToken();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }

  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        statusCode: response.status,
        code: 'HTTP_ERROR',
        message: response.statusText || 'Error en la petición al servidor',
      };
    }
    throw new ApiError(errorData);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    getConfig: () =>
      apiFetch<AuthConfigResponse>('/auth/config', { skipAuth: true }),

    loginDemo: (email: string) =>
      apiFetch<AuthSessionResponse>('/auth/demo', {
        method: 'POST',
        body: JSON.stringify({ email }),
        skipAuth: true,
      }),

    loginGoogle: (credential: string) =>
      apiFetch<AuthSessionResponse>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential }),
        skipAuth: true,
      }),

    getMe: () => apiFetch<CurrentUser>('/me'),
  },

  catalog: {
    getTree: () => apiFetch<ApiBuilding[]>('/catalog/tree'),
    getBuildings: (includeInactive = false) =>
      apiFetch<ApiBuilding[]>(`/buildings?includeInactive=${includeInactive}`),
    getResources: (params?: { buildingId?: string; type?: string }) => {
      const query = new URLSearchParams();
      if (params?.buildingId) query.set('buildingId', params.buildingId);
      if (params?.type) query.set('type', params.type);
      const qs = query.toString();
      return apiFetch<ApiResource[]>(`/resources${qs ? `?${qs}` : ''}`);
    },
  },

  availability: {
    search: (params: {
      from: string;
      to: string;
      buildingId?: string;
      type?: 'MEETING_ROOM' | 'AI_LAB';
      minCapacity?: number;
    }) => {
      const query = new URLSearchParams();
      query.set('from', params.from);
      query.set('to', params.to);
      if (params.buildingId) query.set('buildingId', params.buildingId);
      if (params.type) query.set('type', params.type);
      if (params.minCapacity) query.set('minCapacity', String(params.minCapacity));
      return apiFetch<ApiAvailabilityItem[]>(`/availability/search?${query.toString()}`);
    },

    getResource: (resourceId: string, from: string, to: string) => {
      const query = new URLSearchParams({ from, to });
      return apiFetch<ApiResourceAvailability>(
        `/availability/resources/${resourceId}?${query.toString()}`
      );
    },
  },

  reservations: {
    create: (data: CreateReservationPayload) =>
      apiFetch<ApiReservation>('/reservations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    listMine: (params?: { status?: string; from?: string; to?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.from) query.set('from', params.from);
      if (params?.to) query.set('to', params.to);
      const qs = query.toString();
      return apiFetch<ApiReservation[]>(`/reservations/mine${qs ? `?${qs}` : ''}`);
    },

    get: (id: string) => apiFetch<ApiReservation>(`/reservations/${id}`),

    cancel: (id: string) =>
      apiFetch<ApiReservation>(`/reservations/${id}/cancel`, {
        method: 'PATCH',
      }),

    checkIn: (id: string, method: 'BUTTON' | 'QR' = 'BUTTON') =>
      apiFetch<{ message: string }>(`/reservations/${id}/check-in`, {
        method: 'POST',
        body: JSON.stringify({ method }),
      }),
  },

  notifications: {
    listMine: (params?: { unreadOnly?: boolean; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.unreadOnly) query.set('unreadOnly', 'true');
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      const qs = query.toString();
      return apiFetch<{ items: ApiNotification[]; total: number; unread: number }>(
        `/notifications${qs ? `?${qs}` : ''}`
      );
    },

    unreadCount: () => apiFetch<{ count: number }>('/notifications/unread-count'),

    markRead: (id: string) =>
      apiFetch<{ message: string }>(`/notifications/${id}/read`, {
        method: 'PATCH',
      }),

    markAllRead: () =>
      apiFetch<{ message: string }>('/notifications/read-all', {
        method: 'PATCH',
      }),
  },
};

