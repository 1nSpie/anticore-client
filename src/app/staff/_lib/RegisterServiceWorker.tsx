"use client";

import { useEffect } from "react";

/** Регистрирует service worker только для зоны /staff (scope ограничивает его кабинетом мастера). */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/staff-sw.js", { scope: "/staff" }).catch(() => undefined);
  }, []);
  return null;
}
