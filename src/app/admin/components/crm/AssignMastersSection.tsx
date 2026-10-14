"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Loader2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/button";
import { Label } from "@/shadcn/label";
import { adminApi } from "../../_lib/api";
import { CRM_LOCATION_LABELS } from "../../_lib/crmLocations";
import type { StaffMember } from "../../_lib/staffTypes";

type Props = {
  appointmentId: number;
  assigned: { id: number; fullName: string }[];
  onSaved: () => Promise<void> | void;
};

/** Кнопка «Назначить мастера»: один мастер — несколько записей, несколько мастеров — одна запись. */
export function AssignMastersSection({ appointmentId, assigned, onSaved }: Props) {
  const [masters, setMasters] = useState<StaffMember[] | null>(null);
  const [open, setOpen] = useState(false);
  // Диалог держит устаревшую запись после сохранения — актуальный список берём из ответа API
  const [current, setCurrent] = useState(assigned);
  const [selected, setSelected] = useState<number[]>(assigned.map((a) => a.id));
  const [saving, setSaving] = useState(false);

  // Ключ вместо массива: `assigned` приходит новым объектом на каждый рендер
  const assignedKey = `${appointmentId}:${assigned.map((a) => a.id).join(",")}`;
  useEffect(() => {
    setCurrent(assigned);
    setSelected(assigned.map((a) => a.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedKey]);

  useEffect(() => {
    if (!open || masters) return;
    adminApi
      .get<StaffMember[]>("/crm/staff")
      .then((r) => setMasters(r.data.filter((s) => s.role === "MASTER" && !s.blockedAt)))
      .catch(() => toast.error("Не удалось загрузить мастеров"));
  }, [open, masters]);

  const toggle = (id: number) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await adminApi.put<{ assignees: { id: number; fullName: string }[] }>(
        `/crm/appointments/${appointmentId}/staff`,
        { staffIds: selected },
      );
      setCurrent(data.assignees);
      toast.success(selected.length ? "Мастера назначены" : "Мастера сняты с записи");
      await onSaved();
      setOpen(false);
    } catch (err) {
      const m = err instanceof AxiosError ? err.response?.data?.message : undefined;
      toast.error(typeof m === "string" ? m : "Не удалось назначить мастеров");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2 rounded-lg border border-white/10 bg-slate-950/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="flex items-center gap-2">
          <UserCog className="h-4 w-4" />
          Мастера
        </Label>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
          Назначить мастера
        </Button>
      </div>

      <p className="text-sm text-slate-300">
        {current.length ? current.map((a) => a.fullName).join(", ") : "Не назначены"}
      </p>

      {open && (
        <div className="space-y-3 border-t border-white/10 pt-3">
          {!masters ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : masters.length ? (
            <div className="flex flex-wrap gap-2">
              {masters.map((m) => {
                const on = selected.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggle(m.id)}
                    aria-pressed={on}
                    className={cn(
                      "min-h-9 rounded-full border px-3 text-sm transition-colors",
                      on
                        ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200"
                        : "border-white/15 text-slate-300 hover:bg-white/5",
                    )}
                  >
                    {m.fullName}
                    {m.locations.length > 0 && (
                      <span className="ml-1 text-xs text-slate-500">
                        · {m.locations.map((l) => CRM_LOCATION_LABELS[l]).join(", ")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Активных мастеров нет — создайте их в разделе «Сотрудники».</p>
          )}
          <Button type="button" size="sm" disabled={saving} onClick={save}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
          </Button>
        </div>
      )}
    </div>
  );
}
