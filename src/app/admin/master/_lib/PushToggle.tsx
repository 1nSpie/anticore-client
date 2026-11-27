"use client";

import { useEffect, useMemo, useState } from "react";
import { BellOff, BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { createPush, pushSupported } from "@/app/admin/_lib/webPush";
import { staffApi } from "./staffSession";

/** Включение push на этом устройстве: мастер включает сам, разрешение браузера запрашивается только по нажатию. */
export function PushToggle() {
  const push = useMemo(() => createPush(staffApi, "/staff/notifications"), []);
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSupported(pushSupported());
    void push.isEnabled().then(setOn);
  }, [push]);

  if (!supported) {
    return <p className="rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-xs text-slate-500">Push недоступен в этом браузере. На iPhone установите приложение на экран «Домой».</p>;
  }

  const toggle = async () => {
    setBusy(true);
    try {
      if (on) {
        await push.disable();
        setOn(false);
      } else if (await push.enable()) {
        setOn(true);
        toast.success("Push включён на этом устройстве");
      } else {
        toast.error(Notification.permission === "denied" ? "Уведомления запрещены в настройках браузера" : "Push не настроен на сервере");
      }
    } catch {
      toast.error("Не удалось изменить настройку push");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-sm text-slate-300">{on ? "Push включён: уведомления придут, даже если приложение закрыто" : "Получать уведомления, когда приложение закрыто"}</p>
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void toggle()} className="h-10 shrink-0 border-white/20">
        {on ? <BellOff className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
        {on ? "Отключить" : "Включить"}
      </Button>
    </div>
  );
}
