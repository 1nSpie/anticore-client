"use client";

import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { CRM_LOCATION_LABELS } from "@/app/admin/_lib/crmLocations";
import { useStaffNotificationEvents } from "../../_lib/StaffRealtime";
import { staffApi } from "../../_lib/staffSession";
import { CHECKIN_STATUS_LABEL, type CheckinToday } from "../../_lib/checkinTypes";

const STATUS_STYLE = {
  PENDING: "text-amber-300",
  CONFIRMED: "text-emerald-300",
  REJECTED: "text-red-300",
} as const;

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("unsupported"));
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  });
}

function geoErrorText(e: unknown): string {
  if (e instanceof Error && e.message === "unsupported") return "Устройство не поддерживает геолокацию";
  const code = (e as GeolocationPositionError | undefined)?.code;
  if (code === 1) return "Доступ к геолокации запрещён. Разрешите его в настройках браузера и повторите";
  if (code === 3) return "Не удалось определить местоположение вовремя. Выйдите на открытое место и повторите";
  return "Не удалось определить местоположение";
}

/** Чекин = начало смены (один в сутки). Без подтверждения администратором мастер «не на смене». */
export function CheckinCard() {
  const [state, setState] = useState<CheckinToday | null>(null);
  const [asking, setAsking] = useState(false); // экран согласия на геолокацию
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setState((await staffApi.get<CheckinToday>("/staff/checkin/today")).data);
    } catch {
      toast.error("Не удалось загрузить чекин");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  // Админ подтвердил или отклонил чекин — статус меняется сразу
  useStaffNotificationEvents(
    useCallback((n) => {
      if (n.type.startsWith("CHECKIN_")) void load();
    }, [load]),
  );

  const doCheckin = async () => {
    setBusy(true);
    try {
      const pos = await getPosition();
      await staffApi.post("/staff/checkin", {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracyM: Math.round(pos.coords.accuracy),
      });
      toast.success("Чекин отправлен");
      await load();
    } catch (e) {
      if (e instanceof AxiosError) {
        const m = e.response?.data?.message;
        toast.error(typeof m === "string" ? m : "Не удалось отметиться");
      } else {
        toast.error(geoErrorText(e));
      }
    } finally {
      setBusy(false);
    }
  };

  const onPress = () => {
    if (state && !state.geoConsent) setAsking(true);
    else void doCheckin();
  };

  const agree = async () => {
    setBusy(true);
    try {
      await staffApi.post("/staff/checkin/consent");
      setState((s) => (s ? { ...s, geoConsent: true } : s));
      setAsking(false);
    } catch {
      toast.error("Не удалось сохранить согласие");
      setBusy(false);
      return;
    }
    setBusy(false);
    await doCheckin();
  };

  if (!state) return <div className="h-28 animate-pulse rounded-2xl bg-white/5" />;

  const c = state.checkin;
  const canCheckin = !c || c.status === "REJECTED";

  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MapPin className="h-4 w-4 text-emerald-300" />
        Чекин на смену
      </div>

      {c && (
        <div className="space-y-1 text-sm">
          <p className={STATUS_STYLE[c.status]}>{CHECKIN_STATUS_LABEL[c.status]}</p>
          <p className="text-slate-400">
            {CRM_LOCATION_LABELS[c.location]} ·{" "}
            {new Date(c.createdAt).toLocaleTimeString("ru-RU", { timeZone: "Europe/Moscow", hour: "2-digit", minute: "2-digit" })}
          </p>
          {c.outOfRadius && (
            <p className="text-amber-300">Вне радиуса филиала — {c.distanceM.toLocaleString("ru-RU")} м. Администратор увидит пометку</p>
          )}
        </div>
      )}

      {asking ? (
        <div className="space-y-3 rounded-xl bg-slate-900 p-3 text-sm text-slate-300">
          <p>
            Для чекина нужна ваша геолокация: она сравнивается с адресом филиала. Координаты видит только администратор,
            хранятся они 1 год, затем удаляются.
          </p>
          <div className="flex gap-2">
            <Button onClick={agree} disabled={busy} className="h-11 flex-1">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Согласен"}
            </Button>
            <Button variant="ghost" onClick={() => setAsking(false)} className="h-11">
              Отмена
            </Button>
          </div>
        </div>
      ) : canCheckin ? (
        <Button onClick={onPress} disabled={busy} className="h-12 w-full text-base">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : c ? "Отметиться снова" : "Чекин"}
        </Button>
      ) : null}
    </section>
  );
}
