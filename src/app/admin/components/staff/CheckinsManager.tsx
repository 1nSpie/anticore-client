"use client";

import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Check, Loader2, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { cn } from "src/lib/utils";
import { adminApi } from "../../_lib/api";
import { CRM_LOCATIONS, CRM_LOCATION_LABELS, type CrmLocationCode } from "../../_lib/crmLocations";

type Status = "PENDING" | "CONFIRMED" | "REJECTED";
interface CheckinRow {
  id: number;
  location: CrmLocationCode;
  distanceM: number;
  outOfRadius: boolean;
  accuracyM: number | null;
  status: Status;
  createdAt: string;
  staff: { id: number; fullName: string; login: string };
}

const STATUS_LABEL: Record<Status, { text: string; cls: string }> = {
  PENDING: { text: "Ждёт подтверждения", cls: "text-amber-300" },
  CONFIRMED: { text: "Подтверждён", cls: "text-emerald-300" },
  REJECTED: { text: "Отклонён", cls: "text-red-300" },
};

const todayMsk = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Moscow" });

export default function CheckinsManager() {
  const [date, setDate] = useState(todayMsk);
  const [location, setLocation] = useState<CrmLocationCode | "">("");
  const [rows, setRows] = useState<CheckinRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get<CheckinRow[]>("/crm/checkins", {
        params: { date, location: location || undefined },
      });
      setRows(data);
    } catch {
      toast.error("Не удалось загрузить чекины");
    } finally {
      setLoading(false);
    }
  }, [date, location]);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = async (id: number, status: "CONFIRMED" | "REJECTED") => {
    try {
      await adminApi.post(`/crm/checkins/${id}/decision`, { status });
      toast.success(status === "CONFIRMED" ? "Чекин подтверждён" : "Чекин отклонён");
      await load();
    } catch (e) {
      const m = e instanceof AxiosError ? e.response?.data?.message : undefined;
      toast.error(typeof m === "string" ? m : "Не удалось сохранить решение");
    }
  };

  const pending = rows.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="ck-date" className="text-xs text-slate-400">Дата</label>
          <Input id="ck-date" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="w-44" />
        </div>
        <div className="flex gap-2">
          {(["", ...CRM_LOCATIONS] as const).map((l) => (
            <Button key={l || "all"} size="sm" variant={location === l ? "default" : "outline"} onClick={() => setLocation(l)}>
              {l ? CRM_LOCATION_LABELS[l] : "Все филиалы"}
            </Button>
          ))}
        </div>
        {pending > 0 && <span className="text-sm text-amber-300">Ждут подтверждения: {pending}</span>}
      </div>

      {loading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" />
      ) : rows.length ? (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="p-3">Мастер</th><th className="p-3">Время</th><th className="p-3">Филиал</th>
                <th className="p-3">Расстояние</th><th className="p-3">Статус</th><th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="p-3">{r.staff.fullName}<span className="ml-2 text-xs text-slate-500">{r.staff.login}</span></td>
                  <td className="p-3 whitespace-nowrap text-slate-400">
                    {new Date(r.createdAt).toLocaleTimeString("ru-RU", { timeZone: "Europe/Moscow", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="p-3">{CRM_LOCATION_LABELS[r.location]}</td>
                  <td className={cn("p-3 whitespace-nowrap", r.outOfRadius ? "text-amber-300" : "text-slate-400")}>
                    {r.outOfRadius && <TriangleAlert className="mr-1 inline h-4 w-4" aria-label="Вне радиуса" />}
                    {r.distanceM.toLocaleString("ru-RU")} м{r.accuracyM != null && <span className="ml-1 text-xs text-slate-500">±{r.accuracyM}</span>}
                  </td>
                  <td className={cn("p-3", STATUS_LABEL[r.status].cls)}>{STATUS_LABEL[r.status].text}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      {r.status !== "CONFIRMED" && (
                        <Button size="sm" variant="outline" onClick={() => decide(r.id, "CONFIRMED")}><Check className="h-4 w-4" />Подтвердить</Button>
                      )}
                      {r.status === "PENDING" && (
                        <Button size="sm" variant="outline" className="text-red-400" onClick={() => decide(r.id, "REJECTED")}><X className="h-4 w-4" />Отклонить</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-slate-500">В этот день чекинов нет</p>
      )}
    </div>
  );
}
