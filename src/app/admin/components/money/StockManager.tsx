"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { adminApi } from "../../_lib/api";
import { useQueryParams } from "../../_lib/useQueryParams";
import {
  CRM_LOCATIONS,
  CRM_LOCATION_LABELS,
  STOCK_KIND_LABELS,
  apiErrorText,
  formatQty,
  type CrmLocationCode,
  type StockItem,
  type StockMovement,
} from "../../_lib/moneyTypes";
import { Field, PageTitle, Tabs, fieldCls, tableCls, tdCls, thCls } from "./ui";

type Tab = "balances" | "history";

function Inner() {
  const { params, set } = useQueryParams();
  const tab: Tab = params.get("tab") === "history" ? "history" : "balances";
  const location = params.get("location") ?? "";
  const [items, setItems] = useState<StockItem[]>([]);
  const [moves, setMoves] = useState<StockMovement[]>([]);
  const [newItem, setNewItem] = useState({ name: "", unit: "шт", minQty: "" });
  const [mv, setMv] = useState<{ itemId: string; location: CrmLocationCode; kind: "IN" | "OUT" | "ADJUST"; qty: string; comment: string }>({
    itemId: "",
    location: "ZHUKOVSKY",
    kind: "IN",
    qty: "",
    comment: "",
  });

  const load = useCallback(async () => {
    const q = location ? { location } : {};
    try {
      const [i, m] = await Promise.all([
        adminApi.get<StockItem[]>("/crm/stock/items", { params: q }),
        adminApi.get<StockMovement[]>("/crm/stock/movements", { params: { ...q, limit: 100 } }),
      ]);
      setItems(i.data);
      setMoves(m.data);
    } catch (e) {
      toast.error(apiErrorText(e, "Не удалось загрузить склад"));
    }
  }, [location]);
  useEffect(() => {
    void load();
  }, [load]);

  const addItem = async () => {
    try {
      await adminApi.post("/crm/stock/items", { name: newItem.name.trim(), unit: newItem.unit.trim() || "шт", ...(newItem.minQty ? { minQty: Number(newItem.minQty) } : {}) });
      setNewItem({ name: "", unit: newItem.unit, minQty: "" });
      await load();
    } catch (e) {
      toast.error(apiErrorText(e, "Не удалось добавить позицию"));
    }
  };

  const move = async () => {
    try {
      await adminApi.post("/crm/stock/movements", {
        itemId: Number(mv.itemId),
        location: mv.location,
        kind: mv.kind,
        qty: Number(mv.qty),
        ...(mv.comment.trim() ? { comment: mv.comment.trim() } : {}),
      });
      setMv({ ...mv, qty: "", comment: "" });
      await load();
    } catch (e) {
      toast.error(apiErrorText(e, "Не удалось провести движение"));
    }
  };

  const patchItem = async (id: number, body: Partial<Pick<StockItem, "minQty" | "active">>) => {
    try {
      await adminApi.patch(`/crm/stock/items/${id}`, body);
      await load();
    } catch (e) {
      toast.error(apiErrorText(e, "Не удалось сохранить"));
    }
  };

  const active = items.filter((i) => i.active);
  const unit = items.find((i) => String(i.id) === mv.itemId)?.unit;

  return (
    <>
      <PageTitle title="Склад" hint="Материалы и расходники по филиалам: приход, расход, инвентаризация. Остаток не может уйти в минус." />
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <Field label="Филиал">
          <select className={fieldCls} value={location} onChange={(e) => set({ location: e.target.value })}>
            <option value="">Все филиалы</option>
            {CRM_LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {CRM_LOCATION_LABELS[l]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <section className="mb-6 rounded-xl border border-white/10 bg-[#101722] p-4" aria-label="Движение по складу">
        <h2 className="mb-3 text-sm font-semibold text-slate-100">Движение</h2>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Позиция" className="min-w-48">
            <select className={fieldCls} value={mv.itemId} onChange={(e) => setMv({ ...mv, itemId: e.target.value })}>
              <option value="">Выберите…</option>
              {active.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Филиал">
            <select className={fieldCls} value={mv.location} onChange={(e) => setMv({ ...mv, location: e.target.value as CrmLocationCode })}>
              {CRM_LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {CRM_LOCATION_LABELS[l]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Что">
            <select className={fieldCls} value={mv.kind} onChange={(e) => setMv({ ...mv, kind: e.target.value as typeof mv.kind })}>
              {(Object.keys(STOCK_KIND_LABELS) as (keyof typeof STOCK_KIND_LABELS)[]).map((k) => (
                <option key={k} value={k}>
                  {STOCK_KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={mv.kind === "ADJUST" ? `Фактический остаток${unit ? `, ${unit}` : ""}` : `Количество${unit ? `, ${unit}` : ""}`}>
            <input type="number" min={0} step="0.001" className={`${fieldCls} w-32`} value={mv.qty} onChange={(e) => setMv({ ...mv, qty: e.target.value })} />
          </Field>
          <Field label="Комментарий" className="min-w-48 flex-1">
            <input className={fieldCls} value={mv.comment} onChange={(e) => setMv({ ...mv, comment: e.target.value })} />
          </Field>
          <Button disabled={!mv.itemId || mv.qty === ""} onClick={() => void move()}>
            Провести
          </Button>
        </div>
      </section>

      <Tabs
        value={tab}
        onChange={(t) => set({ tab: t === "balances" ? null : t })}
        items={[
          { id: "balances", label: "Остатки" },
          { id: "history", label: "История движений" },
        ]}
      />

      {tab === "balances" ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>Позиция</th>
                  <th className={thCls}>Остаток{location ? ` · ${CRM_LOCATION_LABELS[location as CrmLocationCode]}` : ""}</th>
                  {!location && CRM_LOCATIONS.map((l) => <th key={l} className={thCls}>{CRM_LOCATION_LABELS[l]}</th>)}
                  <th className={thCls}>Минимум</th>
                  <th className={thCls} />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td className={tdCls} colSpan={6}>
                      Склад пуст — добавьте первую позицию ниже
                    </td>
                  </tr>
                )}
                {items.map((i) => (
                  <tr key={i.id} className={`border-t border-white/5 ${i.active ? "" : "opacity-50"}`}>
                    <td className={tdCls}>{i.name}</td>
                    <td className={`${tdCls} font-medium ${i.low ? "text-rose-300" : ""}`}>
                      {formatQty(i.qty)} {i.unit}
                      {i.low && <span className="ml-2 text-xs">ниже минимума</span>}
                    </td>
                    {!location && CRM_LOCATIONS.map((l) => <td key={l} className={tdCls}>{formatQty(i.byLocation[l])}</td>)}
                    <td className={tdCls}>
                      <input
                        type="number"
                        min={0}
                        step="0.001"
                        aria-label={`Минимум: ${i.name}`}
                        className={`${fieldCls} w-24`}
                        defaultValue={i.minQty}
                        onBlur={(e) => Number(e.target.value) !== i.minQty && void patchItem(i.id, { minQty: Number(e.target.value) || 0 })}
                      />
                    </td>
                    <td className={tdCls}>
                      <Button variant="ghost" size="sm" onClick={() => void patchItem(i.id, { active: !i.active })}>
                        {i.active ? "Отключить" : "Включить"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <Field label="Новая позиция" className="min-w-48 flex-1">
              <input className={fieldCls} value={newItem.name} placeholder="Например, Мовиль" onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            </Field>
            <Field label="Единица">
              <input className={`${fieldCls} w-20`} value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} />
            </Field>
            <Field label="Минимум">
              <input type="number" min={0} step="0.001" className={`${fieldCls} w-24`} value={newItem.minQty} onChange={(e) => setNewItem({ ...newItem, minQty: e.target.value })} />
            </Field>
            <Button disabled={newItem.name.trim().length < 2} onClick={() => void addItem()}>
              Добавить
            </Button>
          </div>
        </>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className={tableCls}>
            <thead>
              <tr>
                <th className={thCls}>Когда</th>
                <th className={thCls}>Позиция</th>
                <th className={thCls}>Филиал</th>
                <th className={thCls}>Что</th>
                <th className={thCls}>Изменение</th>
                <th className={thCls}>Комментарий</th>
                <th className={thCls}>Кто</th>
              </tr>
            </thead>
            <tbody>
              {moves.length === 0 && (
                <tr>
                  <td className={tdCls} colSpan={7}>
                    Движений пока нет
                  </td>
                </tr>
              )}
              {moves.map((m) => (
                <tr key={m.id} className="border-t border-white/5">
                  <td className={tdCls}>{new Date(m.createdAt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className={tdCls}>{m.itemName}</td>
                  <td className={tdCls}>{CRM_LOCATION_LABELS[m.location]}</td>
                  <td className={tdCls}>{STOCK_KIND_LABELS[m.kind]}</td>
                  <td className={`${tdCls} ${m.delta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                    {m.delta > 0 ? "+" : ""}
                    {formatQty(m.delta)} {m.unit}
                  </td>
                  <td className={tdCls}>{m.comment ?? "—"}</td>
                  <td className={tdCls}>{m.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function StockManager() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}
