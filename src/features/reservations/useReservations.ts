import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateReservationBody, CreateSeriesBody, UpdateReservationBody } from '@/api/types';
import { availabilityKeys } from '@/features/availability/useAvailability';
import { floorPlanKeys } from '@/features/floor-plans/useFloorPlans';
import {
  cancelReservation,
  cancelSeries,
  checkInReservation,
  createReservation,
  createSeries,
  fetchMyReservations,
  previewSeries,
  updateReservation,
  type MyReservationsFilter,
} from '@/features/reservations/api';

export const reservationKeys = {
  all: ['reservations'] as const,
  mine: (filter: MyReservationsFilter) => ['reservations', 'mine', filter] as const,
};

function useRefreshReservations() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: reservationKeys.all }),
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all }),
      queryClient.invalidateQueries({ queryKey: floorPlanKeys.statuses }),
    ]);
}

export function useMyReservations(filter: MyReservationsFilter) {
  return useQuery({
    queryKey: reservationKeys.mine(filter),
    queryFn: () => fetchMyReservations(filter),
    placeholderData: keepPreviousData,
  });
}

export function useCreateReservation() {
  const refresh = useRefreshReservations();
  return useMutation({
    mutationFn: (body: CreateReservationBody) => createReservation(body),
    onSuccess: refresh,
  });
}

export function useUpdateReservation() {
  const refresh = useRefreshReservations();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateReservationBody }) =>
      updateReservation(id, body),
    onSuccess: refresh,
  });
}

export function useCancelReservation() {
  const refresh = useRefreshReservations();
  return useMutation({ mutationFn: (id: string) => cancelReservation(id), onSuccess: refresh });
}

export function useCheckIn() {
  const refresh = useRefreshReservations();
  return useMutation({ mutationFn: (id: string) => checkInReservation(id), onSuccess: refresh });
}

export function usePreviewSeries() {
  return useMutation({ mutationFn: (body: CreateSeriesBody) => previewSeries(body) });
}

export function useCreateSeries() {
  const refresh = useRefreshReservations();
  return useMutation({
    mutationFn: (body: CreateSeriesBody) => createSeries(body),
    onSuccess: refresh,
  });
}

export function useCancelSeries() {
  const refresh = useRefreshReservations();
  return useMutation({ mutationFn: (id: string) => cancelSeries(id), onSuccess: refresh });
}
