"use client";

import { Calendar } from "@/shadcn/calendar";
import { cn } from "src/lib/utils";
import {
  calendarDateKey,
  capacityShort,
  dayCapacity,
} from "../../_lib/dayCapacity";

type Props = {
  selected: Date;
  onSelect: (date: Date) => void;
  limits?: Record<string, number>;
  bookedByDay?: Record<string, number>;
  onMonthChange?: (date: Date) => void;
};

export function CrmMiniCalendar({
  selected,
  onSelect,
  limits = {},
  bookedByDay = {},
  onMonthChange,
}: Props) {
  return (
    <div className="crm-mini-cal rounded-xl border border-white/10 bg-slate-900/50 p-2">
      <Calendar
        mode="single"
        selected={selected}
        defaultMonth={selected}
        onSelect={(d) => d && onSelect(d)}
        onMonthChange={onMonthChange}
        className="relative w-full p-0"
        classNames={{
          months: "flex flex-col",
          month: "w-full space-y-3",
          month_caption:
            "flex justify-center items-center h-11 text-slate-200 capitalize",
          caption_label: "text-sm font-medium",
          nav: "flex items-center gap-1",
          button_previous:
            "absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-lg bg-transparent p-0 text-slate-300 hover:bg-white/5",
          button_next:
            "absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-lg bg-transparent p-0 text-slate-300 hover:bg-white/5",
          month_grid: "w-full table-fixed border-collapse",
          weekdays: "",
          weekday: "h-8 text-[0.65rem] font-medium uppercase text-slate-400",
          week: "",
          day: "p-0.5 text-center text-sm",
          selected: "",
          day_button: cn(
            "flex h-11 w-full flex-col items-center justify-center rounded-lg p-0 font-normal text-slate-300",
            "hover:bg-white/10 hover:text-white",
          ),
          today: "font-semibold",
          outside: "text-slate-600 opacity-60",
          disabled: "text-slate-600 opacity-40",
        }}
        components={{
          DayButton: ({ day, modifiers, className, ...props }) => {
            const cap = dayCapacity(day.date, limits, bookedByDay);
            const full = cap != null && cap.remaining === 0;
            return (
              <button
                {...props}
                className={cn(className, modifiers.today && "ring-1 ring-inset ring-emerald-400/40", modifiers.selected && "!bg-emerald-400 !text-slate-950 font-semibold")}
                title={
                  cap
                    ? `Занято ${cap.booked} из ${cap.limit}`
                    : calendarDateKey(day.date)
                }
              >
                <span>{day.date.getDate()}</span>
                {cap && !modifiers.outside ? (
                  <span
                    className={cn(
                      "text-[9px] font-semibold leading-none",
                      modifiers.selected
                        ? "text-slate-700"
                        : full
                          ? "text-amber-400"
                          : "text-emerald-400",
                    )}
                  >
                    {capacityShort(cap)}
                  </span>
                ) : (
                  <span className="h-2.5" />
                )}
              </button>
            );
          },
        }}
      />
    </div>
  );
}
