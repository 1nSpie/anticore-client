// Service worker кабинета мастера: делает приложение устанавливаемым (PWA) и показывает Web Push.
// Страницы и API намеренно НЕ кэшируются — мастер всегда видит актуальные записи, задачи и регламент.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Web Push: уведомления мастеру, когда приложение закрыто (задачи, расписание, регламент…).
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
      data: { url: data.url || "/admin/master" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  // Старые уведомления ведут на /staff… — переписываем на кабинет в админке; чужие адреса не открываем
  const raw = String((event.notification.data && event.notification.data.url) || "").replace(/^\/staff(?=\/|$)/, "/admin/master");
  const url = /^\/admin\/master(\/|$)/.test(raw) ? raw : "/admin/master";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      const open = wins.find((w) => new URL(w.url).pathname.startsWith("/admin/master"));
      if (open) return open.navigate(url).then((c) => c && c.focus());
      return self.clients.openWindow(url);
    }),
  );
});
