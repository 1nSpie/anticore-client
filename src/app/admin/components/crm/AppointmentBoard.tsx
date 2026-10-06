"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Plus } from "lucide-react";
import { cn } from "src/lib/utils";
import { formatPhoneRuDisplaySafe } from "@/lib/phoneRu";
import type { CrmAppointment } from "../../_lib/crmTypes";
import { formatAppointmentCar } from "../../_lib/formatCar";
import { monthGridDays, weekDays } from "../../_lib/calendarRange";
import {
  calendarDateKey,
  capacityRemainingLabel,
  capacityShort,
  dayCapacity,
} from "../../_lib/dayCapacity";
import { COMPLETED_EVENT_COLOR, getEventColor } from "./calendarColors";
import type { CalendarViewType } from "./CrmCalendarToolbar";

/**
 * Доска записей для десктопа: записи — это карточки фиксированной высоты, а не блоки,
 * растянутые по времени. Карточка стоит в колонке своего дня в порядке времени начала,
 * все данные видны сразу, без открытия каждой записи.
 */

type Props = {
  view: CalendarViewType;
  focusDate: Date;
  appointments: CrmAppointment[];
  limits: Record<string, number>;
  bookedByDay: Record<string, number>;
  onOpen: (appointment: CrmAppointment) => void;
  onCreate: (date: Date) => void;
  /** Открыть день целиком (клик по дате / «ещё N»). */
  onOpenDay: (date: Date) => void;
  /** Перенос карточки на другой день (время и длительность сохраняются). */
  onMove: (appointment: CrmAppointment, targetDay: Date) => void;
  /** Запись, найденная поиском: подсветить и прокрутить к ней. */
  highlightId?: number | null;
};

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTH_CHIPS = 3;

const timeFmt = (iso: string) =>
  new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

function clientName(a: CrmAppointment): string {
  const fio = [a.client.lastName, a.client.firstName].filter(Boolean).join(" ");
  return fio || formatPhoneRuDisplaySafe(a.client.phone);
}

function colorOf(a: CrmAppointment) {
  return a.completedAt ? COMPLETED_EVENT_COLOR : getEventColor(a.serviceTypeId ?? a.id);
}

type DragApi = {
  dragId: number | null;
  setDragId: (id: number | null) => void;
};

function AppointmentCard({
  a,
  onOpen,
  drag,
  highlighted,
}: {
  a: CrmAppointment;
  onOpen: (a: CrmAppointment) => void;
  drag: DragApi;
  highlighted: boolean;
}) {
  const done = Boolean(a.completedAt);
  const car = formatAppointmentCar(a);
  const phone = formatPhoneRuDisplaySafe(a.client.phone);
  const full = [
    `${timeFmt(a.startsAt)}–${timeFmt(a.endsAt)}`,
    clientName(a),
    car,
    a.serviceType,
    a.masterComment ? `Комментарий мастера: ${a.masterComment}` : "",
    a.managerName ? `Менеджер: ${a.managerName}` : "",
    phone,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div
      role="button"
      tabIndex={0}
      id={`apt-${a.id}`}
      title={full}
      draggable={!done}
      onClick={() => onOpen(a)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(a);
        }
      }}
      onDragStart={(e: DragEvent) => {
        e.dataTransfer.setData("text/plain", String(a.id));
        e.dataTransfer.effectAllowed = "move";
        drag.setDragId(a.id);
      }}
      onDragEnd={() => drag.setDragId(null)}
      className={cn(
        "relative flex h-[212px] cursor-pointer select-none flex-col overflow-hidden rounded-lg border border-white/10 bg-slate-900/70 py-2 pl-3.5 pr-2.5 text-left transition-colors hover:border-white/25 hover:bg-slate-800/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400",
        done && "opacity-70",
        drag.dragId === a.id && "opacity-40",
        highlighted && "border-emerald-400 ring-2 ring-emerald-400/70",
      )}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: colorOf(a).border }}
        aria-hidden
      />
      <div className="flex items-center gap-1.5 text-[13px] font-bold tabular-nums text-emerald-300">
        {timeFmt(a.startsAt)}
        <span className="text-xs font-medium text-emerald-300/60">–{timeFmt(a.endsAt)}</span>
        {done ? (
          <span className="ml-auto rounded-full bg-teal-500/20 px-1.5 text-[11px] font-medium text-teal-300">
            ✓
          </span>
        ) : null}
      </div>
      <div className="mt-0.5 line-clamp-2 text-sm font-semibold leading-5 text-white">
        {clientName(a)}
      </div>
      {car ? (
        <div className="mt-0.5 line-clamp-2 text-xs leading-4 text-slate-200">{car}</div>
      ) : null}
      <div className="mt-0.5 line-clamp-2 text-xs leading-4 text-slate-400">{a.serviceType}</div>
      {a.masterComment ? (
        <div className="mt-1 line-clamp-2 text-xs leading-4 text-amber-200/90">
          {a.masterComment}
        </div>
      ) : null}
      <div className="mt-auto pt-1 text-[11px] leading-4">
        <div className="truncate font-medium text-slate-300">{phone}</div>
        {a.managerName ? (
          <div className="truncate text-slate-500">{a.managerName}</div>
        ) : null}
      </div>
    </div>
  );
}

function MonthChip({
  a,
  onOpen,
  drag,
  highlighted,
}: {
  a: CrmAppointment;
  onOpen: (a: CrmAppointment) => void;
  drag: DragApi;
  highlighted: boolean;
}) {
  const done = Boolean(a.completedAt);
  const car = formatAppointmentCar(a);
  return (
    <div
      role="button"
      tabIndex={0}
      id={`apt-${a.id}`}
      title={`${timeFmt(a.startsAt)}–${timeFmt(a.endsAt)}\n${clientName(a)}\n${car}\n${a.serviceType}`}
      draggable={!done}
      onClick={() => onOpen(a)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(a);
        }
      }}
      onDragStart={(e: DragEvent) => {
        e.dataTransfer.setData("text/plain", String(a.id));
        e.dataTransfer.effectAllowed = "move";
        drag.setDragId(a.id);
      }}
      onDragEnd={() => drag.setDragId(null)}
      className={cn(
        "flex h-6 cursor-pointer items-center gap-1 overflow-hidden rounded border-l-[3px] bg-slate-900/70 px-1.5 text-[11px] text-slate-200 hover:bg-slate-800",
        done && "opacity-60",
        drag.dragId === a.id && "opacity-40",
        highlighted && "ring-2 ring-emerald-400/80",
      )}
      style={{ borderLeftColor: colorOf(a).border }}
    >
      <span className="shrink-0 font-semibold tabular-nums text-emerald-300">
        {timeFmt(a.startsAt)}
      </span>
      <span className="truncate">
        {clientName(a)}
        {car ? ` · ${car}` : ""}
      </span>
    </div>
  );
}

export function AppointmentBoard({
  view,
  focusDate,
  appointments,
  limits,
  bookedByDay,
  onOpen,
  onCreate,
  onOpenDay,
  onMove,
  highlightId = null,
}: Props) {
  const [dragId, setDragId] = useState<number | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const drag: DragApi = { dragId, setDragId };

  const byDay = useMemo(() => {
    const map = new Map<string, CrmAppointment[]>();
    for (const a of appointments) {
      const key = calendarDateKey(new Date(a.startsAt));
      const list = map.get(key);
      if (list) list.push(a);
      else map.set(key, [a]);
    }
    for (const list of map.values()) {
      list.sort(
        (x, y) => new Date(x.startsAt).getTime() - new Date(y.startsAt).getTime(),
      );
    }
    return map;
  }, [appointments]);

  const todayKey = calendarDateKey(new Date());

  /** Прокрутить к найденной записи, когда она появилась на экране (после перехода на её день). */
  const scrolledFor = useRef<number | null>(null);
  useEffect(() => {
    if (highlightId === null) {
      scrolledFor.current = null;
      return;
    }
    if (scrolledFor.current === highlightId) return;
    const el = document.getElementById(`apt-${highlightId}`);
    if (el) {
      scrolledFor.current = highlightId;
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [highlightId, appointments]);

  /** Общие обработчики «бросить карточку на день». */
  const dropProps = (day: Date) => {
    const key = calendarDateKey(day);
    return {
      onDragOver: (e: DragEvent) => {
        if (dragId === null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (overKey !== key) setOverKey(key);
      },
      onDragLeave: () => setOverKey((k) => (k === key ? null : k)),
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        const id = Number(e.dataTransfer.getData("text/plain"));
        setOverKey(null);
        setDragId(null);
        const found = appointments.find((a) => a.id === id);
        if (!found || calendarDateKey(new Date(found.startsAt)) === key) return;
        onMove(found, day);
      },
    };
  };

  const capBadge = (day: Date, short = false) => {
    const cap = dayCapacity(day, limits, bookedByDay);
    if (!cap) return null;
    // В ячейках месяца пустые дни без бейджа — меньше шума
    if (short && cap.limit > 0 && cap.booked === 0) return null;
    const full = cap.remaining === 0;
    return (
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[11px] font-medium",
          full ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/10 text-emerald-300",
        )}
      >
        {short ? capacityShort(cap) : capacityRemainingLabel(cap)}
      </span>
    );
  };

  const addButton = (day: Date) => (
    <button
      type="button"
      aria-label={`Новая запись на ${day.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`}
      onClick={() => onCreate(day)}
      className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
    >
      <Plus className="h-4 w-4" />
    </button>
  );

  /* ---------- Месяц ---------- */
  if (view === "dayGridMonth") {
    const days = monthGridDays(focusDate);
    return (
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-7 border-b border-white/[0.07]">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
              >
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = calendarDateKey(day);
              const items = byDay.get(key) ?? [];
              const inMonth = day.getMonth() === focusDate.getMonth();
              return (
                <div
                  key={key}
                  {...dropProps(day)}
                  className={cn(
                    "group min-h-[132px] border-b border-r border-white/[0.06] p-1.5",
                    !inMonth && "bg-slate-950/30",
                    overKey === key && "bg-emerald-500/[0.08]",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenDay(day)}
                      className={cn(
                        "rounded px-1 text-sm font-semibold hover:bg-white/10",
                        key === todayKey
                          ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                          : inMonth
                            ? "text-slate-100"
                            : "text-slate-600",
                      )}
                    >
                      {day.getDate()}
                    </button>
                    <div className="flex items-center gap-1">
                      {capBadge(day, true)}
                      <span className="opacity-0 transition-opacity group-hover:opacity-100">
                        {addButton(day)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {items.slice(0, MONTH_CHIPS).map((a) => (
                      <MonthChip key={a.id} a={a} onOpen={onOpen} drag={drag} highlighted={a.id === highlightId} />
                    ))}
                    {items.length > MONTH_CHIPS ? (
                      <button
                        type="button"
                        onClick={() => onOpenDay(day)}
                        className="px-1 text-[11px] font-medium text-emerald-300 hover:text-emerald-200"
                      >
                        ещё {items.length - MONTH_CHIPS}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- День ---------- */
  if (view === "timeGridDay") {
    const items = byDay.get(calendarDateKey(focusDate)) ?? [];
    return (
      <div {...dropProps(focusDate)} className={cn("min-h-[320px]", overKey && "bg-emerald-500/[0.06]")}>
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="font-semibold text-white">
              {items.length} {items.length === 1 ? "запись" : "записей"}
            </span>
            {capBadge(focusDate)}
          </div>
          {addButton(focusDate)}
        </div>
        {items.length === 0 ? (
          <button
            type="button"
            onClick={() => onCreate(focusDate)}
            className="m-4 flex h-32 w-[calc(100%-2rem)] items-center justify-center rounded-lg border border-dashed border-white/15 text-sm text-slate-400 hover:text-emerald-300"
          >
            На этот день записей нет — создать
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((a) => (
              <AppointmentCard key={a.id} a={a} onOpen={onOpen} drag={drag} highlighted={a.id === highlightId} />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ---------- Неделя ---------- */
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[1040px] grid-cols-7">
        {weekDays(focusDate).map((day) => {
          const key = calendarDateKey(day);
          const items = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              {...dropProps(day)}
              className={cn(
                "flex min-h-[340px] flex-col border-r border-white/[0.06] last:border-r-0",
                overKey === key && "bg-emerald-500/[0.08]",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between gap-1 border-b border-white/[0.07] px-2.5 py-2",
                  isToday && "bg-emerald-500/10",
                )}
              >
                <button
                  type="button"
                  onClick={() => onOpenDay(day)}
                  className="flex items-baseline gap-1.5 rounded px-1 hover:bg-white/10"
                >
                  <span className="text-[11px] font-semibold uppercase text-slate-400">
                    {WEEKDAYS[(day.getDay() + 6) % 7]}
                  </span>
                  <span
                    className={cn(
                      "text-lg font-semibold",
                      isToday ? "text-emerald-300" : "text-white",
                    )}
                  >
                    {day.getDate()}
                  </span>
                </button>
                <div className="flex items-center gap-1">
                  {capBadge(day)}
                  {addButton(day)}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2">
                {items.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    a={a}
                    onOpen={onOpen}
                    drag={drag}
                    highlighted={a.id === highlightId}
                  />
                ))}
                {items.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => onCreate(day)}
                    className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-white/10 text-xs text-slate-600 hover:border-white/20 hover:text-slate-400"
                  >
                    нет записей
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
