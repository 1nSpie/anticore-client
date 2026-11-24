"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Camera, CheckCircle2, Trash2, TriangleAlert } from "lucide-react";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Textarea } from "@/shadcn/textarea";
import { Checkbox } from "@/shadcn/checkbox";
import { getVinValidationError } from "@/lib/vin";
import { getPlateError, getVehicleYearError, normalizePlateInput } from "@/lib/vehicle";
import { adminApi } from "../../_lib/api";
import {
  BODY_ELEMENTS,
  DAMAGE_LABEL,
  DAMAGE_SYMBOL,
  DAMAGE_TYPES,
  INTERIOR_KEYS,
  INTERIOR_LABEL,
  NOT_CHECKED_WORD,
  SYSTEM_KEYS,
  SYSTEM_LABEL,
  SYSTEM_WORDS,
  type DamageType,
  type InspectionPhoto,
  type InspectionView,
  type SystemStatus,
} from "../../_lib/inspectionTypes";

const field = "border-white/20 bg-slate-800 text-white";
const section = "space-y-3 rounded-xl border border-white/10 bg-slate-950/50 p-4";
const chip = (on: boolean, tone: "ok" | "bad" | "neutral" = "neutral") =>
  `rounded-lg border px-3 py-1.5 text-sm transition ${
    on
      ? tone === "bad"
        ? "border-red-400/60 bg-red-500/20 text-red-100"
        : tone === "ok"
          ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100"
          : "border-sky-400/60 bg-sky-500/20 text-sky-100"
      : "border-white/15 bg-slate-800 text-slate-300 hover:border-white/30"
  }`;

/** Якоря, которые возвращает сервер в списке недостающего → id блока в форме. */
export const ANCHOR_ID: Record<string, string> = {
  client: "insp-client",
  vehicle: "insp-card",
  "vehicle.year": "insp-year",
  "vehicle.vin": "insp-vin",
  "vehicle.plate": "insp-plate",
  inspection: "insp-top",
  receivedAt: "insp-receivedAt",
  receivedBy: "insp-receivedBy",
  mileageKm: "insp-mileageKm",
  fuelPercent: "insp-fuelPercent",
  keysCount: "insp-keysCount",
  exterior: "insp-exterior",
  interior: "insp-interior",
  systems: "insp-systems",
  verify: "insp-verify",
};

function errorText(e: unknown): string {
  const data = (e as { response?: { data?: { message?: unknown } } })?.response?.data;
  const m = data?.message;
  if (typeof m === "string") return m;
  if (Array.isArray(m)) return m.join(", ");
  return "Не удалось сохранить";
}

/** Поле с локальным черновиком: на сервер уходит при потере фокуса, если значение изменилось. */
function DraftField({
  value,
  onCommit,
  multiline,
  ...rest
}: {
  value: string;
  onCommit: (v: string) => unknown;
  multiline?: boolean;
  id?: string;
  list?: string;
  type?: string;
  inputMode?: "numeric" | "text";
  maxLength?: number;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    if (draft !== value) void onCommit(draft);
  };
  return multiline ? (
    <Textarea
      {...rest}
      rows={2}
      className={`${field} ${rest.className ?? ""}`}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
    />
  ) : (
    <Input
      {...rest}
      className={`${field} ${rest.className ?? ""}`}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
    />
  );
}

function Block({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className={section}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">{title}</h3>
      {children}
    </section>
  );
}

function Labeled({
  id,
  label,
  className = "",
  children,
}: {
  id?: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className={`space-y-1.5 ${className}`}>
      <label className="text-sm text-slate-300">{label}</label>
      {children}
    </div>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

type Props = {
  appointmentId: number;
  /** Вызывается после любого изменения — например, чтобы обновить данные автомобиля в карточке. */
  onChanged?: () => void;
  /** id блока формы (из `?focus=`): после загрузки страница прокручивается к нему. */
  focus?: string | null;
};

type PendingMark = { x: number; y: number; type: DamageType; element: string; note: string };

/** Приёмка автомобиля — вкладка страницы записи (`?tab=acceptance`). */
export function AcceptanceForm({ appointmentId, onChanged, focus }: Props) {
  const base = `/crm/appointments/${appointmentId}/inspection`;
  const [data, setData] = useState<InspectionView | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [staff, setStaff] = useState<{ id: number; fullName: string; blockedAt: string | null }[]>([]);
  const [pending, setPending] = useState<PendingMark | null>(null);
  const [vinError, setVinError] = useState<string | null>(null);
  const [plateError, setPlateError] = useState<string | null>(null);
  const [yearError, setYearError] = useState<string | null>(null);
  const photoTarget = useRef<{ section?: string; markId?: number } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: view } = await adminApi.get<InspectionView>(base);
      setData(view);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    setPending(null);
    void load();
    adminApi
      .get<{ id: number; fullName: string; blockedAt: string | null }[]>("/crm/staff")
      .then((r) => setStaff(r.data.filter((s) => !s.blockedAt)))
      .catch(() => setStaff([]));
  }, [load]);

  // Прямая ссылка на поле: после первой загрузки прокручиваем к нему (один раз)
  const focused = useRef<string | null>(null);
  useEffect(() => {
    if (!focus || !data?.started || focused.current === focus) return;
    focused.current = focus;
    requestAnimationFrame(() =>
      document.getElementById(focus)?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  }, [focus, data?.started]);

  /** Любое изменение: сервер возвращает полное состояние приёмки. */
  const apply = async (fn: () => Promise<{ data: InspectionView }>) => {
    setBusy(true);
    try {
      const { data: view } = await fn();
      setData(view);
      onChanged?.();
      return true;
    } catch (e) {
      toast.error(errorText(e));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const patch = (body: Record<string, unknown>) =>
    apply(() => adminApi.patch<InspectionView>(base, body));

  const patchVehicle = async (body: { vin?: string | null; plate?: string | null; year?: number }) => {
    if (!data?.vehicle) return;
    setBusy(true);
    try {
      await adminApi.patch(`/crm/clients/${data.client.id}/vehicles/${data.vehicle.id}`, body);
      await load();
      onChanged?.();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const patchClient = async (body: {
    lastName?: string;
    firstName?: string;
    patronymic?: string;
    birthDate?: string | null;
  }) => {
    if (!data) return;
    setBusy(true);
    try {
      await adminApi.patch(`/crm/clients/${data.client.id}`, body);
      await load();
      onChanged?.();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const jump = (anchor: string) => {
    const el = document.getElementById(ANCHOR_ID[anchor] ?? "insp-top");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const pickPhoto = (target: { section?: string; markId?: number }) => {
    photoTarget.current = target;
    fileInput.current?.click();
  };

  const onFile = async (file: File | undefined) => {
    if (!file || !photoTarget.current) return;
    const fd = new FormData();
    fd.append("file", file);
    if (photoTarget.current.section) fd.append("section", photoTarget.current.section);
    if (photoTarget.current.markId !== undefined) fd.append("markId", String(photoTarget.current.markId));
    await apply(() => adminApi.post<InspectionView>(`${base}/photos`, fd));
    if (fileInput.current) fileInput.current.value = "";
  };

  const deletePhoto = (id: number) => {
    if (!confirm("Удалить фото?")) return;
    void apply(() => adminApi.delete<InspectionView>(`${base}/photos/${id}`));
  };

  const addMark = async () => {
    if (!pending) return;
    if (!pending.element.trim()) {
      toast.error("Укажите кузовной элемент");
      return;
    }
    const ok = await apply(() =>
      adminApi.post<InspectionView>(`${base}/marks`, {
        type: pending.type,
        x: pending.x,
        y: pending.y,
        element: pending.element.trim(),
        note: pending.note.trim() || null,
      }),
    );
    if (ok) setPending(null);
  };

  const onSchemeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setPending((p) => ({ x, y, type: p?.type ?? "SCRATCH", element: p?.element ?? "", note: p?.note ?? "" }));
  };

  const insp = data?.inspection ?? null;
  const missing = data?.readiness.missing ?? [];
  const cardMissing = missing.filter((m) => m.code.startsWith("client.") || m.code.startsWith("vehicle"));
  const staffOptions = (() => {
    const map = new Map<number, string>();
    data?.assignees.forEach((a) => map.set(a.id, a.fullName));
    staff.forEach((s) => map.set(s.id, s.fullName));
    if (insp?.receivedBy) map.set(insp.receivedBy.id, insp.receivedBy.fullName);
    return [...map.entries()];
  })();

  const photoStrip = (photos: InspectionPhoto[]) =>
    photos.length > 0 && (
      <div className="flex flex-wrap gap-2">
        {photos.map((p) => (
          <div key={p.id} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-white/15">
            {p.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.url} alt="Фото приёмки" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-[10px] text-slate-400">нет ссылки</span>
            )}
            <button
              type="button"
              aria-label="Удалить фото"
              onClick={() => deletePhoto(p.id)}
              className="absolute right-0.5 top-0.5 rounded bg-black/60 p-0.5 text-red-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    );

  const addPhotoButton = (target: { section?: string; markId?: number }, label = "Фото") => (
    <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => pickPhoto(target)}>
      <Camera className="mr-1 h-4 w-4" />
      {label}
    </Button>
  );

  return (
    <div className="space-y-4 text-white">
      <h2 id="insp-top" className="text-lg font-semibold">
        Приёмка автомобиля
      </h2>

        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />

        {loading && !data ? <p className="text-sm text-slate-400">Загрузка…</p> : null}

        {data && !data.started ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-300">
              Приёмка по этой записи ещё не начата. Данные клиента и автомобиля подставятся автоматически;
              фактическое время приёма зафиксируется при начале.
            </p>
            <Button disabled={busy} onClick={() => void apply(() => adminApi.post<InspectionView>(`${base}/start`))}>
              Начать приёмку
            </Button>
          </div>
        ) : null}

        {data && data.started && insp ? (
          <div className="space-y-4">
            {/* Что не заполнено — с переходом к полю */}
            {data.readiness.complete ? (
              <p className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                <CheckCircle2 className="h-4 w-4" /> Приёмка заполнена полностью — акт приёма-передачи можно формировать.
              </p>
            ) : (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-100">
                  <TriangleAlert className="h-4 w-4" /> Не заполнено ({missing.length}):
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {missing.map((m) => (
                    <li key={m.code}>
                      <button
                        type="button"
                        onClick={() => jump(m.field)}
                        className="rounded-md border border-amber-400/30 bg-slate-900/60 px-2 py-1 text-xs text-amber-100 hover:border-amber-300"
                      >
                        {m.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 10.1 Данные при приёмке */}
            <Block title="Данные при приёмке">
              <div id="insp-card" className="rounded-lg bg-slate-900/60 p-3 text-sm">
                <p className="text-white">
                  {[data.client.lastName, data.client.firstName, data.client.patronymic].filter(Boolean).join(" ") ||
                    "Имя клиента не указано"}
                  <span className="ml-2 text-xs text-slate-400">{data.client.phone}</span>
                </p>
                <p className="text-slate-300">
                  {data.vehicle
                    ? `${data.vehicle.label || "Автомобиль"}${data.vehicle.year ? `, ${data.vehicle.year} г.` : ""}`
                    : "К записи не привязан автомобиль"}
                </p>
              </div>
              <div id="insp-client" className="grid gap-3 sm:grid-cols-4">
                <Labeled label="Фамилия">
                  <DraftField value={data.client.lastName ?? ""} maxLength={100} onCommit={(v) => patchClient({ lastName: v.trim() })} />
                </Labeled>
                <Labeled label="Имя">
                  <DraftField value={data.client.firstName ?? ""} maxLength={100} onCommit={(v) => patchClient({ firstName: v.trim() })} />
                </Labeled>
                <Labeled label="Отчество (если есть)">
                  <DraftField value={data.client.patronymic ?? ""} maxLength={100} onCommit={(v) => patchClient({ patronymic: v.trim() })} />
                </Labeled>
                <Labeled id="insp-birthDate" label="Дата рождения">
                  <DraftField
                    type="date"
                    value={data.client.birthDate ? String(data.client.birthDate).slice(0, 10) : ""}
                    onCommit={(v) => patchClient({ birthDate: v || null })}
                  />
                </Labeled>
              </div>
              {data.vehicle ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Labeled id="insp-year" label="Год выпуска">
                    <DraftField
                      value={data.vehicle.year != null ? String(data.vehicle.year) : ""}
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="например, 2019"
                      onCommit={async (v) => {
                        const err = getVehicleYearError(v);
                        setYearError(err);
                        if (!err) await patchVehicle({ year: Number(v.trim()) });
                      }}
                    />
                    {yearError ? <p className="text-xs text-red-400">{yearError}</p> : null}
                  </Labeled>
                  <Labeled id="insp-plate" label="Государственный номер">
                    <DraftField
                      value={data.vehicle.plate ?? ""}
                      maxLength={15}
                      placeholder="А123ВС77"
                      className="uppercase"
                      onCommit={async (v) => {
                        const err = getPlateError(v);
                        setPlateError(err);
                        if (!err) await patchVehicle({ plate: normalizePlateInput(v) || null });
                      }}
                    />
                    {plateError ? <p className="text-xs text-red-400">{plateError}</p> : null}
                  </Labeled>
                  <Labeled id="insp-vin" label="VIN (сверьте с маркировкой и документами)" className="sm:col-span-2">
                    <DraftField
                      value={data.vehicle.vin ?? ""}
                      maxLength={17}
                      className="font-mono uppercase"
                      placeholder="17 символов, без I/O/Q"
                      onCommit={async (v) => {
                        const vin = v.trim().toUpperCase();
                        const err = vin ? getVinValidationError(vin) : null;
                        setVinError(err);
                        if (!err) await patchVehicle({ vin: vin || null });
                      }}
                    />
                    {vinError ? <p className="text-xs text-red-400">{vinError}</p> : null}
                  </Labeled>
                </div>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-3">
                <Labeled id="insp-mileageKm" label="Пробег, км">
                  <DraftField
                    inputMode="numeric"
                    maxLength={7}
                    value={insp.mileageKm != null ? String(insp.mileageKm) : ""}
                    onCommit={(v) =>
                      patch({ mileageKm: v.trim() ? Number(v.replace(/\D/g, "")) : null })
                    }
                  />
                </Labeled>
                <Labeled id="insp-fuelPercent" label="Топливо, %">
                  <DraftField
                    inputMode="numeric"
                    maxLength={3}
                    value={insp.fuelPercent != null ? String(insp.fuelPercent) : ""}
                    onCommit={(v) =>
                      patch({ fuelPercent: v.trim() ? Number(v.replace(/\D/g, "")) : null })
                    }
                  />
                </Labeled>
                <Labeled id="insp-keysCount" label="Ключей передано, шт.">
                  <DraftField
                    inputMode="numeric"
                    maxLength={2}
                    value={insp.keysCount != null ? String(insp.keysCount) : ""}
                    onCommit={(v) =>
                      patch({ keysCount: v.trim() ? Number(v.replace(/\D/g, "")) : null })
                    }
                  />
                </Labeled>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Labeled id="insp-receivedAt" label="Фактические дата и время приёма">
                  <DraftField
                    type="datetime-local"
                    value={toLocalInput(insp.receivedAt)}
                    onCommit={(v) => (v ? patch({ receivedAt: new Date(v).toISOString() }) : undefined)}
                  />
                </Labeled>
                <Labeled id="insp-receivedBy" label="Мастер-приёмщик">
                  <select
                    className={`${field} h-9 w-full rounded-md border px-2 text-sm`}
                    value={insp.receivedBy?.id ?? ""}
                    onChange={(e) => void patch({ receivedById: e.target.value ? Number(e.target.value) : null })}
                  >
                    <option value="">Не выбран</option>
                    {staffOptions.map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </Labeled>
              </div>
            </Block>

            {/* 10.2 Внешнее состояние */}
            <Block id="insp-exterior" title="Внешнее состояние">
              <p className="text-xs text-slate-400">
                Нажмите на схему, чтобы поставить отметку. X — царапина, O — вмятина, K — коррозия, S — скол, D — иное.
              </p>
              <div
                className="relative mx-auto w-full max-w-xl cursor-crosshair select-none overflow-hidden rounded-lg border border-white/15 bg-white"
                onClick={onSchemeClick}
                role="presentation"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/templates/acts/car-diagram.png"
                  alt="Схема автомобиля"
                  className="block w-full"
                  draggable={false}
                />
                {data.marks.map((m) => (
                  <span
                    key={m.id}
                    title={`${DAMAGE_LABEL[m.type]}: ${m.element}`}
                    className="pointer-events-none absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-red-600 bg-white text-[10px] font-bold text-red-600"
                    style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
                  >
                    {DAMAGE_SYMBOL[m.type]}
                  </span>
                ))}
                {pending ? (
                  <span
                    className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-sky-600 bg-sky-200/70"
                    style={{ left: `${pending.x * 100}%`, top: `${pending.y * 100}%` }}
                  />
                ) : null}
              </div>

              {pending ? (
                <div className="space-y-3 rounded-lg border border-sky-400/30 bg-sky-500/10 p-3">
                  <div className="flex flex-wrap gap-2">
                    {DAMAGE_TYPES.map((t) => (
                      <button key={t} type="button" className={chip(pending.type === t)} onClick={() => setPending({ ...pending, type: t })}>
                        {DAMAGE_SYMBOL[t]} — {DAMAGE_LABEL[t]}
                      </button>
                    ))}
                  </div>
                  <Input
                    className={field}
                    list="insp-elements"
                    placeholder="Кузовной элемент (например, Капот)"
                    value={pending.element}
                    onChange={(e) => setPending({ ...pending, element: e.target.value })}
                  />
                  <Input
                    className={field}
                    placeholder="Описание повреждения"
                    maxLength={500}
                    value={pending.note}
                    onChange={(e) => setPending({ ...pending, note: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busy} onClick={() => void addMark()}>
                      Добавить отметку
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setPending(null)}>
                      Отмена
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400">Фото к отметке можно добавить после сохранения.</p>
                </div>
              ) : null}
              <datalist id="insp-elements">
                {BODY_ELEMENTS.map((e) => (
                  <option key={e} value={e} />
                ))}
              </datalist>

              {data.marks.length > 0 ? (
                <ul className="space-y-2">
                  {data.marks.map((m, i) => (
                    <li key={m.id} className="space-y-2 rounded-lg border border-white/10 bg-slate-900/60 p-3">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-red-500 text-xs font-bold text-red-300">
                          {DAMAGE_SYMBOL[m.type]}
                        </span>
                        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[9rem_1fr_1fr]">
                          <select
                            className={`${field} h-9 rounded-md border px-2 text-sm`}
                            value={m.type}
                            onChange={(e) =>
                              void apply(() => adminApi.patch<InspectionView>(`${base}/marks/${m.id}`, { type: e.target.value }))
                            }
                          >
                            {DAMAGE_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {DAMAGE_SYMBOL[t]} — {DAMAGE_LABEL[t]}
                              </option>
                            ))}
                          </select>
                          <DraftField
                            list="insp-elements"
                            value={m.element}
                            placeholder="Элемент"
                            onCommit={(v) =>
                              v.trim()
                                ? apply(() => adminApi.patch<InspectionView>(`${base}/marks/${m.id}`, { element: v }))
                                : undefined
                            }
                          />
                          <DraftField
                            value={m.note ?? ""}
                            placeholder="Описание"
                            maxLength={500}
                            onCommit={(v) =>
                              apply(() => adminApi.patch<InspectionView>(`${base}/marks/${m.id}`, { note: v || null }))
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 text-red-300"
                          aria-label={`Удалить отметку ${i + 1}`}
                          onClick={() => {
                            if (confirm("Удалить отметку вместе с её фото?"))
                              void apply(() => adminApi.delete<InspectionView>(`${base}/marks/${m.id}`));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pl-8">
                        {photoStrip(m.photos)}
                        {addPhotoButton({ markId: m.id })}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                  <Checkbox
                    checked={insp.noDefectsConfirmed}
                    onCheckedChange={(v) => void patch({ noDefectsConfirmed: v === true })}
                    className="border-white/20 data-[state=checked]:bg-emerald-600"
                  />
                  Осмотрено, повреждений ЛКП и кузовных элементов нет
                </label>
              )}
              <Labeled label="Дополнительные замечания">
                <DraftField multiline value={insp.exteriorNote ?? ""} maxLength={2000} onCommit={(v) => patch({ exteriorNote: v || null })} />
              </Labeled>
            </Block>

            {/* 10.3 Салон */}
            <Block id="insp-interior" title="Состояние салона">
              <div className="space-y-2">
                {INTERIOR_KEYS.map((key) => {
                  const flag = insp.interior[key];
                  return (
                    <div key={key} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm text-slate-200">{INTERIOR_LABEL[key]}</span>
                      <div className="flex gap-2">
                        <button type="button" className={chip(flag === "NONE", "ok")} onClick={() => void patch({ interior: { [key]: "NONE" } })}>
                          Замечаний нет
                        </button>
                        <button type="button" className={chip(flag === "PRESENT", "bad")} onClick={() => void patch({ interior: { [key]: "PRESENT" } })}>
                          Есть замечания
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Labeled label="Примечания">
                <DraftField multiline value={insp.interiorNote ?? ""} maxLength={2000} onCommit={(v) => patch({ interiorNote: v || null })} />
              </Labeled>
              <div className="flex flex-wrap items-center gap-2">
                {photoStrip(data.photos.filter((p) => p.section === "INTERIOR"))}
                {addPhotoButton({ section: "INTERIOR" }, "Фото салона")}
              </div>
            </Block>

            {/* 10.4 Системы */}
            <Block id="insp-systems" title="Проверка работоспособности систем">
              <p className="text-xs text-slate-400">
                Если систему не проверяли, выберите «{NOT_CHECKED_WORD}» — без выбора она не считается исправной.
              </p>
              <div className="space-y-3">
                {SYSTEM_KEYS.map((key) => {
                  const v = insp.systems[key];
                  const set = (status: SystemStatus) => void patch({ systems: { [key]: { status, note: v?.note } } });
                  return (
                    <div key={key} className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-slate-200">{SYSTEM_LABEL[key]}</span>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className={chip(v?.status === "OK", "ok")} onClick={() => set("OK")}>
                            {SYSTEM_WORDS[key].OK}
                          </button>
                          <button type="button" className={chip(v?.status === "FAULTY", "bad")} onClick={() => set("FAULTY")}>
                            {SYSTEM_WORDS[key].FAULTY}
                          </button>
                          <button type="button" className={chip(v?.status === "NOT_CHECKED")} onClick={() => set("NOT_CHECKED")}>
                            {NOT_CHECKED_WORD}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Labeled label="Примечания">
                <DraftField multiline value={insp.systemsNote ?? ""} maxLength={2000} onCommit={(v) => patch({ systemsNote: v || null })} />
              </Labeled>
            </Block>

            {/* Условия, комментарии, фото */}
            <Block title="Условия и фотофиксация">
              <Labeled label="Индивидуально согласованные особенности приёмки">
                <DraftField multiline value={insp.specialTerms ?? ""} maxLength={2000} onCommit={(v) => patch({ specialTerms: v || null })} />
              </Labeled>
              <Labeled label="Комментарий приёмщика">
                <DraftField multiline value={insp.note ?? ""} maxLength={2000} onCommit={(v) => patch({ note: v || null })} />
              </Labeled>
              <div className="flex flex-wrap items-center gap-2">
                {photoStrip(data.photos.filter((p) => p.section !== "INTERIOR"))}
                {addPhotoButton({ section: "GENERAL" }, "Общее фото")}
              </div>
            </Block>

            {/* Кто и когда проверил карточку */}
            <Block id="insp-verify" title="Проверка данных">
              {insp.dataVerifiedAt ? (
                <p className="flex items-center gap-2 text-sm text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Проверено: {insp.dataVerifiedBy ?? "—"},{" "}
                  {new Date(insp.dataVerifiedAt).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })}
                </p>
              ) : (
                <p className="text-sm text-slate-300">
                  Сверьте ФИО, автомобиль, госномер и VIN с маркировкой и документами, затем подтвердите.
                </p>
              )}
              {cardMissing.length > 0 ? (
                <p className="text-xs text-amber-200">Сначала заполните: {cardMissing.map((m) => m.label).join(", ")}.</p>
              ) : null}
              <Button
                disabled={busy || cardMissing.length > 0}
                variant={insp.dataVerifiedAt ? "secondary" : "default"}
                onClick={() => void apply(() => adminApi.post<InspectionView>(`${base}/verify`))}
              >
                {insp.dataVerifiedAt ? "Подтвердить заново" : "Данные проверены, VIN сверен"}
              </Button>
            </Block>
          </div>
        ) : null}
    </div>
  );
}
