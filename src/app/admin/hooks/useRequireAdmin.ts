"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, updateApiToken } from "../_lib/api";
import { AUTH_TOKEN_KEY } from "../_lib/constants";
import { MASTER_HOME, hasStaffToken } from "../_lib/session";

/**
 * Гвард админ-панели. Нет сессии — на общий вход `/admin`; вошёл мастер — в его кабинет (`/admin/master`),
 * админка ему закрыта (и на API тоже: токен мастера `/crm/*` не открывает).
 */
export function useRequireAdmin() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        router.replace(hasStaffToken() ? MASTER_HOME : "/admin");
        return;
      }
      updateApiToken(token);
      try {
        await adminApi.get("/admin/check-auth");
        setReady(true);
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        updateApiToken(null);
        router.replace("/admin");
      }
    };
    void run();
  }, [router]);

  return ready;
}
