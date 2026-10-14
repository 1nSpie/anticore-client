"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { API_BASE_URL } from "@/app/admin/_lib/constants";
import { getStaffToken, staffApi } from "./staffSession";
import {
  STAFF_NOTIFICATION_EVENT,
  safeStaffLink,
  type NotificationList,
  type StaffNotification,
} from "./notificationTypes";

interface RealtimeValue {
  unread: number;
  refreshUnread: () => Promise<void>;
  setUnread: (n: number) => void;
}

const Ctx = createContext<RealtimeValue>({ unread: 0, refreshUnread: async () => undefined, setUnread: () => undefined });

export const useStaffRealtime = () => useContext(Ctx);

/** Подписка страницы на живые уведомления (обновить задачи, расписание, статус регламента…). */
export function useStaffNotificationEvents(handler: (n: StaffNotification) => void) {
  useEffect(() => {
    const listener = (e: Event) => handler((e as CustomEvent<StaffNotification>).detail);
    window.addEventListener(STAFF_NOTIFICATION_EVENT, listener);
    return () => window.removeEventListener(STAFF_NOTIFICATION_EVENT, listener);
  }, [handler]);
}

/**
 * Живое подключение мастера: WebSocket `/staff` с JWT. Каждое уведомление показывается всплывающим окном (pop-up)
 * и рассылается страницам. При обрыве socket.io переподключается сам; счётчик непрочитанных обновляется заново.
 */
export function StaffRealtimeProvider({ children }: { children: React.ReactNode }) {
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(async () => {
    try {
      const { data } = await staffApi.get<NotificationList>("/staff/notifications", { params: { limit: 1 } });
      setUnread(data.unread);
    } catch {
      /* нет сети или 401 — обработает интерцептор */
    }
  }, []);

  useEffect(() => {
    void refreshUnread();
    const token = getStaffToken();
    if (!token) return;

    const origin = new URL(API_BASE_URL, window.location.href).origin;
    const socket: Socket = io(`${origin}/staff`, {
      path: "/api/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionDelayMax: 10_000,
    });

    socket.on("notification", (n: StaffNotification) => {
      setUnread((c) => c + 1);
      const link = safeStaffLink(n.link);
      toast(n.title, {
        description: n.body ?? undefined,
        duration: 12_000,
        action: link ? { label: "Открыть", onClick: () => window.location.assign(link) } : undefined,
      });
      window.dispatchEvent(new CustomEvent(STAFF_NOTIFICATION_EVENT, { detail: n }));
    });
    // После переподключения могли пропустить события — пересчитываем счётчик
    socket.io.on("reconnect", () => void refreshUnread());

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [refreshUnread]);

  const value = useMemo(() => ({ unread, refreshUnread, setUnread }), [unread, refreshUnread]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
