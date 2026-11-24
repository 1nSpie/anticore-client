"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { adminApi } from "../../_lib/api";
import { useQueryParams } from "../../_lib/useQueryParams";
import {
  CRM_LOCATIONS,
  CRM_LOCATION_LABELS,
  PAYROLL_ROLE_LABELS,
  apiErrorText,
  formatRub,
  monthStartMsk,
  todayMsk,
  type BonusType,
  type PayrollReport,
  type PayrollRole,
  type PayrollSettings,
} from "../../_lib/moneyTypes";
import { Field, PageTitle, Stat, Tabs, fieldCls, tableCls, tdCls, thCls } from "./ui";

type Tab = "report" | "settings";

function Report() {
  const { params, set } = useQueryParams();
  const from = params.get("from") ?? monthStartMsk();
  const to = params.get("to") ?? todayMsk();
  const location = params.get("location") ?? "";
  const [data, setData] = useState<PayrollReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    adminApi
      .get<PayrollReport>("/crm/payroll/report", { params: { from, to, ...(location ? { location } : {}) } })
      .then((r) => alive && setData(r.data))
      .catch((e) => alive && toast.error(apiErrorText(e, "Не удалось загрузить ведомость")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [from, to, location]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="С">
          <input type="date" className={fieldCls} value={from} onChange={(e) => set({ from: e.target.value })} />
        </Field>
        <Field label="По">
          <input type="date" className={fieldCls} value={to} onChange={(e) => set({ to: e.target.value })} />
        </Field>
        <Field label="Филиал">
          <select className={fieldCls} value={location} onChange={(e) => set({ location: e.target.value })}>
            <option value="">Все</option>
            {CRM_LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {CRM_LOCATION_LABELS[l]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {!data ? (
        <p className="text-sm text-slate-400">{loading ? "Загрузка…" : "Нет данных"}</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="К выплате за период" value={formatRub(data.totalRub)} />
            <Stat label="Сотрудников" value={String(data.staff.length)} />
            <Stat label="Начислений" value={String(data.entries.length)} />
          </div>
          <p className="text-xs text-slate-500">В ведомость попадают только записи, по которым машина закрыта (по дате закрытия).</p>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>Сотрудник</th>
                  <th className={thCls}>Заказов</th>
                  <th className={thCls}>Ставки</th>
                  <th className={thCls}>Доп. выплаты</th>
                  <th className={thCls}>Итого</th>
                </tr>
              </thead>
              <tbody>
                {data.staff.length === 0 && (
                  <tr>
                    <td className={tdCls} colSpan={5}>
                      За период нет начислений
                    </td>
                  </tr>
                )}
                {data.staff.map((s) => (
                  <tr key={`${s.staffId}-${s.staffName}`} className="border-t border-white/5">
                    <td className={tdCls}>{s.staffName}</td>
                    <td className={tdCls}>{s.orders}</td>
                    <td className={tdCls}>{formatRub(s.baseRub)}</td>
                    <td className={tdCls}>{formatRub(s.bonusRub)}</td>
                    <td className={`${tdCls} font-medium text-emerald-300`}>{formatRub(s.totalRub)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.entries.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className={tableCls}>
                <thead>
                  <tr>
                    <th className={thCls}>Дата</th>
                    <th className={thCls}>Запись</th>
                    <th className={thCls}>Сотрудник</th>
                    <th className={thCls}>Роль</th>
                    <th className={thCls}>Ставка</th>
                    <th className={thCls}>Доп. выплаты</th>
                    <th className={thCls}>Итого</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map((e) => (
                    <tr key={e.id} className="border-t border-white/5">
                      <td className={tdCls}>{e.visitDate.split("-").reverse().join(".")}</td>
                      <td className={tdCls}>
                        <Link className="text-emerald-300 underline" href={`/admin/appointments/${e.visitId}`}>
                          {e.docNumber ?? `№${e.visitId}`}
                        </Link>{" "}
                        <span className="text-xs text-slate-500">{CRM_LOCATION_LABELS[e.location]}</span>
                      </td>
                      <td className={tdCls}>{e.staffName}</td>
                      <td className={tdCls}>{PAYROLL_ROLE_LABELS[e.role]}</td>
                      <td className={tdCls}>{formatRub(e.baseRub)}</td>
                      <td className={tdCls}>{e.bonuses.length ? e.bonuses.map((b) => `${b.title} +${b.amountRub}`).join(", ") : "—"}</td>
                      <td className={tdCls}>{formatRub(e.totalRub)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Settings() {
  const [rates, setRates] = useState<{ masterBaseRub: string; receiverBaseRub: string } | null>(null);
  const [types, setTypes] = useState<BonusType[]>([]);
  const [draft, setDraft] = useState<{ title: string; amountRub: string; role: PayrollRole }>({ title: "", amountRub: "", role: "MASTER" });

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([
        adminApi.get<PayrollSettings>("/crm/payroll/settings"),
        adminApi.get<BonusType[]>("/crm/payroll/bonus-types"),
      ]);
      setRates({ masterBaseRub: String(s.data.masterBaseRub), receiverBaseRub: String(s.data.receiverBaseRub) });
      setTypes(t.data);
    } catch (e) {
      toast.error(apiErrorText(e, "Не удалось загрузить настройки"));
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const saveRates = async () => {
    if (!rates) return;
    try {
      await adminApi.put("/crm/payroll/settings", { masterBaseRub: Number(rates.masterBaseRub) || 0, receiverBaseRub: Number(rates.receiverBaseRub) || 0 });
      toast.success("Ставки сохранены. Уже назначенные записи считаются по прежним ставкам.");
    } catch (e) {
      toast.error(apiErrorText(e, "Не удалось сохранить ставки"));
    }
  };

  const addType = async () => {
    try {
      await adminApi.post("/crm/payroll/bonus-types", { title: draft.title, amountRub: Number(draft.amountRub) || 0, role: draft.role });
      setDraft({ ...draft, title: "", amountRub: "" });
      await load();
    } catch (e) {
      toast.error(apiErrorText(e, "Не удалось добавить выплату"));
    }
  };

  const patchType = async (id: number, body: Partial<BonusType>) => {
    try {
      await adminApi.patch(`/crm/payroll/bonus-types/${id}`, body);
      await load();
    } catch (e) {
      toast.error(apiErrorText(e, "Не удалось сохранить"));
    }
  };

  if (!rates) return <p className="text-sm text-slate-400">Загрузка…</p>;
  return (
    <div className="max-w-2xl space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-50">Базовая ставка за заказ</h2>
        <p className="text-sm text-slate-400">Копируется в начисление при назначении мастера или админа на запись; потом смена ставки старые записи не меняет.</p>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Мастер, ₽">
            <input type="number" min={0} className={fieldCls} value={rates.masterBaseRub} onChange={(e) => setRates({ ...rates, masterBaseRub: e.target.value })} />
          </Field>
          <Field label="Админ, ₽">
            <input type="number" min={0} className={fieldCls} value={rates.receiverBaseRub} onChange={(e) => setRates({ ...rates, receiverBaseRub: e.target.value })} />
          </Field>
          <Button onClick={() => void saveRates()}>Сохранить</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-50">Доп. выплаты</h2>
        <p className="text-sm text-slate-400">Управляющий ставит галочки в записи после закрытия машины: чистота, отзыв и т. д.</p>
        <ul className="space-y-2">
          {types.length === 0 && <li className="text-sm text-slate-500">Пока нет ни одной выплаты</li>}
          {types.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-[#101722] p-3 text-sm">
              <span className={t.active ? "text-slate-100" : "text-slate-500 line-through"}>{t.title}</span>
              <span className="text-xs text-slate-500">{PAYROLL_ROLE_LABELS[t.role]}</span>
              <input
                type="number"
                min={0}
                aria-label={`Сумма: ${t.title}`}
                className={`${fieldCls} ml-auto w-28`}
                defaultValue={t.amountRub}
                onBlur={(e) => Number(e.target.value) !== t.amountRub && void patchType(t.id, { amountRub: Number(e.target.value) || 0 })}
              />
              <Button variant="ghost" size="sm" onClick={() => void patchType(t.id, { active: !t.active })}>
                {t.active ? "Отключить" : "Включить"}
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Название" className="min-w-48 flex-1">
            <input className={fieldCls} value={draft.title} placeholder="Например, Чистота" onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </Field>
          <Field label="Сумма, ₽">
            <input type="number" min={0} className={`${fieldCls} w-28`} value={draft.amountRub} onChange={(e) => setDraft({ ...draft, amountRub: e.target.value })} />
          </Field>
          <Field label="Кому">
            <select className={fieldCls} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as PayrollRole })}>
              <option value="MASTER">Мастер</option>
              <option value="RECEIVER">Админ</option>
            </select>
          </Field>
          <Button disabled={draft.title.trim().length < 2} onClick={() => void addType()}>
            Добавить
          </Button>
        </div>
      </section>
    </div>
  );
}

function Inner() {
  const { params, set } = useQueryParams();
  const tab: Tab = params.get("tab") === "settings" ? "settings" : "report";
  return (
    <>
      <PageTitle title="Зарплата" hint="Ставка считается при назначении, начисляется после закрытия машины, доп. выплаты ставит управляющий." />
      <Tabs
        value={tab}
        onChange={(t) => set({ tab: t === "report" ? null : t })}
        items={[
          { id: "report", label: "Ведомость" },
          { id: "settings", label: "Ставки и выплаты" },
        ]}
      />
      {tab === "report" ? <Report /> : <Settings />}
    </>
  );
}

export function PayrollManager() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
