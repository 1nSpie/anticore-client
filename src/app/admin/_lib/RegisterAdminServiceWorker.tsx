"use client";

import { useEffect } from "react";

/** Регистрирует service worker только для зоны /admin (публичный сайт в PWA не входит). */
export function RegisterAdminServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin" }).catch(() => undefined);
  }, []);
  return null;
}
