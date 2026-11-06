import { useQuery } from '@tanstack/react-query';
import { fetchResourceAvailability } from '@/features/availability/api';

export const availabilityKeys = {
  all: ['availability'] as const,
  resource: (id: string, from: string, to: string) =>
    ['availability', 'resource', id, from, to] as const,
};

export function useResourceAvailability(id: string | undefined, from: string, to: string) {
  return useQuery({
    queryKey: availabilityKeys.resource(id ?? '', from, to),
    queryFn: () => fetchResourceAvailability(id as string, from, to),
    enabled: id !== undefined,
  });
}
