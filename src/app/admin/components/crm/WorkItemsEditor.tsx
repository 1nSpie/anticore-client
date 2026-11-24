"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { adminApi } from "../../_lib/api";
import { WorkItemFields, emptyWorkDraft, parseRub, type WorkDraft } from "./WorkItemFields";
import { useQueryParams } from "../../_lib/useQueryParams";
import {
  PAYMENT_LABEL,
  formatRub,
  type CatalogCategory,
  type PaymentMethod,
  type WorkItem,
  type WorksView,
} from "../../_lib/servicesTypes";

const field = "border-white/20 bg-slate-800 text-white";
function errorText(e: unknown): string {
  const m = (e as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m)) return m.join(", ");
  return "Не удалось сохранить";
}


type Props = {
  appointmentId: number;
  /** Вызывается после любого изменения — форма записи подтягивает цену и название услуги. */
  onChanged?: (view: WorksView) => void;
};

export function WorkItemsEditor({ appointmentId, onChanged }: Props) {
  const base = `/crm/appointments/${appointmentId}`;
  const [view, setView] = useState<WorksView | null>(null);
  const [catalog, setCatalog] = useState<CatalogCategory[]>([]);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<{ id: number | null; draft: WorkDraft } | null>(null);
  const { params, set } = useQueryParams();
  const itemParam = params.get("item");

  /** Какая позиция открыта — в адресе (`?item=new` или `?item=<id>`), поэтому форму можно открыть по ссылке. */
  const openEditor = (id: number | "new") => set({ item: id });
  const closeEditor = () => set({ item: null });

  const loadCatalog = useCallback(async () => {
    try {
      const { data } = await adminApi.get<CatalogCategory[]>("/crm/services/catalog");
      setCatalog(data);
    } catch (e) {
      toast.error(errorText(e));
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const { data } = await adminApi.get<WorksView>(`${base}/works`);
      setView(data);
      onChanged?.(data);
    } catch (e) {
      toast.error(errorText(e));
    }
    // onChanged намеренно вне зависимостей: родитель передаёт новую функцию на каждый рендер
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  useEffect(() => {
    void load();
    void loadCatalog();
  }, [load, loadCatalog]);

  useEffect(() => {
    if (!view) return;
    if (!itemParam) {
      setEditing(null);
      return;
    }
    if (itemParam === "new") {
      setEditing((cur) => (cur && cur.id === null ? cur : { id: null, draft: emptyWorkDraft() }));
      return;
    }
    const id = Number(itemParam);
    const item = view.items.find((i) => i.id === id);
    if (!item) return;
    setEditing((cur) =>
      cur && cur.id === id
        ? cur
        : {
            id,
            draft: {
              categoryId: item.categoryId,
              selections: item.selections,
              comment: item.comment ?? "",
              price: item.priceRub == null ? "" : String(item.priceRub),
            },
          },
    );
  }, [itemParam, view]);

  /** После подписания договора любое изменение требует указать, как оно согласовано с клиентом. */
  const askReason = (): string | null | undefined => {
    if (!view?.contractSigned) return undefined;
    const reason = window.prompt("Договор подписан. Как клиент согласовал это изменение? (кто, когда, каким способом)");
    return reason && reason.trim().length >= 3 ? reason.trim() : null;
  };

  const apply = async (fn: () => Promise<{ data: WorksView }>) => {
    setBusy(true);
    try {
      const { data } = await fn();
      setView(data);
      onChanged?.(data);
      return true;
    } catch (e) {
      toast.error(errorText(e));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const saveItem = async () => {
    if (!editing) return;
    const { id, draft } = editing;
    if (draft.categoryId == null) {
      toast.error("Выберите вид работ");
      return;
    }
    const reason = askReason();
    if (reason === null) {
      toast.error("Укажите, как согласовано изменение");
      return;
    }
    const body = {
      selections: draft.selections,
      comment: draft.comment.trim() || null,
      priceRub: parseRub(draft.price),
      ...(reason && { reason }),
    };
    const ok = await apply(() =>
      id == null
        ? adminApi.post<WorksView>(`${base}/works`, { categoryId: draft.categoryId, ...body })
        : adminApi.patch<WorksView>(`${base}/works/${id}`, body),
    );
    if (ok) closeEditor();
  };

  const removeItem = (item: WorkItem) => {
    if (!confirm(`Убрать из перечня: ${item.title}?`)) return;
    const reason = askReason();
    if (reason === null) {
      toast.error("Укажите, как согласовано изменение");
      return;
    }
    void apply(() =>
      adminApi.delete<WorksView>(`${base}/works/${item.id}`, { params: reason ? { reason } : {} }),
    );
  };

  const savePricing = (body: Record<string, unknown>, discount = false) => {
    const reason = discount ? askReason() : undefined;
    if (reason === null) {
      toast.error("Укажите, как согласовано изменение");
      return;
    }
    void apply(() => adminApi.put<WorksView>(`${base}/pricing`, { ...body, ...(reason && { reason }) }));
  };

  if (!view) return <p className="text-sm text-slate-400">Загрузка перечня работ…</p>;
  const p = view.pricing;

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">Согласованные работы и стоимость</h3>
        <Button size="sm" variant="secondary" disabled={busy} onClick={() => openEditor("new")}>
          <Plus className="mr-1 h-4 w-4" />
          Добавить работу
        </Button>
      </div>

      {editing ? (
        <div id="work-item-form" className="space-y-4 rounded-xl border border-sky-400/30 bg-slate-900/70 p-3">
          <h4 className="text-sm font-semibold text-white">
            {editing.id == null ? "Новая работа" : "Изменить работу"}
          </h4>
          <WorkItemFields
            catalog={catalog}
            draft={editing.draft}
            onChange={(draft) => setEditing({ ...editing, draft })}
            lockCategory={editing.id != null}
            onCatalogChanged={loadCatalog}
          />
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => void saveItem()}>
              Сохранить
            </Button>
            <Button variant="secondary" onClick={() => closeEditor()}>
              Отмена
            </Button>
          </div>
        </div>
      ) : null}

      {view.items.length === 0 ? (
        <p className="text-sm text-slate-400">
          Перечень пуст. Добавьте работы — из них считается стоимость, они попадут в договор и акты.
        </p>
      ) : (
        <ul className="space-y-2">
          {view.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-2 rounded-lg border border-white/10 bg-slate-900/60 p-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white">{item.title}</p>
                {item.comment ? <p className="text-xs text-slate-400">{item.comment}</p> : null}
                <p className={`text-xs ${item.priceRub == null ? "text-amber-300" : "text-slate-300"}`}>
                  {item.priceRub == null ? "Цена не указана" : item.priceRub === 0 ? "Бесплатно — 0 ₽" : formatRub(item.priceRub)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-300"
                  aria-label="Изменить"
                  disabled={busy}
                  onClick={() => openEditor(item.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-300" aria-label="Убрать" disabled={busy} onClick={() => removeItem(item)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2 border-t border-white/10 pt-3 text-sm">
        <div className="flex justify-between text-slate-200">
          <span>Предварительная стоимость</span>
          <span className={p.preliminary == null ? "text-amber-300" : ""}>{formatRub(p.preliminary)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <label className="space-y-1">
            <span className="text-xs text-slate-400">Скидка, %</span>
            <PricingInput
              value={p.discountPercent != null ? String(p.discountPercent) : ""}
              decimal
              disabled={busy}
              onCommit={(v) => savePricing({ discountPercent: v === "" ? null : Number(v.replace(",", ".")), discountRub: null }, true)}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-slate-400">Скидка, ₽</span>
            <PricingInput
              value={p.discountPercent == null && p.discountRub > 0 ? String(p.discountRub) : ""}
              disabled={busy}
              onCommit={(v) => savePricing({ discountRub: v === "" ? null : Number(v), discountPercent: null }, true)}
            />
          </label>
          <div className="col-span-2 flex items-end justify-between text-slate-300">
            <span className="text-xs text-slate-400">Размер скидки</span>
            <span>{p.discountRub > 0 ? `− ${formatRub(p.discountRub)}` : "нет"}</span>
          </div>
        </div>
        <div className="flex justify-between font-medium text-white">
          <span>Согласованный итог</span>
          <span className={p.agreedTotal == null ? "text-amber-300" : ""}>{formatRub(p.agreedTotal)}</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs text-slate-400">Способ оплаты</span>
            <select
              className={`${field} h-9 w-full rounded-md border px-2 text-sm`}
              disabled={busy}
              value={view.paymentMethod ?? ""}
              onChange={(e) => savePricing({ paymentMethod: (e.target.value || null) as PaymentMethod | null })}
            >
              <option value="">Не выбран</option>
              {(Object.keys(PAYMENT_LABEL) as PaymentMethod[]).map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_LABEL[m]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-slate-400">Получено, ₽</span>
            <PricingInput
              value={p.paidRub > 0 ? String(p.paidRub) : ""}
              disabled={busy}
              onCommit={(v) => savePricing({ paidRub: v === "" ? null : Number(v) })}
            />
          </label>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>Остаток к оплате</span>
          <span>{formatRub(p.remaining)}</span>
        </div>
        {view.contractSigned ? (
          <p className="text-xs text-amber-200/90">
            Договор подписан: изменение перечня и скидки потребует указать, как оно согласовано с клиентом.
          </p>
        ) : null}
      </div>

    </div>
  );
}

/** Поле стоимости: значение уходит на сервер при потере фокуса. */
function PricingInput({
  value,
  onCommit,
  decimal,
  disabled,
}: {
  value: string;
  onCommit: (v: string) => void;
  decimal?: boolean;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <Input
      className={`${field} h-8`}
      inputMode={decimal ? "decimal" : "numeric"}
      disabled={disabled}
      value={draft}
      onChange={(e) => setDraft(decimal ? e.target.value.replace(/[^\d.,]/g, "") : e.target.value.replace(/\D/g, ""))}
      onBlur={() => draft !== value && onCommit(draft)}
    />
  );
}
