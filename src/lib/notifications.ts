'use client';

import { useEffect, useState } from 'react';

export type PermissionState = NotificationPermission | 'unsupported';

// Set to false to make browser notifications optional
export const REQUIRE_NOTIFICATIONS = true;

export function getPermissionState(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Must be called from a user gesture (click / submit)
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

// Current permission, kept in sync if the user changes it in the browser
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

  return state; // null until it has been read on the client
}
