"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Textarea } from "@/shadcn/textarea";
import { adminApi } from "../../_lib/api";
import { useQueryParams } from "../../_lib/useQueryParams";
import { formatRub, type CatalogCategory } from "../../_lib/servicesTypes";
import {
  APPROVAL_CHANNEL_LABEL,
  APPROVAL_STATUS_LABEL,
  NEXT_STATUSES,
  STATUS_ACTION,
  WORK_STATUS_LABEL,
  type ApprovalChannel,
  type ExecItem,
  type ExecutionView,
  type WorkStatus,
} from "../../_lib/executionTypes";
import { WorkItemFields, emptyWorkDraft, parseRub, type WorkDraft } from "./WorkItemFields";

const field = "border-white/20 bg-slate-800 text-white";

const statusTone: Record<WorkStatus, string> = {
  WAITING: "border-white/20 bg-slate-800 text-slate-300",
  IN_PROGRESS: "border-sky-400/40 bg-sky-500/15 text-sky-100",
  DONE: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
  PAUSED: "border-amber-400/40 bg-amber-500/15 text-amber-100",
  NEEDS_APPROVAL: "border-amber-400/40 bg-amber-500/15 text-amber-100",
  CANCELLED: "border-white/15 bg-slate-800 text-slate-400",
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" }) : "—";

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
  disabled,
  placeholder,
  maxLength,
}: {
  value: string;
  onCommit: (v: string) => void;
  multiline?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const props = {
    className: field,
    value: draft,
    disabled,
    placeholder,
    maxLength,
    onChange: (e: { target: { value: string } }) => setDraft(e.target.value),
    onBlur: () => draft !== value && onCommit(draft),
  };
  return multiline ? <Textarea rows={2} {...props} /> : <Input {...props} />;
}

type ExtraDraft = WorkDraft & { defectPlace: string; termChangeNote: string };
const emptyExtra = (): ExtraDraft => ({ ...emptyWorkDraft(), defectPlace: "", termChangeNote: "" });

type Decision = { channel: ApprovalChannel | ""; approvedBy: string; note: string; at: string };

/** Выполнение работ — вкладка страницы записи (`?tab=execution`, форма допработы — `?extra=new`). */
export function ExecutionPanel({ appointmentId }: { appointmentId: number }) {
  const base = `/crm/appointments/${appointmentId}/execution`;
  const { params, set } = useQueryParams();
  const addingExtra = params.get("extra") === "new";

  const [view, setView] = useState<ExecutionView | null>(null);
  const [catalog, setCatalog] = useState<CatalogCategory[]>([]);
  const [busy, setBusy] = useState(false);
  const [extra, setExtra] = useState<ExtraDraft>(emptyExtra());
  const [decisions, setDecisions] = useState<Record<number, Decision>>({});
  const photoTarget = useRef<{ itemId: number; stage: "WORK_BEFORE" | "WORK_AFTER" } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

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
      const { data } = await adminApi.get<ExecutionView>(base);
      setView(data);
    } catch (e) {
      toast.error(errorText(e));
    }
  }, [base]);

  useEffect(() => {
    void load();
    void loadCatalog();
  }, [load, loadCatalog]);

  const apply = async (fn: () => Promise<{ data: ExecutionView }>) => {
    setBusy(true);
    try {
      const { data } = await fn();
      setView(data);
      return true;
    } catch (e) {
      toast.error(errorText(e));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const patchItem = (item: ExecItem, body: Record<string, unknown>) =>
    apply(() => adminApi.patch<ExecutionView>(`${base}/items/${item.id}`, body));

  const changeStatus = (item: ExecItem, status: WorkStatus) => {
    if (status === "CANCELLED" && !(item.workNote ?? "").trim()) {
      toast.error("Сначала напишите причину в поле «Комментарий» — работа отменяется только по согласованию с клиентом");
      return;
    }
    void patchItem(item, { status });
  };

  const pickPhoto = (itemId: number, stage: "WORK_BEFORE" | "WORK_AFTER") => {
    photoTarget.current = { itemId, stage };
    fileInput.current?.click();
  };

  const onFile = async (file: File | undefined) => {
    const target = photoTarget.current;
    if (!file || !target) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("stage", target.stage);
    await apply(() => adminApi.post<ExecutionView>(`${base}/items/${target.itemId}/photos`, fd));
    if (fileInput.current) fileInput.current.value = "";
  };

  const deletePhoto = (itemId: number, photoId: number) => {
    if (!confirm("Удалить фото?")) return;
    void apply(() => adminApi.delete<ExecutionView>(`${base}/items/${itemId}/photos/${photoId}`));
  };

  const saveExtra = async () => {
    if (extra.categoryId == null) {
      toast.error("Выберите вид работ");
      return;
    }
    if (extra.comment.trim().length < 3) {
      toast.error("Опишите обнаруженный дефект");
      return;
    }
    const ok = await apply(() =>
      adminApi.post<ExecutionView>(`${base}/extras`, {
        categoryId: extra.categoryId,
        selections: extra.selections,
        comment: extra.comment.trim(),
        defectPlace: extra.defectPlace.trim() || null,
        termChangeNote: extra.termChangeNote.trim() || null,
        priceRub: parseRub(extra.price),
      }),
    );
    if (ok) {
      setExtra(emptyExtra());
      set({ extra: null });
    }
  };

  const decide = async (item: ExecItem, decision: "APPROVED" | "REJECTED") => {
    const d = decisions[item.id];
    if (!d?.channel) {
      toast.error("Укажите, каким способом клиент дал ответ");
      return;
    }
    await apply(() =>
      adminApi.post<ExecutionView>(`${base}/extras/${item.id}/decision`, {
        decision,
        channel: d.channel,
        ...(d.approvedBy.trim() && { approvedBy: d.approvedBy.trim() }),
        ...(d.note.trim() && { note: d.note.trim() }),
        ...(d.at && { approvedAt: new Date(d.at).toISOString() }),
      }),
    );
  };

  const removeExtra = (item: ExecItem) => {
    if (!confirm("Удалить допработу?")) return;
    void apply(() => adminApi.delete<ExecutionView>(`${base}/extras/${item.id}`));
  };

  if (!view) return <p className="text-sm text-slate-400">Загрузка…</p>;
  const locked = view.signed;
  const a = view.pricing.actual;

  const photoRow = (item: ExecItem, stage: "WORK_BEFORE" | "WORK_AFTER") => {
    const photos = stage === "WORK_BEFORE" ? item.photosBefore : item.photosAfter;
    return (
      <div className="space-y-1">
        <p className="text-xs text-slate-400">{stage === "WORK_BEFORE" ? "Фото до" : "Фото после"}</p>
        <div className="flex flex-wrap items-center gap-2">
          {photos.map((p) => (
            <div key={p.id} className="group relative h-14 w-14 overflow-hidden rounded-lg border border-white/15">
              {p.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              ) : null}
              {!locked ? (
                <button
                  type="button"
                  aria-label="Удалить фото"
                  onClick={() => deletePhoto(item.id, p.id)}
                  className="absolute right-0.5 top-0.5 rounded bg-black/60 p-0.5 text-red-300 opacity-0 focus:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          ))}
          {!locked ? (
            <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => pickPhoto(item.id, stage)}>
              <Camera className="mr-1 h-4 w-4" />
              Фото
            </Button>
          ) : null}
        </div>
      </div>
    );
  };

  const card = (item: ExecItem) => {
    const isExtra = item.kind === "EXTRA";
    const pending = isExtra && item.approval?.status === "PENDING";
    const decided = isExtra && item.approval?.status && item.approval.status !== "PENDING";
    const next = pending ? [] : NEXT_STATUSES[item.status];
    const d = decisions[item.id] ?? { channel: "", approvedBy: "", note: "", at: "" };
    const setD = (patch: Partial<Decision>) => setDecisions((cur) => ({ ...cur, [item.id]: { ...d, ...patch } }));

    return (
      <li key={item.id} id={`exec-item-${item.id}`} className="space-y-3 rounded-xl border border-white/10 bg-slate-900/60 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white">
              {isExtra ? <span className="mr-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-100">Допработа</span> : null}
              {item.title}
            </p>
            {item.comment ? <p className="text-xs text-slate-400">{isExtra ? `Дефект: ${item.comment}` : item.comment}</p> : null}
            {isExtra && item.defectPlace ? <p className="text-xs text-slate-400">Место: {item.defectPlace}</p> : null}
            {isExtra && item.termChangeNote ? <p className="text-xs text-slate-400">Изменение срока: {item.termChangeNote}</p> : null}
            <p className={`text-xs ${item.priceRub == null ? "text-amber-300" : "text-slate-300"}`}>{formatRub(item.priceRub)}</p>
          </div>
          <span className={`rounded-full border px-2 py-0.5 text-xs ${statusTone[item.status]}`}>{WORK_STATUS_LABEL[item.status]}</span>
        </div>

        {pending ? (
          <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-sm font-medium text-amber-100">{APPROVAL_STATUS_LABEL.PENDING}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs text-slate-300">Стоимость, ₽</span>
                <BlurField
                  value={item.priceRub != null ? String(item.priceRub) : ""}
                  disabled={locked}
                  onCommit={(v) =>
                    void apply(() =>
                      adminApi.patch<ExecutionView>(`${base}/extras/${item.id}`, { priceRub: parseRub(v) }),
                    )
                  }
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-300">Способ согласования</span>
                <select
                  className={`${field} h-9 w-full rounded-md border px-2 text-sm`}
                  value={d.channel}
                  onChange={(e) => setD({ channel: e.target.value as ApprovalChannel | "" })}
                >
                  <option value="">Выберите…</option>
                  {(Object.keys(APPROVAL_CHANNEL_LABEL) as ApprovalChannel[]).map((c) => (
                    <option key={c} value={c}>
                      {APPROVAL_CHANNEL_LABEL[c]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-300">Когда ответил клиент (по умолчанию — сейчас)</span>
                <Input type="datetime-local" className={field} value={d.at} onChange={(e) => setD({ at: e.target.value })} />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-300">Кто принял ответ (по умолчанию — вы)</span>
                <Input className={field} maxLength={120} value={d.approvedBy} onChange={(e) => setD({ approvedBy: e.target.value })} />
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-xs text-slate-300">Подтверждение (например, «сообщение в WhatsApp 22.11 14:05»)</span>
              <Input className={field} maxLength={300} value={d.note} onChange={(e) => setD({ note: e.target.value })} />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={busy || locked} onClick={() => void decide(item, "APPROVED")}>
                Клиент согласен
              </Button>
              <Button size="sm" variant="secondary" disabled={busy || locked} onClick={() => void decide(item, "REJECTED")}>
                Клиент отказался
              </Button>
              <Button size="sm" variant="ghost" className="text-red-300" disabled={busy || locked} onClick={() => removeExtra(item)}>
                Удалить
              </Button>
            </div>
          </div>
        ) : null}

        {decided && item.approval ? (
          <p className="text-xs text-slate-300">
            {APPROVAL_STATUS_LABEL[item.approval.status!]}: {fmt(item.approval.approvedAt)}
            {item.approval.channel ? `, ${APPROVAL_CHANNEL_LABEL[item.approval.channel].toLowerCase()}` : ""}
            {item.approval.approvedBy ? `, принял: ${item.approval.approvedBy}` : ""}
            {item.approval.note ? ` — ${item.approval.note}` : ""}
          </p>
        ) : null}

        {!pending ? (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Ответственный мастер</span>
                <select
                  className={`${field} h-9 w-full rounded-md border px-2 text-sm`}
                  disabled={locked || busy}
                  value={item.master?.id ?? ""}
                  onChange={(e) => void patchItem(item, { masterId: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">Не назначен</option>
                  {view.masters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                      {m.assigned ? " · на записи" : ""}
                    </option>
                  ))}
                </select>
              </label>
              <div className="space-y-1 text-xs text-slate-400">
                <span>Начало / завершение</span>
                <p className="pt-1.5 text-sm text-slate-200">
                  {fmt(item.startedAt)} → {fmt(item.finishedAt)}
                </p>
              </div>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Фактически выполненный объём</span>
                <BlurField
                  value={item.actualVolume ?? ""}
                  disabled={locked}
                  maxLength={300}
                  placeholder="например, днище и арки"
                  onCommit={(v) => void patchItem(item, { actualVolume: v })}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Комментарий (при отмене — причина)</span>
                <BlurField
                  value={item.workNote ?? ""}
                  disabled={locked}
                  maxLength={500}
                  onCommit={(v) => void patchItem(item, { workNote: v })}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {photoRow(item, "WORK_BEFORE")}
              {photoRow(item, "WORK_AFTER")}
            </div>

            {!locked && next.length > 0 ? (
              <div className="flex flex-wrap gap-2 border-t border-white/10 pt-2">
                {next.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={s === "DONE" ? "default" : "secondary"}
                    disabled={busy}
                    onClick={() => changeStatus(item, s)}
                  >
                    {STATUS_ACTION[s]}
                  </Button>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </li>
    );
  };

  return (
    <div className="space-y-4 text-white">
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Выполнение работ</h2>
        {!locked ? (
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => set({ extra: "new" })}>
            <Plus className="mr-1 h-4 w-4" />
            Дополнительная работа
          </Button>
        ) : null}
      </div>

      {locked ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          Акт выполненных работ подписан — выполнение, допработы и фото больше не меняются.
        </p>
      ) : null}

      <div className="grid gap-2 rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-slate-400">Начало работ</p>
          <p>{fmt(view.workStartedAt)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Завершение</p>
          <p>{fmt(view.workFinishedAt)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Не завершено</p>
          <p className={view.summary.unfinished > 0 ? "text-amber-300" : ""}>{view.summary.unfinished}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Ждут решения клиента</p>
          <p className={view.summary.pendingExtras > 0 ? "text-amber-300" : ""}>{view.summary.pendingExtras}</p>
        </div>
      </div>

      {addingExtra ? (
        <div id="extra-form" className="space-y-4 rounded-xl border border-amber-400/30 bg-slate-900/70 p-3">
          <h3 className="text-sm font-semibold">Дополнительная работа по найденному дефекту</h3>
          <p className="text-xs text-slate-400">
            Допработа не входит в сумму к оплате, пока клиент не согласует её (дата, способ и подтверждение фиксируются).
          </p>
          <WorkItemFields
            catalog={catalog}
            draft={extra}
            onChange={(draft) => setExtra({ ...extra, ...draft })}
            onCatalogChanged={loadCatalog}
            commentLabel="Описание дефекта"
            priceLabel="Стоимость допработы, ₽"
            extra={
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-sm text-slate-300">Место дефекта</span>
                  <Input className={field} maxLength={200} value={extra.defectPlace} onChange={(e) => setExtra({ ...extra, defectPlace: e.target.value })} />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm text-slate-300">Предполагаемое изменение срока</span>
                  <Input className={field} maxLength={200} placeholder="например, +1 день" value={extra.termChangeNote} onChange={(e) => setExtra({ ...extra, termChangeNote: e.target.value })} />
                </label>
              </div>
            }
          />
          <p className="text-xs text-slate-400">Фото дефекта можно добавить к допработе после сохранения.</p>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => void saveExtra()}>
              Сохранить
            </Button>
            <Button variant="secondary" onClick={() => (setExtra(emptyExtra()), set({ extra: null }))}>
              Отмена
            </Button>
          </div>
        </div>
      ) : null}

      {view.items.length === 0 ? (
        <p className="text-sm text-slate-400">Нет работ. Согласуйте перечень на вкладке «Согласованные работы».</p>
      ) : (
        <ul className="space-y-3">{view.items.map(card)}</ul>
      )}

      <div className="space-y-1.5 rounded-xl border border-white/10 bg-slate-950/50 p-3 text-sm">
        <h3 className="font-semibold">Фактическая стоимость</h3>
        <div className="flex justify-between text-slate-300"><span>Основные работы</span><span>{formatRub(a.main)}</span></div>
        <div className="flex justify-between text-slate-300"><span>Допработы, согласованные клиентом</span><span>{formatRub(a.extras)}</span></div>
        <div className="flex justify-between text-slate-300"><span>Скидка</span><span>{a.discountRub > 0 ? `− ${formatRub(a.discountRub)}` : "нет"}</span></div>
        <div className="flex justify-between font-medium"><span>Итог</span><span>{formatRub(a.total)}</span></div>
        <div className="flex justify-between text-slate-300"><span>Получено / остаток</span><span>{formatRub(a.paidRub)} / {a.remaining == null ? "не определён" : formatRub(a.remaining)}</span></div>
        <p className="text-xs text-slate-500">Скидка и оплата меняются на вкладке «Согласованные работы».</p>
      </div>
    </div>
  );
}
