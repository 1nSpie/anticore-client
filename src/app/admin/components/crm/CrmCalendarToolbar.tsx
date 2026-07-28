"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/shadcn/button";
import { cn } from "src/lib/utils";

export type CalendarViewType = "timeGridDay" | "timeGridWeek" | "dayGridMonth";

const VIEWS: { id: CalendarViewType; label: string }[] = [
  { id: "timeGridDay", label: "День" },
  { id: "timeGridWeek", label: "Неделя" },
  { id: "dayGridMonth", label: "Месяц" },
];

type Props = {
  title: string;
  view: CalendarViewType;
  /** Мобильная agenda: без переключателя День/Неделя/Месяц и без подсказки про drag. */
  mobile?: boolean;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onViewChange: (view: CalendarViewType) => void;
  onCreate: () => void;
  onPickDate?: () => void;
};

export function CrmCalendarToolbar({
  title,
  view,
  mobile = false,
  onToday,
  onPrev,
  onNext,
  onViewChange,
  onCreate,
  onPickDate,
}: Props) {
  return (
    <div className="border-b border-white/10">
      <div
        className={cn(
          "flex gap-3 px-3 py-3",
          mobile ? "flex-col" : "flex-col sm:flex-row sm:flex-wrap sm:items-center sm:px-4",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="bg-emerald-500 font-semibold text-slate-950 hover:bg-emerald-400"
            onClick={onCreate}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Новая запись
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/15 bg-transparent text-slate-200 hover:bg-white/5"
            onClick={onToday}
          >
            Сегодня
          </Button>

          <div className="flex items-center rounded-lg border border-white/10 bg-slate-900/60">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-300 hover:bg-white/5 hover:text-white"
              onClick={onPrev}
              aria-label="Назад"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-300 hover:bg-white/5 hover:text-white"
              onClick={onNext}
              aria-label="Вперёд"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {mobile && onPickDate ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto border-white/15 bg-transparent text-slate-200 hover:bg-white/5"
              onClick={onPickDate}
            >
              <CalendarDays className="mr-1.5 h-4 w-4" />
              Календарь
            </Button>
          ) : null}
        </div>

        <h2
          className={cn(
            "min-w-0 font-semibold tracking-tight text-white capitalize",
            mobile ? "text-lg" : "flex-1 text-lg sm:text-xl",
          )}
        >
          {title}
        </h2>

        {!mobile ? (
          <div className="flex w-full rounded-lg border border-white/10 bg-slate-900/80 p-0.5 sm:w-auto">
            {VIEWS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => onViewChange(id)}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none",
                  view === id
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {!mobile ? (
        <p className="border-t border-white/5 px-3 py-2 text-xs text-slate-400 sm:px-4">
          Клик по пустому времени — новая запись · клик по карточке — открыть ·
          перетащите карточку, чтобы перенести
        </p>
      ) : (
        <p className="border-t border-white/5 px-3 py-2 text-xs text-slate-400">
          Выберите день и откройте запись из списка
        </p>
      )}
    </div>
  );
}
