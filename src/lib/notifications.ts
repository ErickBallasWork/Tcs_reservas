'use client';

import { useEffect, useState } from 'react';

export type PermissionState = NotificationPermission | 'unsupported';

export const REQUIRE_NOTIFICATIONS = true;

export function getPermissionState(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Browsers only allow this call from a user gesture.
export async function requestPermission(): Promise<PermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result ?? Notification.permission;
  } catch {
    return Notification.permission;
  }
}

async function getRegistration() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    await navigator.serviceWorker.register('/sw.js');
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export async function showSystemNotification(title: string, body: string) {
  if (getPermissionState() !== 'granted') return false;
  const options: NotificationOptions = { body };
  try {
    const registration = await getRegistration();
    if (registration) {
      await registration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
    return true;
  } catch {
    return false;
  }
}

export function useNotificationPermission() {
  const [state, setState] = useState<PermissionState | null>(null);

  useEffect(() => {
    const update = () => setState(getPermissionState());
    update();

    let status: PermissionStatus | null = null;
    navigator.permissions
      ?.query({ name: 'notifications' })
      .then((s) => {
        status = s;
        s.onchange = update;
      })
      .catch(() => {});

    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      if (status) status.onchange = null;
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return state;
}
