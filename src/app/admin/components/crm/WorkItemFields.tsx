"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Textarea } from "@/shadcn/textarea";
import { adminApi } from "../../_lib/api";
import type { CatalogCategory, CatalogGroup } from "../../_lib/servicesTypes";

const field = "border-white/20 bg-slate-800 text-white";
const chip = (on: boolean) =>
  `rounded-lg border px-2.5 py-1 text-sm transition ${
    on
      ? "border-sky-400/60 bg-sky-500/20 text-sky-100"
      : "border-white/15 bg-slate-800 text-slate-300 hover:border-white/30"
  }`;

export type WorkDraft = {
  categoryId: number | null;
  selections: Record<string, string[]>;
  comment: string;
  /** Рубли цифрами; пусто — «не определена», 0 — «бесплатно». */
  price: string;
};

export const emptyWorkDraft = (): WorkDraft => ({ categoryId: null, selections: {}, comment: "", price: "" });

/** Целое число рублей из поля ввода; пусто → null («не определена»). */
export function parseRub(text: string): number | null {
  const digits = text.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

function errorText(e: unknown): string {
  const m = (e as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m)) return m.join(", ");
  return "Не удалось сохранить";
}

type Props = {
  catalog: CatalogCategory[];
  draft: WorkDraft;
  onChange: (draft: WorkDraft) => void;
  /** Вид работ нельзя менять у уже сохранённой позиции. */
  lockCategory?: boolean;
  /** После добавления значения в справочник — обновить справочник у родителя. */
  onCatalogChanged: () => void | Promise<void>;
  commentLabel?: string;
  priceLabel?: string;
  /** Дополнительные поля под комментарием и ценой (например, место дефекта у допработы). */
  extra?: ReactNode;
};

/** Выбор вида работ, параметров по справочнику, комментария и цены — общий для согласованных работ и допработ. */
export function WorkItemFields({
  catalog,
  draft,
  onChange,
  lockCategory,
  onCatalogChanged,
  commentLabel = "Комментарий к работе",
  priceLabel = "Стоимость, ₽",
  extra,
}: Props) {
  const [newOption, setNewOption] = useState<Record<number, string>>({});
  const category = catalog.find((c) => c.id === draft.categoryId) ?? null;

  const toggle = (group: CatalogGroup, value: string) => {
    const list = draft.selections[group.key] ?? [];
    const next = list.includes(value)
      ? list.filter((v) => v !== value)
      : group.multiple
        ? [...list, value]
        : [value];
    const selections = { ...draft.selections, [group.key]: next };
    if (next.length === 0) delete selections[group.key];
    onChange({ ...draft, selections });
  };

  /** Новое значение: «в справочник» (запоминается для всех) или «только здесь» (если группа допускает свой вариант). */
  const addOption = async (group: CatalogGroup, toDictionary: boolean) => {
    const name = (newOption[group.id] ?? "").trim();
    if (!name) return;
    if (toDictionary) {
      try {
        await adminApi.post(`/crm/services/groups/${group.id}/options`, { name });
        await onCatalogChanged();
      } catch (e) {
        toast.error(errorText(e));
        return;
      }
    }
    toggle(group, name);
    setNewOption((cur) => ({ ...cur, [group.id]: "" }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-sm text-slate-300">Вид работ</p>
        <div className="flex flex-wrap gap-2">
          {catalog.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={lockCategory && draft.categoryId !== c.id}
              className={chip(draft.categoryId === c.id)}
              onClick={() => onChange({ ...draft, categoryId: c.id, selections: {} })}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {category?.groups.map((g) => {
        const selected = draft.selections[g.key] ?? [];
        const custom = selected.filter((v) => !g.options.some((o) => o.name === v));
        return (
          <div key={g.id} className="space-y-1.5">
            <p className="text-sm text-slate-300">
              {g.label}
              <span className="ml-2 text-xs text-slate-500">{g.multiple ? "можно несколько" : "один вариант"}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {g.options.map((o) => (
                <button key={o.id} type="button" className={chip(selected.includes(o.name))} onClick={() => toggle(g, o.name)}>
                  {o.name}
                </button>
              ))}
              {custom.map((v) => (
                <button key={v} type="button" className={chip(true)} onClick={() => toggle(g, v)}>
                  {v} <X className="ml-1 inline h-3 w-3" />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                className={`${field} h-8 max-w-xs`}
                placeholder="Другой вариант…"
                maxLength={100}
                value={newOption[g.id] ?? ""}
                onChange={(e) => setNewOption((cur) => ({ ...cur, [g.id]: e.target.value }))}
              />
              {g.allowCustom ? (
                <Button type="button" size="sm" variant="secondary" onClick={() => void addOption(g, false)}>
                  Только здесь
                </Button>
              ) : null}
              <Button type="button" size="sm" variant="secondary" onClick={() => void addOption(g, true)}>
                В справочник
              </Button>
            </div>
          </div>
        );
      })}

      <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
        <label className="space-y-1.5">
          <span className="text-sm text-slate-300">{commentLabel}</span>
          <Textarea
            rows={2}
            maxLength={500}
            className={field}
            value={draft.comment}
            onChange={(e) => onChange({ ...draft, comment: e.target.value })}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm text-slate-300">{priceLabel}</span>
          <Input
            className={field}
            inputMode="numeric"
            placeholder="не определена"
            value={draft.price}
            onChange={(e) => onChange({ ...draft, price: e.target.value.replace(/\D/g, "") })}
          />
          <span className="text-xs text-slate-500">Пусто — не определена, 0 — бесплатно</span>
        </label>
      </div>
      {extra}
    </div>
  );
}
