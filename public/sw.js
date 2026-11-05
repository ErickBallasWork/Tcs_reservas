// Minimal service worker so notifications also work on mobile browsers.
// Real push handling (VAPID) comes with the backend (BE-29 / FE-25).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const open = clients.find((c) => "focus" in c);
        return open ? open.focus() : self.clients.openWindow("/notifications");
      }),
  );
});