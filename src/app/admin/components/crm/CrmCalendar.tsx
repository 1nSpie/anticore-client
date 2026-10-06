"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { adminApi } from "../../_lib/api";
import type { CrmAppointment, ServiceType } from "../../_lib/crmTypes";
import {
  DEFAULT_CRM_LOCATION,
  type CrmLocationCode,
} from "../../_lib/crmLocations";
import { AppointmentDialog } from "./AppointmentDialog";
import { AppointmentBoard } from "./AppointmentBoard";
import { CrmCalendarToolbar, type CalendarViewType } from "./CrmCalendarToolbar";
import { CrmMiniCalendar } from "./CrmMiniCalendar";
import { DayAppointmentsList } from "./DayAppointmentsList";
import { WeekDayStrip, calendarDayKey } from "./WeekDayStrip";
import { getEventColor } from "./calendarColors";
import { Button } from "@/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shadcn/sheet";
import { toast } from "sonner";
import "./crm-calendar.css";
import {
  addDays,
  addMonths,
  loadRange,
  moveToDay,
  startOfWeekMonday,
} from "../../_lib/calendarRange";
import {
  bookedByDateMap,
  dayCapacity,
  monthsOverlapping,
} from "../../_lib/dayCapacity";

const MOBILE_MQ = "(max-width: 1023px)";

function sameDay(a: Date, b: Date): boolean {
  return calendarDayKey(a) === calendarDayKey(b);
}

function formatCalendarTitle(date: Date, view: CalendarViewType): string {
  if (view === "timeGridDay") {
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  if (view === "dayGridMonth") {
    const label = date.toLocaleDateString("ru-RU", {
      month: "long",
      year: "numeric",
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  const start = startOfWeekMonday(date);
  const end = addDays(start, 6);

  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${start.toLocaleDateString("ru-RU", {
      month: "long",
      year: "numeric",
    })}`;
  }
  const startLabel = start.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
  const endLabel = end.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

function defaultCreateSlot(forDate?: Date): { start: string; end: string } {
  const start = forDate ? new Date(forDate) : new Date();
  if (forDate) {
    start.setHours(10, 0, 0, 0);
  } else {
    start.setMinutes(0, 0, 0);
    if (start.getHours() >= 20) {
      start.setDate(start.getDate() + 1);
      start.setHours(9, 0, 0, 0);
    } else {
      start.setHours(start.getHours() + 1);
    }
  }
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

function ServiceLegend({ serviceTypes }: { serviceTypes: ServiceType[] }) {
  if (serviceTypes.length === 0) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Услуги
      </h3>
      <ul className="space-y-1.5">
        {serviceTypes.slice(0, 8).map((t) => {
          const color = getEventColor(t.id);
          return (
            <li key={t.id} className="flex items-center gap-2 text-xs text-slate-300">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: color.border }}
                aria-hidden
              />
              <span className="truncate">{t.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CrmCalendar() {
  const [allEvents, setAllEvents] = useState<CrmAppointment[]>([]);
  const [dayLimits, setDayLimits] = useState<Record<string, number>>({});
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CrmAppointment | null>(null);
  const [slot, setSlot] = useState<{ start: string; end: string } | null>(null);
  const [view, setView] = useState<CalendarViewType>("timeGridWeek");
  const [focusDate, setFocusDate] = useState(() => new Date());
  const [location, setLocation] = useState<CrmLocationCode>(DEFAULT_CRM_LOCATION);
  const [layout, setLayout] = useState<"unknown" | "mobile" | "desktop">(
    "unknown",
  );
  const [mobileCalOpen, setMobileCalOpen] = useState(false);
  /** Запись, найденная по телефону: подсвечиваем и прокручиваем к ней. */
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const rangeRef = useRef<{ from: string; to: string } | null>(null);
  const locationRef = useRef(location);
  locationRef.current = location;

  const events = useMemo(
    () => allEvents.filter((e) => e.location === location),
    [allEvents, location],
  );

  const isMobile = layout === "mobile";
  const isDesktop = layout === "desktop";

  const title = useMemo(
    () => formatCalendarTitle(focusDate, isMobile ? "timeGridDay" : view),
    [focusDate, view, isMobile],
  );

  const dayAppointments = useMemo(
    () => events.filter((e) => sameDay(new Date(e.startsAt), focusDate)),
    [events, focusDate],
  );

  const markedDates = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) {
      set.add(calendarDayKey(new Date(e.startsAt)));
    }
    return set;
  }, [events]);

  const bookedByDay = useMemo(() => bookedByDateMap(events), [events]);

  const focusCapacity = useMemo(
    () => dayCapacity(focusDate, dayLimits, bookedByDay),
    [focusDate, dayLimits, bookedByDay],
  );

  const loadLimits = useCallback(
    async (from: string, to: string, loc: CrmLocationCode = location) => {
      const months = monthsOverlapping(from, to);
      const rows = await Promise.all(
        months.map(({ year, month }) =>
          adminApi.get<Array<{ date: string; maxAppointments: number }>>(
            "/crm/settings/day-limits",
            { params: { year, month, location: loc } },
          ),
        ),
      );
      // Пока грузили, филиал могли сменить — ответ чужого филиала не подмешиваем
      if (loc !== locationRef.current) return;
      const map: Record<string, number> = {};
      for (const { data } of rows) {
        for (const row of data) {
          map[row.date] = row.maxAppointments;
        }
      }
      setDayLimits((prev) => ({ ...prev, ...map }));
    },
    [location],
  );

  const loadEvents = useCallback(
    async (from?: string, to?: string) => {
      const { data } = await adminApi.get<CrmAppointment[]>(
        "/crm/appointments",
        { params: { from, to } },
      );
      setAllEvents(data);
      if (from && to) {
        void loadLimits(from, to);
      }
    },
    [loadLimits],
  );

  const loadMeta = useCallback(async () => {
    const { data } = await adminApi.get<ServiceType[]>(
      "/crm/settings/service-types",
    );
    setServiceTypes(data.filter((t) => t.active));
  }, []);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const apply = () => setLayout(mq.matches ? "mobile" : "desktop");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /** Какой период нужен: месяц (десктоп) — вся сетка, иначе неделя вокруг выбранного дня. */
  const range = useMemo(
    () => loadRange(isMobile ? "timeGridWeek" : view, focusDate),
    [isMobile, view, focusDate],
  );

  useEffect(() => {
    if (layout === "unknown") return;
    rangeRef.current = { from: range.from, to: range.to };
    void loadEvents(range.from, range.to);
  }, [layout, range.from, range.to, loadEvents]);

  useEffect(() => {
    if (!rangeRef.current) return;
    setDayLimits({});
    void loadLimits(rangeRef.current.from, rangeRef.current.to, location);
  }, [location, loadLimits]);

  const openAppointment = useCallback((found: CrmAppointment) => {
    setEditing(found);
    setSlot(null);
    setDialogOpen(true);
  }, []);

  const openCreateForDate = useCallback((date: Date) => {
    setEditing(null);
    setSlot(defaultCreateSlot(date));
    setDialogOpen(true);
  }, []);

  /** Перетащили карточку на другой день: время и длительность те же. */
  const handleMove = useCallback(
    async (appointment: CrmAppointment, targetDay: Date) => {
      const { start, end } = moveToDay(
        appointment.startsAt,
        appointment.endsAt,
        targetDay,
      );
      try {
        await adminApi.patch(`/crm/appointments/${appointment.id}`, {
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
        });
        toast.success(
          `Запись перенесена на ${targetDay.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`,
        );
        if (rangeRef.current) {
          await loadEvents(rangeRef.current.from, rangeRef.current.to);
        }
      } catch (e: unknown) {
        const msg = (
          e as { response?: { data?: { message?: string | string[] } } }
        )?.response?.data?.message;
        toast.error(
          (Array.isArray(msg) ? msg.join(", ") : msg) ||
            "Не удалось перенести запись",
        );
      }
    },
    [loadEvents],
  );

  const goToDate = useCallback((date: Date) => setFocusDate(date), []);

  const handleToday = useCallback(() => goToDate(new Date()), [goToDate]);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (isMobile || view === "timeGridDay") {
        goToDate(addDays(focusDate, dir));
      } else if (view === "timeGridWeek") {
        goToDate(addDays(focusDate, 7 * dir));
      } else {
        goToDate(addMonths(focusDate, dir));
      }
    },
    [focusDate, goToDate, isMobile, view],
  );

  /** Из доски: открыть день целиком (клик по дате, «ещё N»). */
  const handleOpenDay = useCallback(
    (date: Date) => {
      setView("timeGridDay");
      goToDate(date);
    },
    [goToDate],
  );

  /** Результат поиска по телефону: переходим к дню записи (и к её филиалу) и подсвечиваем карточку. */
  const handleSearchPick = useCallback(
    (found: CrmAppointment) => {
      setLocation(found.location);
      goToDate(new Date(found.startsAt));
      setHighlightId(found.id);
    },
    [goToDate],
  );

  useEffect(() => {
    if (highlightId === null) return;
    const t = window.setTimeout(() => setHighlightId(null), 6000);
    return () => window.clearTimeout(t);
  }, [highlightId]);

  const handleCreate = useCallback(
    () => openCreateForDate(focusDate),
    [focusDate, openCreateForDate],
  );

  const handleSaved = useCallback(async () => {
    await loadEvents(range.from, range.to);
    await loadMeta();
  }, [loadEvents, loadMeta, range.from, range.to]);

  if (layout === "unknown") {
    return (
      <div className="crm-calendar min-h-[50vh] animate-pulse rounded-xl border border-white/10 bg-[#111a27]" />
    );
  }

  return (
    <>
      <div className="crm-calendar overflow-hidden rounded-xl border border-white/10 bg-[#111a27] shadow-none">
        <CrmCalendarToolbar
          title={title}
          view={view}
          location={location}
          onLocationChange={setLocation}
          mobile={isMobile}
          onToday={handleToday}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          onViewChange={setView}
          onCreate={handleCreate}
          onPickDate={() => setMobileCalOpen(true)}
          onPickAppointment={handleSearchPick}
        />

        {isMobile ? (
          <div className="space-y-4 px-3 py-4">
            <WeekDayStrip
              selected={focusDate}
              onSelect={goToDate}
              markedDates={markedDates}
              limits={dayLimits}
              bookedByDay={bookedByDay}
            />
            <DayAppointmentsList
              date={focusDate}
              appointments={dayAppointments}
              onOpen={openAppointment}
              onCreate={handleCreate}
              variant="agenda"
              capacity={focusCapacity}
            />
          </div>
        ) : null}

        {isDesktop ? (
          <AppointmentBoard
            view={view}
            focusDate={focusDate}
            appointments={events}
            limits={dayLimits}
            bookedByDay={bookedByDay}
            onOpen={openAppointment}
            onCreate={openCreateForDate}
            onOpenDay={handleOpenDay}
            onMove={handleMove}
            highlightId={highlightId}
          />
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-5 py-3 text-xs text-slate-500">
          <span>
            {isMobile
              ? "Выберите запись, чтобы посмотреть подробности"
              : "Карточки идут по времени начала · Перетащите карточку на другой день для переноса · «+» в шапке дня — новая запись"}
          </span>
        </div>
      </div>

      <Sheet open={mobileCalOpen} onOpenChange={setMobileCalOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          aria-describedby={undefined}
          className="max-h-[90dvh] overflow-y-auto border-white/10 bg-[#111a27] text-white sm:max-w-md lg:max-h-none"
        >
          <SheetHeader>
            <SheetTitle className="text-white">Обзор дня</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-2">
            <CrmMiniCalendar
              selected={focusDate}
              onSelect={(date) => {
                goToDate(date);
                if (isMobile) setMobileCalOpen(false);
              }}
              limits={dayLimits}
              bookedByDay={bookedByDay}
            />
            {!isMobile && (
              <div className="space-y-6 px-4 pt-5">
                <DayAppointmentsList
                  date={focusDate}
                  appointments={dayAppointments}
                  onOpen={(appointment) => {
                    setMobileCalOpen(false);
                    openAppointment(appointment);
                  }}
                  onCreate={() => {
                    setMobileCalOpen(false);
                    handleCreate();
                  }}
                  capacity={focusCapacity}
                />
                <ServiceLegend serviceTypes={serviceTypes} />
              </div>
            )}
          </div>
          <SheetFooter>
            <Button
              type="button"
              className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              onClick={() => setMobileCalOpen(false)}
            >
              Готово
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={editing}
        slot={slot}
        serviceTypes={serviceTypes}
        defaultLocation={location}
        onSaved={handleSaved}
      />
    </>
  );
}
