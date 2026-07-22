"use client";

import { cn } from "src/lib/utils";

type Props = {
  selected: Date;
  onSelect: (date: Date) => void;
  /** Даты, на которых есть хотя бы одна запись (локальный календарный день). */
  markedDates?: Set<string>;
};

function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}

/** Горизонтальная полоска дней текущей недели (Пн–Вс). */
export function WeekDayStrip({ selected, onSelect, markedDates }: Props) {
  const weekStart = startOfWeekMonday(selected);
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  return (
    <div
      className="grid grid-cols-7 gap-1"
      role="listbox"
      aria-label="Дни недели"
    >
      {days.map((d) => {
        const selectedDay = isSameDay(d, selected);
        const isToday = isSameDay(d, today);
        const hasEvents = markedDates?.has(dayKey(d)) ?? false;
        const weekday = d
          .toLocaleDateString("ru-RU", { weekday: "short" })
          .replace(".", "");

        return (
          <button
            key={dayKey(d)}
            type="button"
            role="option"
            aria-selected={selectedDay}
            onClick={() => onSelect(d)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-1 py-2 transition-colors",
              selectedDay
                ? "bg-emerald-500/20 text-emerald-100"
                : "text-slate-300 active:bg-white/10",
            )}
          >
            <span
              className={cn(
                "text-[0.65rem] font-semibold uppercase tracking-wide",
                selectedDay ? "text-emerald-300" : "text-slate-500",
              )}
            >
              {weekday}
            </span>
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold",
                selectedDay && "bg-emerald-400 text-slate-950",
                !selectedDay && isToday && "ring-1 ring-emerald-400/70",
                !selectedDay && !isToday && "text-white",
              )}
            >
              {d.getDate()}
            </span>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                hasEvents
                  ? selectedDay
                    ? "bg-emerald-200"
                    : "bg-emerald-400"
                  : "bg-transparent",
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}

export { dayKey as calendarDayKey, startOfWeekMonday };
