"use client";

import type { CrmAppointment } from "../../_lib/crmTypes";
import { formatAppointmentCar } from "../../_lib/formatCar";
import { formatPhoneRuDisplaySafe } from "@/lib/phoneRu";
import { COMPLETED_EVENT_COLOR, getEventColor } from "./calendarColors";
import { cn } from "src/lib/utils";
import { Plus } from "lucide-react";
import type { DayCapacity } from "../../_lib/dayCapacity";

type Props = {
  date: Date;
  appointments: CrmAppointment[];
  onOpen: (appointment: CrmAppointment) => void;
  onCreate: () => void;
  className?: string;
  /** Крупные карточки без ограничения высоты — для мобильной agenda. */
  variant?: "sidebar" | "agenda";
  capacity?: DayCapacity | null;
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clientLabel(a: CrmAppointment): string {
  const fio = [a.client.lastName, a.client.firstName].filter(Boolean).join(" ");
  if (fio) return fio;
  return formatPhoneRuDisplaySafe(a.client.phone);
}

export function DayAppointmentsList({
  date,
  appointments,
  onOpen,
  onCreate,
  className,
  variant = "sidebar",
  capacity = null,
}: Props) {
  const isAgenda = variant === "agenda";
  const dateLabel = date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });

  const sorted = [...appointments].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <h3
          className={cn(
            "font-semibold text-white",
            isAgenda ? "text-base" : "text-sm",
          )}
        >
          {isAgenda ? "Записи" : `Записи на ${dateLabel}`}
          {isAgenda ? (
            <span className="ml-2 text-sm font-normal text-slate-400">
              {dateLabel}
            </span>
          ) : null}
        </h3>
        <span className="text-xs text-slate-500">{sorted.length}</span>
      </div>
      {capacity ? (
        <p
          className={cn(
            "text-xs",
            capacity.remaining === 0 ? "text-amber-300" : "text-emerald-300",
          )}
        >
          {capacity.limit === 0
            ? "День закрыт (лимит 0)"
            : capacity.remaining === 0
              ? `Мест нет: уже ${capacity.booked} из ${capacity.limit}`
              : `Можно записать ещё ${capacity.remaining} (занято ${capacity.booked} из ${capacity.limit})`}
        </p>
      ) : null}

      {sorted.length === 0 ? (
        <div
          className={cn(
            "rounded-xl border border-dashed border-white/15 bg-slate-900/40 text-center",
            isAgenda ? "px-4 py-10" : "px-3 py-4",
          )}
        >
          <p className={cn("text-slate-400", isAgenda ? "text-base" : "text-sm")}>
            На этот день записей нет
          </p>
          <button
            type="button"
            onClick={onCreate}
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 font-medium text-emerald-400 hover:text-emerald-300",
              isAgenda ? "text-base" : "text-sm",
            )}
          >
            <Plus className="h-4 w-4" />
            Создать запись
          </button>
        </div>
      ) : (
        <ul
          className={cn(
            "space-y-2",
            !isAgenda && "max-h-56 overflow-y-auto overscroll-contain pr-0.5",
          )}
        >
          {sorted.map((a) => {
            const done = Boolean(a.completedAt);
            const color = done
              ? COMPLETED_EVENT_COLOR
              : getEventColor(a.serviceTypeId ?? a.id);
            const carLabel = formatAppointmentCar(a);
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onOpen(a)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border border-white/10 bg-slate-900/60 text-left transition-colors active:bg-slate-800/90 hover:border-white/20 hover:bg-slate-800/80",
                    isAgenda ? "px-3.5 py-3.5" : "px-2.5 py-2",
                    done && "opacity-70",
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 rounded-full",
                      isAgenda ? "mt-0.5 h-12 w-1.5" : "mt-1 h-8 w-1",
                    )}
                    style={{ backgroundColor: color.bg }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block font-semibold text-emerald-300/95",
                        isAgenda ? "text-sm" : "text-xs font-medium",
                      )}
                    >
                      {formatTime(a.startsAt)}–{formatTime(a.endsAt)}
                      {done ? (
                        <span className="ml-2 rounded-full bg-teal-500/20 px-1.5 py-0.5 text-[11px] font-medium text-teal-300">
                          ✓ Выполнено
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        "mt-1 block truncate font-medium text-white",
                        isAgenda ? "text-base" : "text-sm",
                      )}
                    >
                      {clientLabel(a)}
                    </span>
                    {a.masterComment && (
                      <span className="mt-1 block truncate text-xs text-slate-300" title={a.masterComment}>
                        {a.masterComment}
                      </span>
                    )}
                    {carLabel ? (
                      <span
                        className={cn(
                          "mt-0.5 block truncate text-slate-300",
                          isAgenda ? "text-sm" : "text-xs",
                        )}
                      >
                        {carLabel}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "mt-0.5 block truncate text-slate-400",
                        isAgenda ? "text-sm" : "text-xs",
                      )}
                    >
                      {a.serviceType}
                      {a.managerName ? ` · ${a.managerName}` : ""}
                    </span>
                    {isAgenda ? (
                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {formatPhoneRuDisplaySafe(a.client.phone)}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
