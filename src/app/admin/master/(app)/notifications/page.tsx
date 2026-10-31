"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { cn } from "src/lib/utils";
import { staffApi } from "../../_lib/staffSession";
import { useStaffNotificationEvents, useStaffRealtime } from "../../_lib/StaffRealtime";
import { fmtNotificationTime, safeStaffLink, type NotificationList, type StaffNotification } from "../../_lib/notificationTypes";

export default function StaffNotificationsPage() {
  const router = useRouter();
  const { setUnread } = useStaffRealtime();
  const [data, setData] = useState<NotificationList | null>(null);

  const load = useCallback(async () => {
    try {
      const r = (await staffApi.get<NotificationList>("/staff/notifications")).data;
      setData(r);
      setUnread(r.unread);
    } catch {
      toast.error("Не удалось загрузить уведомления");
      setData((d) => d ?? { items: [], unread: 0 });
    }
  }, [setUnread]);

  useEffect(() => {
    void load();
  }, [load]);
  useStaffNotificationEvents(useCallback(() => void load(), [load]));

  const open = async (n: StaffNotification) => {
    if (!n.readAt) {
      await staffApi.post(`/staff/notifications/${n.id}/read`).catch(() => undefined);
      setData((d) => d && { ...d, unread: Math.max(0, d.unread - 1), items: d.items.map((i) => (i.id === n.id ? { ...i, readAt: new Date().toISOString() } : i)) });
      setUnread(Math.max(0, (data?.unread ?? 1) - 1));
    }
    const link = safeStaffLink(n.link);
    if (link) router.push(link);
  };

  const readAll = async () => {
    await staffApi.post("/staff/notifications/read-all").catch(() => undefined);
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Уведомления</h1>
        {!!data?.unread && (
          <Button variant="ghost" size="sm" onClick={readAll} className="h-10">Прочитать все</Button>
        )}
      </div>

      {!data ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" />
      ) : data.items.length ? (
        <ul className="space-y-2">
          {data.items.map((n) => (
            <li key={n.id}>
              <button type="button" onClick={() => open(n)}
                className={cn("w-full rounded-2xl border p-4 text-left active:bg-white/10",
                  n.readAt ? "border-white/5 bg-white/[0.03] text-slate-400" : "border-emerald-400/30 bg-emerald-400/10")}>
                <div className="flex items-start justify-between gap-3">
                  <p className={cn("font-medium leading-snug", !n.readAt && "text-slate-100")}>{n.title}</p>
                  {!n.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400" aria-label="Не прочитано" />}
                </div>
                {n.body && <p className="mt-1 text-sm">{n.body}</p>}
                <p className="mt-2 text-xs text-slate-500">{fmtNotificationTime(n.createdAt)}</p>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 text-slate-500">
          <Bell className="h-8 w-8" />
          <p className="text-sm">Пока уведомлений нет</p>
        </div>
      )}
    </div>
  );
}
