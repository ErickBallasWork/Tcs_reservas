const DEFAULT_TITLE = 'TCS Reservas';
const DEFAULT_URL = '/notifications';
const ICON = '/icons/icon-192.png';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

function readPayload(event) {
  try {
    return event.data ? event.data.json() : {};
  } catch {
    return {};
  }
}

async function showUnlessAppIsOpen(payload) {
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  const appIsOpen = windows.some(
    (client) => client.visibilityState === 'visible' && client.focused,
  );
  if (appIsOpen) return;
  await self.registration.showNotification(payload.title || DEFAULT_TITLE, {
    body: payload.body,
    tag: payload.tag,
    icon: ICON,
    badge: ICON,
    data: { url: payload.url || DEFAULT_URL },
  });
}

self.addEventListener('push', (event) => {
  event.waitUntil(showUnlessAppIsOpen(readPayload(event)));
});

async function openTarget(url) {
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  const open = windows.find((client) => 'focus' in client);
  if (!open) return self.clients.openWindow(url);
  await open.focus();
  if ('navigate' in open) await open.navigate(url);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || DEFAULT_URL;
  event.waitUntil(openTarget(url));
});
