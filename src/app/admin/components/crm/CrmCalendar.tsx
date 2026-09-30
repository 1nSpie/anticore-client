"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
} from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import ruLocale from "@fullcalendar/core/locales/ru";
import { adminApi } from "../../_lib/api";
import type { CrmAppointment, ServiceType } from "../../_lib/crmTypes";
import {
  DEFAULT_CRM_LOCATION,
  type CrmLocationCode,
} from "../../_lib/crmLocations";
import { AppointmentDialog } from "./AppointmentDialog";
import { CrmCalendarToolbar, type CalendarViewType } from "./CrmCalendarToolbar";
import { CrmMiniCalendar } from "./CrmMiniCalendar";
import { DayAppointmentsList } from "./DayAppointmentsList";
import {
  WeekDayStrip,
  calendarDayKey,
  startOfWeekMonday,
} from "./WeekDayStrip";
import { COMPLETED_EVENT_COLOR, getEventColor } from "./calendarColors";
import { Button } from "@/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shadcn/sheet";
import { formatPhoneRuDisplaySafe } from "@/lib/phoneRu";
import { formatAppointmentCar } from "../../_lib/formatCar";
import { toast } from "sonner";
import "./crm-calendar.css";
import {
  bookedByDateMap,
  capacityRemainingLabel,
  capacityShort,
  dayCapacity,
  monthsOverlapping,
  type DayCapacity,
} from "../../_lib/dayCapacity";

function scrollTimeNow(): string {
  const d = new Date();
  const h = Math.max(0, d.getHours() - 1);
  return `${String(h).padStart(2, "0")}:00:00`;
}

const FC_PLUGINS = [dayGridPlugin, timeGridPlugin, interactionPlugin];
const FC_LOCALES = [ruLocale];
const FC_SLOT_LABEL_FORMAT = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
} as const;
const FC_SCROLL_TIME = scrollTimeNow();
const MOBILE_MQ = "(max-width: 1023px)";

function formatEventTime(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return `${fmt(start)}–${fmt(end)}`;
}

function sameDay(a: Date, b: Date): boolean {
  return calendarDayKey(a) === calendarDayKey(b);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
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

function weekRangeIso(focus: Date): { from: string; to: string } {
  const start = startOfWeekMonday(focus);
  start.setHours(0, 0, 0, 0);
  const end = addDays(start, 7);
  return { from: start.toISOString(), to: end.toISOString() };
}

function renderDayHeader(
  arg: { date: Date; isToday: boolean },
  cap: DayCapacity | null,
) {
  const weekday = arg.date
    .toLocaleDateString("ru-RU", { weekday: "short" })
    .replace(".", "")
    .toUpperCase();
  const dayNum = arg.date.getDate();
  const full = cap != null && cap.remaining === 0;

  return (
    <div className="crm-fc-day-header">
      <span className="crm-fc-day-header-weekday">{weekday}</span>
      <span
        className={`crm-fc-day-header-num${arg.isToday ? " is-today" : ""}`}
      >
        {dayNum}
      </span>
      {cap ? (
        <span
          className={`crm-fc-day-header-cap${full ? " is-full" : " is-open"}`}
        >
          {capacityRemainingLabel(cap)}
        </span>
      ) : null}
    </div>
  );
}

function renderEventContent(arg: EventContentArg) {
  const masterComment = arg.event.extendedProps.masterComment as string | undefined;
  const serviceType = arg.event.extendedProps.serviceType as string | undefined;
  const managerName = arg.event.extendedProps.managerName as
    | string
    | undefined
    | null;
  const phone = arg.event.extendedProps.phone as string | undefined;
  const carLabel = arg.event.extendedProps.carLabel as string | undefined;
  const isMonth = arg.view.type === "dayGridMonth";
  const isDay = arg.view.type === "timeGridDay";
  const start = arg.event.start;
  const end = arg.event.end;
  const durationMs =
    start && end ? end.getTime() - start.getTime() : Number.POSITIVE_INFINITY;
  const isShort = durationMs < 45 * 60 * 1000;
  const timeLabel = start && end ? formatEventTime(start, end) : "";

  if (isMonth) {
    return (
      <div className="crm-fc-event crm-fc-event--month">
        <div className="crm-fc-event-month-heading">
        <span className="crm-fc-event-time">{timeLabel}</span>
        <span className="crm-fc-event-title">{arg.event.title}</span>
        {carLabel ? (
          <span className="crm-fc-event-car"> · {carLabel}</span>
        ) : null}
        </div>
        {masterComment && <div className="crm-fc-event-comment" title={masterComment}>{masterComment}</div>}
      </div>
    );
  }

  return (
    <div className={`crm-fc-event${isShort ? " crm-fc-event--short" : ""}`}>
      <div className="crm-fc-event-heading">
      {timeLabel && <div className="crm-fc-event-time">{timeLabel}</div>}
      <div className="crm-fc-event-title">{arg.event.title}</div>
      </div>
      {masterComment && <div className="crm-fc-event-comment" title={masterComment}>{masterComment}</div>}
      {carLabel && (
        <div className="crm-fc-event-sub crm-fc-event-car">{carLabel}</div>
      )}
      {!isShort && serviceType && (
        <div className="crm-fc-event-sub">{serviceType}</div>
      )}
      {isDay && !isShort && phone && (
        <div className="crm-fc-event-sub">{formatPhoneRuDisplaySafe(phone)}</div>
      )}
      {(isDay || !isShort) && managerName && (
        <div className="crm-fc-event-sub">Менеджер: {managerName}</div>
      )}
    </div>
  );
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
  const calendarRef = useRef<FullCalendar>(null);
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
  const rangeRef = useRef<{ from: string; to: string } | null>(null);
  const events = useMemo(
    () => allEvents.filter((e) => e.location === location),
    [allEvents, location],
  );
  const eventsRef = useRef<CrmAppointment[]>([]);
  eventsRef.current = events;

  const isMobile = layout === "mobile";
  const isDesktop = layout === "desktop";

  const title = useMemo(
    () =>
      formatCalendarTitle(
        focusDate,
        isMobile ? "timeGridDay" : view,
      ),
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

  const loadEvents = useCallback(async (from?: string, to?: string) => {
    const { data } = await adminApi.get<CrmAppointment[]>(
      "/crm/appointments",
      { params: { from, to } },
    );
    setAllEvents(data);
    if (from && to) {
      void loadLimits(from, to);
    }
  }, [loadLimits]);

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
    const apply = () => {
      setLayout(mq.matches ? "mobile" : "desktop");
      if (mq.matches) {
        setView("timeGridDay");
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /** Мобильная agenda: грузим неделю вокруг выбранного дня (FullCalendar скрыт). */
  useEffect(() => {
    if (!isMobile) return;
    const next = weekRangeIso(focusDate);
    rangeRef.current = next;
    void loadEvents(next.from, next.to);
  }, [isMobile, focusDate, loadEvents]);

  useEffect(() => {
    if (!rangeRef.current) return;
    setDayLimits({});
    void loadLimits(rangeRef.current.from, rangeRef.current.to, location);
  }, [location, loadLimits]);

  const api = () => calendarRef.current?.getApi();

  const onDatesSet = useCallback(
    (arg: DatesSetArg) => {
      if (window.matchMedia(MOBILE_MQ).matches) return;

      const nextRange = { from: arg.startStr, to: arg.endStr };
      const rangeChanged =
        !rangeRef.current ||
        rangeRef.current.from !== nextRange.from ||
        rangeRef.current.to !== nextRange.to;
      rangeRef.current = nextRange;

      const nextView = arg.view.type as CalendarViewType;
      setView((prev) => (prev === nextView ? prev : nextView));

      setFocusDate((prev) => {
        if (prev >= arg.view.currentStart && prev < arg.view.currentEnd) return prev;
        const today = new Date();
        return today >= arg.view.currentStart && today < arg.view.currentEnd
          ? today
          : arg.view.currentStart;
      });

      if (rangeChanged) {
        void loadEvents(nextRange.from, nextRange.to);
      }
    },
    [loadEvents],
  );

  const openCreate = useCallback((start: Date, end: Date) => {
    setEditing(null);
    setSlot({ start: start.toISOString(), end: end.toISOString() });
    setDialogOpen(true);
  }, []);

  const onSelect = useCallback(
    (info: DateSelectArg) => {
      openCreate(info.start, info.end);
      info.view.calendar.unselect();
    },
    [openCreate],
  );

  const openAppointment = useCallback((found: CrmAppointment) => {
    setEditing(found);
    setSlot(null);
    setDialogOpen(true);
  }, []);

  const onEventClick = useCallback(
    (info: EventClickArg) => {
      const id = Number(info.event.id);
      const found = eventsRef.current.find((e) => e.id === id);
      if (found) openAppointment(found);
    },
    [openAppointment],
  );

  const patchAppointmentTime = useCallback(
    async (id: number, start: Date, end: Date, revert: () => void) => {
      try {
        await adminApi.patch(`/crm/appointments/${id}`, {
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
        });
        toast.success("Запись обновлена");
        if (rangeRef.current) {
          await loadEvents(rangeRef.current.from, rangeRef.current.to);
        }
      } catch {
        revert();
        toast.error("Не удалось изменить запись");
      }
    },
    [loadEvents],
  );

  const onEventDrop = useCallback(
    async (info: EventDropArg) => {
      const id = Number(info.event.id);
      const start = info.event.start!;
      const end = info.event.end ?? new Date(start.getTime() + 3600000);
      await patchAppointmentTime(id, start, end, () => info.revert());
    },
    [patchAppointmentTime],
  );

  const onEventResize = useCallback(
    async (info: EventResizeDoneArg) => {
      const id = Number(info.event.id);
      const start = info.event.start!;
      const end = info.event.end!;
      await patchAppointmentTime(id, start, end, () => info.revert());
    },
    [patchAppointmentTime],
  );

  const calendarEvents = useMemo(
    () =>
      events.map((e) => {
        const clientName =
          [e.client.lastName, e.client.firstName].filter(Boolean).join(" ") ||
          formatPhoneRuDisplaySafe(e.client.phone);
        const carLabel = formatAppointmentCar(e);
        const done = Boolean(e.completedAt);
        const color = done
          ? COMPLETED_EVENT_COLOR
          : getEventColor(e.serviceTypeId ?? e.id);
        return {
          id: String(e.id),
          title: done ? `✓ ${clientName}` : clientName,
          start: e.startsAt,
          end: e.endsAt,
          backgroundColor: color.bg,
          borderColor: color.border,
          textColor: color.text,
          classNames: done ? ["crm-fc-event--done"] : [],
          extendedProps: {
            serviceType: e.serviceType,
            managerName: e.managerName,
            masterComment: e.masterComment,
            phone: e.client.phone,
            carLabel: carLabel || undefined,
          },
        };
      }),
    [events],
  );

  const goToDate = useCallback((date: Date) => {
    setFocusDate(date);
    const cal = calendarRef.current?.getApi();
    if (cal && !window.matchMedia(MOBILE_MQ).matches) {
      cal.gotoDate(date);
    }
  }, []);

  const handleToday = useCallback(() => {
    goToDate(new Date());
  }, [goToDate]);

  const handlePrev = useCallback(() => {
    if (isMobile) {
      goToDate(addDays(focusDate, -1));
    } else {
      api()?.prev();
    }
  }, [focusDate, goToDate, isMobile]);

  const handleNext = useCallback(() => {
    if (isMobile) {
      goToDate(addDays(focusDate, 1));
    } else {
      api()?.next();
    }
  }, [focusDate, goToDate, isMobile]);

  const handleCreate = useCallback(() => {
    setEditing(null);
    setSlot(defaultCreateSlot(focusDate));
    setDialogOpen(true);
  }, [focusDate]);

  const handleSaved = useCallback(async () => {
    if (rangeRef.current) {
      await loadEvents(rangeRef.current.from, rangeRef.current.to);
    } else if (isMobile) {
      const next = weekRangeIso(focusDate);
      rangeRef.current = next;
      await loadEvents(next.from, next.to);
    }
    await loadMeta();
  }, [focusDate, isMobile, loadEvents, loadMeta]);

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
          onPrev={handlePrev}
          onNext={handleNext}
          onViewChange={(v) => api()?.changeView(v)}
          onCreate={handleCreate}
          onPickDate={() => setMobileCalOpen(true)}
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
          <div className="flex flex-col lg:flex-row">
            <div className="crm-cal-main min-w-0 flex-1">
              <FullCalendar
                ref={calendarRef}
                plugins={FC_PLUGINS}
                initialView="timeGridWeek"
                headerToolbar={false}
                locales={FC_LOCALES}
                locale="ru"
                firstDay={1}
                slotMinTime="08:00:00"
                slotMaxTime="21:00:00"
                slotDuration="00:30:00"
                slotLabelInterval="01:00:00"
                slotLabelFormat={FC_SLOT_LABEL_FORMAT}
                allDaySlot={false}
                nowIndicator
                scrollTime={FC_SCROLL_TIME}
                stickyHeaderDates
                selectable
                selectMirror
                editable
                eventDurationEditable
                dayMaxEvents={4}
                events={calendarEvents}
                select={onSelect}
                eventClick={onEventClick}
                eventDrop={onEventDrop}
                eventResize={onEventResize}
                datesSet={onDatesSet}
                dayHeaderContent={(arg) =>
                  arg.view.type === "dayGridMonth" ? <span className="crm-fc-day-header-weekday">{arg.text}</span> : renderDayHeader(
                    arg,
                    dayCapacity(arg.date, dayLimits, bookedByDay),
                  )
                }
                dayCellContent={(arg) => {
                  if (arg.view.type !== "dayGridMonth") return;
                  const cap = dayCapacity(arg.date, dayLimits, bookedByDay);
                  const full = cap != null && cap.remaining === 0;
                  return (
                    <div className="crm-fc-month-cell">
                      <span className="crm-fc-month-num">{arg.dayNumberText}</span>
                      {cap ? (
                        <span
                          className={`crm-fc-month-cap${full ? " is-full" : " is-open"}`}
                        >
                          {capacityShort(cap)}
                        </span>
                      ) : null}
                    </div>
                  );
                }}
                eventContent={renderEventContent}
                height="max(560px, calc(100vh - 330px))"
                eventMinHeight={28}
                slotEventOverlap={false}
                expandRows
              />
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-5 py-3 text-xs text-slate-500">
          <span>{isMobile ? "Выберите запись, чтобы посмотреть подробности" : "Выделите время для новой записи · Перетащите карточку для переноса"}</span>
          {!isMobile && view !== "dayGridMonth" && <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-rose-400" />Текущее время</span>}
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
            {!isMobile && <div className="space-y-6 px-4 pt-5">
              <DayAppointmentsList date={focusDate} appointments={dayAppointments} onOpen={(appointment) => { setMobileCalOpen(false); openAppointment(appointment); }} onCreate={() => { setMobileCalOpen(false); handleCreate(); }} capacity={focusCapacity} />
              <ServiceLegend serviceTypes={serviceTypes} />
            </div>}
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
