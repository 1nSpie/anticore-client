"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../../_lib/api";
import {
  PAYROLL_ROLE_LABELS,
  apiErrorText,
  formatRub,
  type VisitPayroll,
  type VisitPayrollEntry,
} from "../../_lib/moneyTypes";

type StaffRow = { id: number; fullName: string; role: "ADMIN" | "MASTER"; blockedAt: string | null };

/**
 * Зарплата по записи: приёмщик, начисления (ставка считается при назначении), условия закрытия машины
 * и доп. выплаты, которые управляющий отмечает после закрытия.
 * `refreshKey` меняется, когда запись закрыли/вернули в работу — панель перечитывает данные.
 */
export function VisitPayrollPanel({ visitId, refreshKey }: { visitId: number; refreshKey?: unknown }) {
  const [data, setData] = useState<VisitPayroll | null>(null);
  const [admins, setAdmins] = useState<StaffRow[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData((await adminApi.get<VisitPayroll>(`/crm/payroll/visits/${visitId}`)).data);
    } catch (e) {
      toast.error(apiErrorText(e, "Не удалось загрузить зарплату по записи"));
    }
  }, [visitId]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  useEffect(() => {
    adminApi
      .get<StaffRow[]>("/crm/staff")
      .then((r) => setAdmins(r.data.filter((s) => s.role === "ADMIN" && !s.blockedAt)))
      .catch(() => setAdmins([]));
  }, []);

  const run = async (fn: () => Promise<{ data: VisitPayroll }>, fail: string) => {
    setBusy(true);
    try {
      setData((await fn()).data);
    } catch (e) {
      toast.error(apiErrorText(e, fail));
    } finally {
      setBusy(false);
    }
  };

  if (!data) return null;

  const setReceiver = (id: string) =>
    run(() => adminApi.put<VisitPayroll>(`/crm/payroll/visits/${visitId}/receiver`, { staffId: id ? Number(id) : null }), "Не удалось назначить админа");

  const toggleBonus = (entry: VisitPayrollEntry, typeId: number, granted: boolean) =>
    run(() => adminApi.put<VisitPayroll>(`/crm/payroll/entries/${entry.id}/bonus`, { typeId, granted }), "Не удалось сохранить доп. выплату");

  const missing = data.closing.filter((c) => !c.done);

  return (
    <section className="space-y-3 rounded-lg border border-white/10 bg-slate-950/50 p-3" aria-label="Зарплата по записи">
      <h3 className="text-sm font-semibold text-slate-100">Зарплата по записи</h3>

      <div className="space-y-1">
        <label htmlFor="visit-receiver" className="text-xs text-slate-400">
          Админ на записи
        </label>
        <select
          id="visit-receiver"
          className="h-9 w-full rounded-md border border-white/15 bg-slate-900 px-2 text-sm"
          value={data.receiver?.id ?? ""}
          disabled={busy}
          onChange={(e) => void setReceiver(e.target.value)}
        >
          <option value="">Не назначен</option>
          {data.receiver && !admins.some((a) => a.id === data.receiver!.id) && (
            <option value={data.receiver.id}>{data.receiver.fullName}</option>
          )}
          {admins.map((a) => (
            <option key={a.id} value={a.id}>
              {a.fullName}
            </option>
          ))}
        </select>
      </div>

      {data.entries.length === 0 ? (
        <p className="text-xs text-slate-400">
          Начислений пока нет: назначьте на запись мастера и админа — базовая ставка посчитается сразу.
        </p>
      ) : (
        <ul className="space-y-2">
          {data.entries.map((e) => (
            <li key={e.id} className="rounded-md border border-white/10 bg-slate-900/60 p-2">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="text-slate-100">
                  {e.staffName} <span className="text-xs text-slate-500">· {PAYROLL_ROLE_LABELS[e.role]}</span>
                </span>
                <span className={e.accrued ? "font-medium text-emerald-300" : "text-slate-300"}>{formatRub(e.totalRub)}</span>
              </div>
              <p className="text-xs text-slate-500">
                Ставка {formatRub(e.baseRub)} · {e.accrued ? "начислено" : "начислится после закрытия машины"}
              </p>
              {e.accrued &&
                data.bonusTypes
                  .filter((t) => t.role === e.role)
                  .map((t) => {
                    const on = e.bonuses.some((b) => b.typeId === t.id);
                    return (
                      <label key={t.id} className="mt-1 flex min-h-8 cursor-pointer items-center gap-2 text-sm text-slate-300">
                        <input type="checkbox" checked={on} disabled={busy} onChange={(ev) => void toggleBonus(e, t.id, ev.target.checked)} />
                        {t.title} <span className="text-xs text-slate-500">+{formatRub(t.amountRub)}</span>
                      </label>
                    );
                  })}
              {e.accrued && e.bonuses.filter((b) => b.typeId === null).map((b) => (
                <p key={b.id} className="mt-1 text-xs text-slate-400">
                  {b.title} +{formatRub(b.amountRub)} (тип удалён)
                </p>
              ))}
            </li>
          ))}
        </ul>
      )}

      {!data.closed && (
        <div className="space-y-1">
          <p className="text-xs text-slate-400">Чтобы посчитать зарплату, закройте машину. Нужно:</p>
          <ul className="space-y-0.5">
            {data.closing.map((c) => (
              <li key={c.key} className={`flex items-center gap-2 text-xs ${c.done ? "text-emerald-300" : "text-slate-400"}`}>
                {c.done ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Circle className="h-3.5 w-3.5" aria-hidden />}
                {c.label}
              </li>
            ))}
          </ul>
          {missing.length === 0 && <p className="text-xs text-emerald-300">Всё готово — можно нажать «Выполнено».</p>}
        </div>
      )}

      <Link href="/admin/payroll" className="inline-block text-xs text-emerald-300 underline">
        Ведомость и ставки
      </Link>
    </section>
  );
}
