import { useQuery } from '@tanstack/react-query';
import { fetchMe } from '@/features/sanctions/api';
import { useAuth } from '@/lib/auth';

const ME_REFRESH_MS = 60_000;

export const meKeys = {
  all: ['me'] as const,
};

export function useActiveSanction() {
  const { status } = useAuth();
  return useQuery({
    queryKey: meKeys.all,
    queryFn: fetchMe,
    enabled: status === 'authenticated',
    refetchInterval: ME_REFRESH_MS,
    select: (me) => me.activeSanction,
  });
}
