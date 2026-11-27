// Service worker админки: делает её устанавливаемой (PWA) и показывает Web Push (новые заявки).
// Страницы и API намеренно НЕ кэшируются — в CRM всегда нужны актуальные записи, клиенты и касса.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    /* не JSON — покажем общий текст */
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "АванКор", {
      body: data.body || "",
      tag: data.tag, // одинаковый tag заменяет, а не дублирует уведомление
      icon: "/staff-icon-192.png",
      badge: "/staff-icon-192.png",
      data: { url: data.url || "/admin" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = (event.notification.data && event.notification.data.url) || "/admin";
  // Только внутренние пути админки
  const url = /^\/admin(\/|$)/.test(raw) ? raw : "/admin";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      const open = wins.find((w) => new URL(w.url).pathname.startsWith("/admin"));
      if (open) return open.navigate(url).then((c) => c && c.focus());
      return self.clients.openWindow(url);
    }),
  );
});
