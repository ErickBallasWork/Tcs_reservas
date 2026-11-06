import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReallocateBody } from '@/api/types';
import { availabilityKeys } from '@/features/availability/useAvailability';
import { reservationKeys } from '@/features/reservations/useReservations';
import {
  fetchSpocAgenda,
  reallocateReservation,
  type SpocAgendaFilter,
} from '@/features/spoc-agenda/api';

export const spocAgendaKeys = {
  all: ['spoc-agenda'] as const,
  day: (filter: SpocAgendaFilter) => ['spoc-agenda', filter] as const,
};

export function useSpocAgenda(filter: SpocAgendaFilter) {
  return useQuery({
    queryKey: spocAgendaKeys.day(filter),
    queryFn: () => fetchSpocAgenda(filter),
    placeholderData: keepPreviousData,
  });
}

export function useReallocateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ReallocateBody }) =>
      reallocateReservation(id, body),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: spocAgendaKeys.all }),
        queryClient.invalidateQueries({ queryKey: reservationKeys.all }),
        queryClient.invalidateQueries({ queryKey: availabilityKeys.all }),
      ]),
  });
}
