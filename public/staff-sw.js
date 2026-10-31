// Минимальный service worker кабинета мастера: делает приложение устанавливаемым (PWA).
// Страницы и API намеренно НЕ кэшируются — мастер всегда видит актуальные записи, задачи и регламент.
// Точка расширения для web-push (событие `push`), когда он понадобится.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
