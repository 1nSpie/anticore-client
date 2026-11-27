"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/shadcn/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/popover";
import { adminApi } from "../../_lib/api";
import { API_BASE_URL, AUTH_TOKEN_KEY } from "../../_lib/constants";
import { disablePush, enablePush, isPushEnabled, pushSupported } from "../../_lib/adminPush";

interface AdminNotification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

/** Только внутренние пути админки: ссылка из уведомления не должна уводить на чужой адрес. */
const safeLink = (link: string | null) => (link && /^\/admin(\/|$)/.test(link) ? link : null);

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", { timeZone: "Europe/Moscow", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Колокольчик администратора: лента, всплывающие окна по WebSocket и включение push на этом устройстве. */
export function AdminNotificationsBell() {
  const router = useRouter();
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [canPush, setCanPush] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await adminApi.get<{ items: AdminNotification[]; unread: number }>("/crm/notifications", { params: { limit: 30 } });
      setItems(data.items);
      setUnread(data.unread);
    } catch {
      /* нет сети или 401 — обработает интерцептор */
    }
  }, []);

  useEffect(() => {
    void load();
    setCanPush(pushSupported());
    void isPushEnabled().then(setPushOn);

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return;
    const origin = new URL(API_BASE_URL, window.location.href).origin;
    const socket = io(`${origin}/admin`, {
      path: "/api/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionDelayMax: 10_000,
    });
    socket.on("notification", (n: AdminNotification) => {
      setItems((list) => [n, ...list].slice(0, 30));
      setUnread((c) => c + 1);
      const link = safeLink(n.link);
      toast(n.title, {
        description: n.body ?? undefined,
        duration: 12_000,
        action: link ? { label: "Открыть", onClick: () => router.push(link) } : undefined,
      });
    });
    // После переподключения могли пропустить события
    socket.io.on("reconnect", () => void load());
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [load, router]);

  const openItem = async (n: AdminNotification) => {
    setOpen(false);
    if (!n.readAt) {
      setItems((list) => list.map((i) => (i.id === n.id ? { ...i, readAt: new Date().toISOString() } : i)));
      setUnread((c) => Math.max(0, c - 1));
      void adminApi.post(`/crm/notifications/${n.id}/read`).catch(() => undefined);
    }
    const link = safeLink(n.link);
    if (link) router.push(link);
  };

  const readAll = async () => {
    await adminApi.post("/crm/notifications/read-all");
    setItems((list) => list.map((i) => ({ ...i, readAt: i.readAt ?? new Date().toISOString() })));
    setUnread(0);
  };

  const togglePush = async () => {
    try {
      if (pushOn) {
        await disablePush();
        setPushOn(false);
      } else if (await enablePush()) {
        setPushOn(true);
        toast.success("Push включён на этом устройстве");
      } else {
        toast.error(Notification.permission === "denied" ? "Уведомления запрещены в настройках браузера" : "Push не настроен на сервере");
      }
    } catch {
      toast.error("Не удалось изменить настройку push");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" aria-label={unread ? `Уведомления: ${unread} новых` : "Уведомления"} className="relative border-white/10 bg-transparent text-slate-300">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1 text-[11px] font-semibold text-slate-950">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(380px,92vw)] border-white/10 bg-[#101722] p-0 text-slate-200">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <span className="text-sm font-semibold text-slate-50">Уведомления</span>
          {unread > 0 && (
            <button type="button" onClick={() => void readAll()} className="text-xs text-emerald-300 hover:underline">
              Прочитать все
            </button>
          )}
        </div>
        <ul className="max-h-96 overflow-y-auto">
          {items.length === 0 && <li className="px-4 py-6 text-center text-sm text-slate-500">Пока нет уведомлений</li>}
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => void openItem(n)}
                className="block w-full border-b border-white/5 px-4 py-3 text-left hover:bg-white/5"
              >
                <span className="flex items-start gap-2">
                  {!n.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" aria-label="Не прочитано" />}
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-50">{n.title}</span>
                    {n.body && <span className="block truncate text-xs text-slate-400">{n.body}</span>}
                    <span className="block text-[11px] text-slate-500">{fmtTime(n.createdAt)}</span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {canPush && (
          <div className="border-t border-white/10 px-4 py-3">
            <button type="button" onClick={() => void togglePush()} className="flex items-center gap-2 text-xs text-slate-300 hover:text-slate-50">
              {pushOn ? <BellOff className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
              {pushOn ? "Отключить push на этом устройстве" : "Включить push на этом устройстве"}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
