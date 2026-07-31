"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "../../_lib/api";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

type DayLimit = {
  date: string;
  maxAppointments: number;
  note: string | null;
};

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

/** Понедельник = 0 … воскресенье = 6 */
function mondayBasedWeekday(year: number, month: number, day: number) {
  const js = new Date(year, month - 1, day).getDay();
  return js === 0 ? 6 : js - 1;
}

function padDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function LeadDayLimitsPanel() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get<DayLimit[]>("/crm/settings/day-limits", {
        params: { year, month },
      });
      const map: Record<string, string> = {};
      for (const row of data) {
        map[row.date] = String(row.maxAppointments);
      }
      setLimits(map);
    } catch {
      toast.error("Не удалось загрузить лимиты");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const cells = useMemo(() => {
    const total = daysInMonth(year, month);
    const offset = mondayBasedWeekday(year, month, 1);
    const items: Array<{ day: number | null; date: string | null }> = [];
    for (let i = 0; i < offset; i++) items.push({ day: null, date: null });
    for (let d = 1; d <= total; d++) {
      items.push({ day: d, date: padDate(year, month, d) });
    }
    return items;
  }, [year, month]);

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  const save = async () => {
    const items = Object.entries(limits)
      .filter(([, v]) => v.trim() !== "")
      .map(([date, v]) => ({
        date,
        maxAppointments: Math.max(0, Number.parseInt(v, 10) || 0),
      }));

    setSaving(true);
    try {
      await adminApi.put("/crm/settings/day-limits", { items });
      toast.success("Лимиты сохранены");
      await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      toast.error(msg || "Не удалось сохранить лимиты");
    } finally {
      setSaving(false);
    }
  };

  const clearDay = async (date: string) => {
    try {
      await adminApi.delete(`/crm/settings/day-limits/${date}`);
      setLimits((prev) => {
        const next = { ...prev };
        delete next[date];
        return next;
      });
      toast.success("Лимит снят");
    } catch {
      toast.error("Не удалось снять лимит");
    }
  };

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mb-6 rounded-xl border border-white/10 bg-slate-900/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Лимиты записей по дням
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Укажите максимум записей в календарь на день (0 — день закрыт). Дни
            без значения без ограничения.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-white/20"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Скрыть" : "Настроить месяц"}
        </Button>
      </div>

      {open && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-300"
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Label className="capitalize text-slate-200">{monthLabel}</Label>
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-300"
              onClick={() => shiftMonth(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Загрузка…</p>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 sm:text-xs">
                {WEEKDAYS.map((w) => (
                  <div key={w}>{w}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((cell, idx) =>
                  cell.day == null || !cell.date ? (
                    <div key={`e-${idx}`} className="min-h-14" />
                  ) : (
                    <div
                      key={cell.date}
                      className="min-h-14 rounded-md border border-white/10 bg-slate-950/60 p-1"
                    >
                      <div className="mb-1 flex items-center justify-between gap-1">
                        <span className="text-[10px] text-slate-400">
                          {cell.day}
                        </span>
                        {limits[cell.date] !== undefined && (
                          <button
                            type="button"
                            className="text-[9px] text-slate-500 hover:text-red-400"
                            onClick={() => void clearDay(cell.date!)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <Input
                        type="number"
                        min={0}
                        placeholder="∞"
                        className="h-7 border-white/10 bg-slate-900 px-1 text-center text-xs text-white"
                        value={limits[cell.date] ?? ""}
                        onChange={(e) =>
                          setLimits((prev) => ({
                            ...prev,
                            [cell.date!]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ),
                )}
              </div>
              <div className="flex justify-end">
                <Button size="sm" disabled={saving} onClick={() => void save()}>
                  {saving ? "Сохранение…" : "Сохранить лимиты"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
