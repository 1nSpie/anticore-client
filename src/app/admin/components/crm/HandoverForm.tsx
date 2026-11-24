"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Textarea } from "@/shadcn/textarea";
import { adminApi } from "../../_lib/api";
import { toLocalInput } from "../../_lib/appointmentTime";
import { useQueryParams, withQuery } from "../../_lib/useQueryParams";
import type { HandoverView } from "../../_lib/executionTypes";

const field = "border-white/20 bg-slate-800 text-white";
const chip = (on: boolean, tone: "ok" | "neutral" = "neutral") =>
  `rounded-lg border px-3 py-1.5 text-sm transition ${
    on
      ? tone === "ok"
        ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100"
        : "border-sky-400/60 bg-sky-500/20 text-sky-100"
      : "border-white/15 bg-slate-800 text-slate-300 hover:border-white/30"
  }`;

function errorText(e: unknown): string {
  const m = (e as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m)) return m.join(", ");
  return "Не удалось сохранить";
}

/** Поле, которое уходит на сервер при потере фокуса. */
function BlurField({
  value,
  onCommit,
  multiline,
  type,
  inputMode,
  maxLength,
  placeholder,
  id,
}: {
  value: string;
  onCommit: (v: string) => void;
  multiline?: boolean;
  type?: string;
  inputMode?: "numeric" | "text";
  maxLength?: number;
  placeholder?: string;
  id?: string;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const props = {
    id,
    className: field,
    value: draft,
    maxLength,
    placeholder,
    onChange: (e: { target: { value: string } }) => setDraft(e.target.value),
    onBlur: () => draft !== value && onCommit(draft),
  };
  return multiline ? <Textarea rows={2} {...props} /> : <Input type={type} inputMode={inputMode} {...props} />;
}

const intOrNull = (v: string) => (v.trim() ? Number(v.replace(/\D/g, "")) : null);

/** Выдача автомобиля и гарантия — вкладка страницы записи (`?tab=handover`). */
export function HandoverForm({ appointmentId }: { appointmentId: number }) {
  const base = `/crm/appointments/${appointmentId}/handover`;
  const { params, pathname } = useQueryParams();
  const [view, setView] = useState<HandoverView | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await adminApi.get<HandoverView>(base);
      setView(data);
    } catch (e) {
      toast.error(errorText(e));
    }
  }, [base]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      const { data } = await adminApi.put<HandoverView>(base, body);
      setView(data);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  if (!view) return <p className="text-sm text-slate-400">Загрузка…</p>;
  const h = view.handover;
  const r = view.reception;
  const yesNo = (value: boolean | null | undefined, key: string, yes = "Да", no = "Нет") => (
    <div className="flex gap-2">
      <button type="button" disabled={busy} className={chip(value === true, "ok")} onClick={() => void save({ [key]: true })}>
        {yes}
      </button>
      <button type="button" disabled={busy} className={chip(value === false)} onClick={() => void save({ [key]: false })}>
        {no}
      </button>
    </div>
  );

  return (
    <div className="space-y-4 text-white">
      <h2 className="text-lg font-semibold">Выдача автомобиля и гарантия</h2>

      {view.missing.length === 0 ? (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          <CheckCircle2 className="h-4 w-4" /> Данные выдачи заполнены — акт выполненных работ можно формировать.
        </p>
      ) : (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-100">
            <TriangleAlert className="h-4 w-4" /> Не заполнено ({view.missing.length}):
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {view.missing.map((m) => (
              <li key={m.code} className="rounded-md border border-amber-400/30 bg-slate-900/60 px-2 py-1 text-xs text-amber-100">
                {m.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="space-y-3 rounded-xl border border-white/10 bg-slate-950/50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Выдача</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm text-slate-300">Фактические дата и время выдачи</span>
            <div className="flex gap-2">
              <BlurField
                type="datetime-local"
                value={h?.issuedAt ? toLocalInput(h.issuedAt) : ""}
                onCommit={(v) => void save({ issuedAt: v ? new Date(v).toISOString() : null })}
              />
              <Button type="button" variant="secondary" disabled={busy} onClick={() => void save({ issuedAt: new Date().toISOString() })}>
                Сейчас
              </Button>
            </div>
            <span className="text-xs text-slate-500">Вносится вручную: время предварительной записи не подставляется</span>
          </label>
          <label className="space-y-1.5">
            <span className="text-sm text-slate-300">Кто выдал автомобиль</span>
            <select
              className={`${field} h-9 w-full rounded-md border px-2 text-sm`}
              disabled={busy}
              value={h?.issuedBy?.id ?? ""}
              onChange={(e) => void save({ issuedById: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Не выбран</option>
              {view.staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                  {s.assigned ? " · на записи" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-sm text-slate-300">Пробег при выдаче, км</span>
            <BlurField
              inputMode="numeric"
              maxLength={7}
              value={h?.mileageKm != null ? String(h.mileageKm) : ""}
              onCommit={(v) => void save({ mileageKm: intOrNull(v) })}
            />
            <span className="text-xs text-slate-500">
              При приёмке: {r.mileageKm != null ? `${r.mileageKm} км` : "не указан"}. Заполняйте, только если изменился.
            </span>
          </label>
          <label className="space-y-1.5">
            <span className="text-sm text-slate-300">Топливо при выдаче, %</span>
            <BlurField
              inputMode="numeric"
              maxLength={3}
              value={h?.fuelPercent != null ? String(h.fuelPercent) : ""}
              onCommit={(v) => void save({ fuelPercent: intOrNull(v) })}
            />
            <span className="text-xs text-slate-500">
              При приёмке: {r.fuelPercent != null ? `${r.fuelPercent} %` : "не указано"}. Заполняйте, только если изменилось.
            </span>
          </label>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-white/10 bg-slate-950/50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Гарантия</h3>
        <p className="text-xs text-slate-400">Срок гарантии не назначается автоматически — укажите его для этого автомобиля.</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-slate-200">Гарантийная книжка выдана</span>
          {yesNo(h?.warrantyBookIssued, "warrantyBookIssued")}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-slate-200">Гарантийные условия разъяснены клиенту</span>
          {yesNo(h?.warrantyTermsExplained, "warrantyTermsExplained", "Разъяснены", "Нет")}
        </div>
        {h?.warrantyBookIssued ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm text-slate-300">Срок гарантии, месяцев</span>
              <BlurField
                inputMode="numeric"
                maxLength={3}
                value={h?.warrantyMonths != null ? String(h.warrantyMonths) : ""}
                onCommit={(v) => void save({ warrantyMonths: intOrNull(v) })}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm text-slate-300">Начало срока гарантии</span>
              <div className="flex gap-2">
                <BlurField
                  type="date"
                  value={h?.warrantyStartsAt ? String(h.warrantyStartsAt).slice(0, 10) : ""}
                  onCommit={(v) => void save({ warrantyStartsAt: v || null })}
                />
                {h?.issuedAt ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void save({ warrantyStartsAt: toLocalInput(h.issuedAt as string).slice(0, 10) })}
                  >
                    Дата выдачи
                  </Button>
                ) : null}
              </div>
            </label>
          </div>
        ) : null}
        <label className="block space-y-1.5">
          <span className="text-sm text-slate-300">Индивидуальные гарантийные условия</span>
          <BlurField multiline maxLength={1000} value={h?.warrantyTerms ?? ""} onCommit={(v) => void save({ warrantyTerms: v })} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-slate-300">Рекомендации по ежегодной профилактике</span>
          <BlurField multiline maxLength={1000} value={h?.careRecommendations ?? ""} onCommit={(v) => void save({ careRecommendations: v })} />
        </label>
      </section>

      <p className="text-sm text-slate-400">
        Когда работы завершены и данные выдачи внесены, акт выполненных работ формируется на вкладке{" "}
        <Link href={withQuery(pathname, params, { tab: "documents", item: null, focus: null })} scroll={false} className="text-emerald-300 hover:underline">
          «Документы»
        </Link>
        .
      </p>
    </div>
  );
}
