"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, updateApiToken } from "../_lib/api";
import { AUTH_TOKEN_KEY } from "../_lib/constants";

/** Редирект на /admin, если нет валидной сессии админ-панели. */
export function useRequireAdmin() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        router.replace("/admin");
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
