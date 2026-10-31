"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { CRM_LOCATION_LABELS } from "@/app/admin/_lib/crmLocations";
import { useStaffNotificationEvents } from "../_lib/StaffRealtime";
import { staffApi } from "../_lib/staffSession";
import { CheckinCard } from "./_components/CheckinCard";
import { TasksSection } from "./_components/TasksSection";
import { VISIT_STATUS_LABEL, VISIT_STATUS_STYLE, type MasterVisit } from "../_lib/scheduleTypes";

const TZ = "Europe/Moscow";
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("sv-SE", { timeZone: TZ });
const dayTitle = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
const hhmm = (iso: string) =>
  new Date(iso).toLocaleTimeString("ru-RU", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

function VisitCard({ v }: { v: MasterVisit }) {
  return (
    <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-lg font-semibold tabular-nums">
          {hhmm(v.startsAt)}–{hhmm(v.endsAt)}
        </p>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${VISIT_STATUS_STYLE[v.status]}`}>
          {VISIT_STATUS_LABEL[v.status]}
        </span>
      </div>
      <p className="mt-2 font-medium">{v.vehicle?.label || "Автомобиль не указан"}</p>
      {v.vehicle?.vin && <p className="font-mono text-xs text-slate-400">VIN {v.vehicle.vin}</p>}
      <p className="mt-2 text-sm text-slate-300">{v.serviceType}</p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-slate-400">{CRM_LOCATION_LABELS[v.location]}</span>
        <span className="font-semibold">{v.priceRub.toLocaleString("ru-RU")} ₽</span>
      </div>
      {v.comment && <p className="mt-3 border-t border-white/10 pt-3 text-sm text-slate-400">{v.comment}</p>}
    </li>
  );
}

export default function StaffSchedulePage() {
  const [visits, setVisits] = useState<MasterVisit[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setVisits((await staffApi.get<MasterVisit[]>("/staff/schedule")).data);
    } catch {
      toast.error("Не удалось загрузить расписание");
      setVisits((v) => v ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  // Назначили / сняли / перенесли запись — обновляем расписание на лету
  useStaffNotificationEvents(
    useCallback((n) => {
      if (["ASSIGNED", "UNASSIGNED", "SCHEDULE_CHANGED"].includes(n.type)) void load();
    }, [load]),
  );

  const days = useMemo(() => {
    const map = new Map<string, MasterVisit[]>();
    for (const v of visits ?? []) {
      const k = dayKey(v.startsAt);
      map.set(k, [...(map.get(k) ?? []), v]);
    }
    return [...map.entries()];
  }, [visits]);

  return (
    <div className="space-y-5">
      <CheckinCard />
      <TasksSection />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Мои записи</h1>
        <Button variant="ghost" size="icon" onClick={load} disabled={loading} aria-label="Обновить" className="h-11 w-11">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
        </Button>
      </div>

      {visits && !days.length && (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
          На ближайшие две недели записей нет. Когда администратор назначит вас на запись, она появится здесь.
        </p>
      )}

      {days.map(([key, list]) => (
        <section key={key} className="space-y-3">
          <h2 className="text-sm font-medium text-slate-400 first-letter:uppercase">{dayTitle(list[0].startsAt)}</h2>
          <ul className="space-y-3">{list.map((v) => <VisitCard key={v.id} v={v} />)}</ul>
        </section>
      ))}
    </div>
  );
}
