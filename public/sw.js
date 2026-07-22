// CHEFE Service Worker — Web Push rico (estilo Uber/99)
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "CHEFE", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "CHEFE";
  const actions = Array.isArray(data.actions) ? data.actions : [];
  const options = {
    body: data.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    image: data.image || undefined,
    vibrate: data.vibrate || [200, 100, 200, 100, 400],
    tag: data.tag || "chefe-alert",
    renotify: true,
    requireInteraction: data.requireInteraction !== false,
    silent: false,
    timestamp: Date.now(),
    actions,
    data: { url: data.url || "/", action_map: data.action_map || {} },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  const notif = event.notification;
  notif.close();
  const actionId = event.action;
  const map = (notif.data && notif.data.action_map) || {};
  const url = (actionId && map[actionId]) || (notif.data && notif.data.url) || "/";
  event.waitUntil(
    (async () => {
      // Se for uma ação de resposta rápida, dispara fetch pra API pública sem abrir o app
      if (actionId && map[actionId]) {
        try {
          await fetch("/api/public/quick-reply", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: actionId, tag: notif.tag }),
            keepalive: true,
          });
        } catch (e) {
          // fallthrough — abre janela mesmo se falhar
        }
      }
      const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of list) {
        if ("focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })(),
  );
});