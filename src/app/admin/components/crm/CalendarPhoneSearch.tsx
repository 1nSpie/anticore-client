"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "src/lib/utils";
import { formatPhoneRuDisplaySafe } from "@/lib/phoneRu";
import { adminApi } from "../../_lib/api";
import { CRM_LOCATION_LABELS } from "../../_lib/crmLocations";
import type { CrmAppointment } from "../../_lib/crmTypes";
import { formatAppointmentCar } from "../../_lib/formatCar";

type Props = {
  onPick: (appointment: CrmAppointment) => void;
  className?: string;
};

const MIN_DIGITS = 3;

function clientName(a: CrmAppointment): string {
  const fio = [a.client.lastName, a.client.firstName].filter(Boolean).join(" ");
  return fio || "Без имени";
}

/** Поиск записей календаря по номеру клиента — по всем датам и филиалам. */
export function CalendarPhoneSearch({ onPick, className }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CrmAppointment[] | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);

  const digits = query.replace(/\D/g, "");
  const ready = digits.length >= MIN_DIGITS;

  useEffect(() => {
    if (!ready) {
      setResults(null);
      setLoading(false);
      return;
    }
    const request = ++requestRef.current;
    setLoading(true);
    const t = window.setTimeout(async () => {
      try {
        const { data } = await adminApi.get<CrmAppointment[]>(
          "/crm/appointments/search",
          { params: { q: digits } },
        );
        if (request === requestRef.current) setResults(data);
      } catch {
        if (request === requestRef.current) setResults([]);
      } finally {
        if (request === requestRef.current) setLoading(false);
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [digits, ready]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const showPanel = open && query.length > 0;

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        type="search"
        inputMode="tel"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Поиск записи по телефону"
        aria-label="Поиск записи по телефону клиента"
        className="h-10 w-full rounded-lg border border-white/10 bg-[#182232] pl-9 pr-9 text-sm [&::-webkit-search-cancel-button]:hidden text-slate-100 placeholder:text-slate-500 focus:border-emerald-400/50 focus:outline-none"
      />
      {query ? (
        <button
          type="button"
          aria-label="Очистить поиск"
          onClick={() => {
            setQuery("");
            setResults(null);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}

      {showPanel ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-[60vh] min-w-[300px] overflow-y-auto rounded-xl border border-white/10 bg-[#111a27] p-1 shadow-xl sm:min-w-[360px]">
          {!ready ? (
            <p className="px-3 py-3 text-sm text-slate-400">
              Введите минимум {MIN_DIGITS} цифры номера
            </p>
          ) : loading && results === null ? (
            <p className="px-3 py-3 text-sm text-slate-400">Ищем…</p>
          ) : results && results.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-400">
              Записей с таким номером нет
            </p>
          ) : (
            <ul>
              {(results ?? []).map((a) => {
                const start = new Date(a.startsAt);
                const car = formatAppointmentCar(a);
                const past = start.getTime() < Date.now();
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onPick(a);
                      }}
                      className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left hover:bg-white/[0.06]"
                    >
                      <span
                        className={cn(
                          "w-24 shrink-0 text-xs font-semibold tabular-nums",
                          past ? "text-slate-500" : "text-emerald-300",
                        )}
                      >
                        {start.toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                        })}
                        <br />
                        <span className="font-medium">
                          {start.toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-white">
                          {clientName(a)}
                          {a.completedAt ? (
                            <span className="ml-1.5 text-xs text-teal-300">✓</span>
                          ) : null}
                        </span>
                        <span className="block truncate text-xs text-slate-300">
                          {formatPhoneRuDisplaySafe(a.client.phone)}
                          {car ? ` · ${car}` : ""}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {CRM_LOCATION_LABELS[a.location]} · {a.serviceType}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
