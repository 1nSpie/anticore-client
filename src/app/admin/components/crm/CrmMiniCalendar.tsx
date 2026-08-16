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
        onSelect={(d) => d && onSelect(d)}
        onMonthChange={onMonthChange}
        className="p-0"
        classNames={{
          months: "flex flex-col",
          month: "gap-3",
          month_caption:
            "flex justify-center relative items-center h-8 text-slate-200 capitalize",
          caption_label: "text-sm font-medium",
          nav: "flex items-center gap-1",
          button_previous:
            "absolute left-0 h-7 w-7 rounded-md border border-white/10 bg-transparent p-0 text-slate-300 hover:bg-white/5",
          button_next:
            "absolute right-0 h-7 w-7 rounded-md border border-white/10 bg-transparent p-0 text-slate-300 hover:bg-white/5",
          weekdays: "flex",
          weekday: "w-9 text-[0.65rem] font-medium uppercase text-slate-500",
          week: "mt-1 flex w-full",
          day: "p-0 text-center text-sm",
          day_button: cn(
            "flex h-11 w-9 flex-col items-center justify-center rounded-md p-0 font-normal text-slate-300",
            "hover:bg-white/10 hover:text-white",
            "aria-selected:bg-[#8ab4f8] aria-selected:text-[#202124] aria-selected:hover:bg-[#8ab4f8]",
          ),
          today: "bg-white/10 text-white font-semibold",
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
                className={className}
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
