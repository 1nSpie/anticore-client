// components/DelayedModal.tsx
"use client";

import { CallbackModal } from "@/app/ui/ui/CallbackModal";
import { useEffect, useState } from "react";

const MODAL_SEEN_KEY = "lastModalSeenTime";

export function DelayedModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const lastSeen = localStorage.getItem(MODAL_SEEN_KEY);
    const now = Date.now();

    // Если модалку ещё не показывали или прошло больше 24 часов — показываем
    if (!lastSeen || now - Number(lastSeen) > 24 * 60 * 60 * 1000) {
      const timer = setTimeout(() => {
        setOpen(true);
        // Сохраняем время показа
        localStorage.setItem(MODAL_SEEN_KEY, String(now));
      }, 30000); // 30 секунд

      return () => clearTimeout(timer);
    }
    // Если менее 24 часов прошло — ничего не делаем
  }, []);

  return <CallbackModal setView={setOpen} hasOpen={open} />;
}
