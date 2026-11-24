"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { adminApi } from "../../_lib/api";
import { useQueryParams } from "../../_lib/useQueryParams";
import {
  CRM_LOCATIONS,
  CRM_LOCATION_LABELS,
  apiErrorText,
  formatRub,
  monthStartMsk,
  todayMsk,
  type CashReport,
  type CrmLocationCode,
} from "../../_lib/moneyTypes";
import { Field, PageTitle, Stat, fieldCls, tableCls, tdCls, thCls } from "./ui";

const ruDate = (d: string) => d.split("-").reverse().join(".");

function Inner() {
  const { params, set } = useQueryParams();
  const from = params.get("from") ?? monthStartMsk();
  const to = params.get("to") ?? todayMsk();
  const location = params.get("location") ?? "";
  const [data, setData] = useState<CashReport | null>(null);
  const [form, setForm] = useState<{ location: CrmLocationCode; direction: "IN" | "OUT"; amountRub: string; date: string; category: string; comment: string }>({
    location: "ZHUKOVSKY",
    direction: "IN",
    amountRub: "",
    date: todayMsk(),
    category: "",
    comment: "",
  });
  const [saving, setSaving] = useState(false);

  const query = { from, to, ...(location ? { location } : {}) };
  const load = useCallback(async () => {
    try {
      setData((await adminApi.get<CashReport>("/crm/cash", { params: { from, to, ...(location ? { location } : {}) } })).data);
    } catch (e) {
      toast.error(apiErrorText(e, "Не удалось загрузить кассу"));
    }
  }, [from, to, location]);
  useEffect(() => {
    void load();
  }, [load]);

  const add = async () => {
    setSaving(true);
    try {
      await adminApi.post("/crm/cash", {
        location: form.location,
        direction: form.direction,
        amountRub: Number(form.amountRub),
        date: form.date,
        ...(form.category.trim() ? { category: form.category.trim() } : {}),
        ...(form.comment.trim() ? { comment: form.comment.trim() } : {}),
      });
      setForm({ ...form, amountRub: "", category: "", comment: "" });
      await load();
    } catch (e) {
      toast.error(apiErrorText(e, "Не удалось внести операцию"));
    } finally {
      setSaving(false);
    }
  };

  const voidEntry = async (id: number) => {
    const reason = prompt("Причина аннулирования операции");
    if (!reason || reason.trim().length < 3) return;
    try {
      await adminApi.post(`/crm/cash/${id}/void`, { reason: reason.trim() });
      await load();
    } catch (e) {
      toast.error(apiErrorText(e, "Не удалось аннулировать"));
    }
  };

  const download = async () => {
    try {
      const r = await adminApi.get<Blob>("/crm/cash/export", { params: query, responseType: "blob" });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cash-${from}_${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(apiErrorText(e, "Не удалось выгрузить"));
    }
  };

  return (
    <>
      <PageTitle title="Касса" hint="Приход и расход наличных по филиалам. Операции не удаляются — только аннулируются с причиной." />

      <div className="mb-5 flex flex-wrap items-end gap-3">
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
        <Button variant="outline" onClick={() => void download()}>
          Выгрузить CSV
        </Button>
      </div>

      {data && (
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Остаток на начало" value={formatRub(data.openingRub)} />
          <Stat label="Приход" value={formatRub(data.inRub)} tone="in" />
          <Stat label="Расход" value={formatRub(data.outRub)} tone="out" />
          <Stat label="Остаток на конец" value={formatRub(data.closingRub)} />
        </div>
      )}

      <section className="mb-6 rounded-xl border border-white/10 bg-[#101722] p-4" aria-label="Новая операция">
        <h2 className="mb-3 text-sm font-semibold text-slate-100">Новая операция</h2>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Филиал">
            <select className={fieldCls} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value as CrmLocationCode })}>
              {CRM_LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {CRM_LOCATION_LABELS[l]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Операция">
            <select className={fieldCls} value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value as "IN" | "OUT" })}>
              <option value="IN">Приход</option>
              <option value="OUT">Расход</option>
            </select>
          </Field>
          <Field label="Сумма, ₽">
            <input type="number" min={1} className={`${fieldCls} w-32`} value={form.amountRub} onChange={(e) => setForm({ ...form, amountRub: e.target.value })} />
          </Field>
          <Field label="Дата">
            <input type="date" max={todayMsk()} className={fieldCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Статья" className="min-w-36">
            <input className={fieldCls} value={form.category} placeholder="Оплата клиента, закупка…" onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </Field>
          <Field label="Комментарий" className="min-w-48 flex-1">
            <input className={fieldCls} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          </Field>
          <Button disabled={saving || !(Number(form.amountRub) >= 1)} onClick={() => void add()}>
            Внести
          </Button>
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className={tableCls}>
          <thead>
            <tr>
              <th className={thCls}>Дата</th>
              <th className={thCls}>Филиал</th>
              <th className={thCls}>Операция</th>
              <th className={thCls}>Сумма</th>
              <th className={thCls}>Статья / комментарий</th>
              <th className={thCls}>Кто внёс</th>
              <th className={thCls} />
            </tr>
          </thead>
          <tbody>
            {data?.entries.length === 0 && (
              <tr>
                <td className={tdCls} colSpan={7}>
                  За период операций нет
                </td>
              </tr>
            )}
            {data?.entries.map((e) => (
              <tr key={e.id} className={`border-t border-white/5 ${e.voided ? "text-slate-500 line-through" : ""}`}>
                <td className={tdCls}>{ruDate(e.date)}</td>
                <td className={tdCls}>{CRM_LOCATION_LABELS[e.location]}</td>
                <td className={`${tdCls} ${e.voided ? "" : e.direction === "IN" ? "text-emerald-300" : "text-rose-300"}`}>{e.direction === "IN" ? "Приход" : "Расход"}</td>
                <td className={tdCls}>{formatRub(e.amountRub)}</td>
                <td className={tdCls}>
                  {[e.category, e.comment].filter(Boolean).join(" — ") || "—"}
                  {e.voided && <span className="block text-xs no-underline">Аннулирована: {e.voidReason}</span>}
                </td>
                <td className={tdCls}>{e.createdBy}</td>
                <td className={tdCls}>
                  {!e.voided && (
                    <Button variant="ghost" size="sm" onClick={() => void voidEntry(e.id)}>
                      Аннулировать
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function CashManager() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
