import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  fetchPushConfig,
  registerPushSubscription,
  removePushSubscription,
} from '@/features/notifications/api';
import { useAuth } from '@/lib/auth';
import { useNotificationPermission } from '@/lib/notifications';
import { dropPushSubscription, isPushSupported, subscribeToPush } from '@/lib/web-push';

const PUSH_CONFIG_KEY = ['notifications', 'push-config'] as const;

export function usePushRegistration(): void {
  const { status } = useAuth();
  const permission = useNotificationPermission();
  const canSubscribe = status === 'authenticated' && permission === 'granted' && isPushSupported();
  const config = useQuery({
    queryKey: PUSH_CONFIG_KEY,
    queryFn: fetchPushConfig,
    enabled: canSubscribe,
    staleTime: Infinity,
  });
  const publicKey = config.data?.enabled ? config.data.publicKey : null;

  useEffect(() => {
    if (!canSubscribe || !publicKey) return;
    void (async () => {
      try {
        const subscription = await subscribeToPush(publicKey);
        if (subscription) await registerPushSubscription(subscription.toJSON());
      } catch {
        return;
      }
    })();
  }, [canSubscribe, publicKey]);
}

export async function unregisterPush(): Promise<void> {
  if (!isPushSupported()) return;
  try {
    const endpoint = await dropPushSubscription();
    if (endpoint) await removePushSubscription(endpoint);
  } catch {
    return;
  }
}
