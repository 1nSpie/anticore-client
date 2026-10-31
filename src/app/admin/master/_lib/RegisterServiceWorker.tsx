"use client";

import { useEffect } from "react";

/** Регистрирует service worker только для зоны /admin/master (scope ограничивает его кабинетом мастера). */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/staff-sw.js", { scope: "/admin/master" }).catch(() => undefined);
  }, []);
  return null;
}
