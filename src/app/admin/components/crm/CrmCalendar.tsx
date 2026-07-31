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
import { getEventColor } from "./calendarColors";
import { Button } from "@/shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shadcn/sheet";
import { formatPhoneRuDisplaySafe } from "@/lib/phoneRu";
import { toast } from "sonner";
import "./crm-calendar.css";

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

function renderDayHeader(arg: { date: Date; isToday: boolean }) {
  const weekday = arg.date
    .toLocaleDateString("ru-RU", { weekday: "short" })
    .replace(".", "")
    .toUpperCase();
  const dayNum = arg.date.getDate();

  return (
    <div className="crm-fc-day-header">
      <span className="crm-fc-day-header-weekday">{weekday}</span>
      <span
        className={`crm-fc-day-header-num${arg.isToday ? " is-today" : ""}`}
      >
        {dayNum}
      </span>
    </div>
  );
}

function renderEventContent(arg: EventContentArg) {
  const serviceType = arg.event.extendedProps.serviceType as string | undefined;
  const managerName = arg.event.extendedProps.managerName as
    | string
    | undefined
    | null;
  const phone = arg.event.extendedProps.phone as string | undefined;
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
        <span className="crm-fc-event-time">{timeLabel}</span>
        <span className="crm-fc-event-title">{arg.event.title}</span>
      </div>
    );
  }

  return (
    <div className="crm-fc-event">
      <div className="crm-fc-event-title">{arg.event.title}</div>
      {!isShort && serviceType && (
        <div className="crm-fc-event-sub">{serviceType}</div>
      )}
      {isDay && !isShort && phone && (
        <div className="crm-fc-event-sub">{formatPhoneRuDisplaySafe(phone)}</div>
      )}
      {(isDay || !isShort) && managerName && (
        <div className="crm-fc-event-sub">Менеджер: {managerName}</div>
      )}
      {timeLabel && <div className="crm-fc-event-time">{timeLabel}</div>}
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
                style={{ backgroundColor: color.bg }}
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
  const [events, setEvents] = useState<CrmAppointment[]>([]);
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

  const loadEvents = useCallback(
    async (from?: string, to?: string, loc: CrmLocationCode = location) => {
      const { data } = await adminApi.get<CrmAppointment[]>(
        "/crm/appointments",
        {
          params: { from, to, location: loc },
        },
      );
      setEvents(data);
    },
    [location],
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
    void loadEvents(next.from, next.to, location);
  }, [isMobile, focusDate, location, loadEvents]);

  /** Смена филиала на десктопе — перезагрузить текущий диапазон. */
  useEffect(() => {
    if (!isDesktop || !rangeRef.current) return;
    void loadEvents(rangeRef.current.from, rangeRef.current.to, location);
  }, [location, isDesktop, loadEvents]);

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

      const nextFocus = arg.view.currentStart;
      setFocusDate((prev) =>
        prev.toDateString() === nextFocus.toDateString() ? prev : nextFocus,
      );

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
        const color = getEventColor(e.serviceTypeId ?? e.id);
        return {
          id: String(e.id),
          title: clientName,
          start: e.startsAt,
          end: e.endsAt,
          backgroundColor: color.bg,
          borderColor: color.border,
          textColor: color.text,
          extendedProps: {
            serviceType: e.serviceType,
            managerName: e.managerName,
            phone: e.client.phone,
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
    const today = new Date();
    if (isMobile) {
      goToDate(today);
    } else {
      api()?.today();
    }
  }, [goToDate, isMobile]);

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
    setSlot(defaultCreateSlot(isMobile ? focusDate : undefined));
    setDialogOpen(true);
  }, [focusDate, isMobile]);

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
      <div className="crm-calendar min-h-[50vh] animate-pulse rounded-xl border border-white/10 bg-[#1a1d21]" />
    );
  }

  return (
    <>
      <div className="crm-calendar overflow-hidden rounded-xl border border-white/10 bg-[#1a1d21] shadow-xl">
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
            />
            <DayAppointmentsList
              date={focusDate}
              appointments={dayAppointments}
              onOpen={openAppointment}
              onCreate={handleCreate}
              variant="agenda"
            />
          </div>
        ) : null}

        {isDesktop ? (
          <div className="flex flex-col lg:flex-row">
            <aside className="hidden w-[280px] shrink-0 space-y-5 border-r border-white/10 p-4 lg:block">
              <CrmMiniCalendar selected={focusDate} onSelect={goToDate} />
              <DayAppointmentsList
                date={focusDate}
                appointments={dayAppointments}
                onOpen={openAppointment}
                onCreate={handleCreate}
              />
              <ServiceLegend serviceTypes={serviceTypes} />
            </aside>

            <main className="crm-cal-main min-h-[65vh] min-w-0 flex-1 p-1 sm:p-3 lg:min-h-[calc(100vh-320px)]">
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
                dayHeaderContent={renderDayHeader}
                eventContent={renderEventContent}
                height="100%"
                expandRows
              />
            </main>
          </div>
        ) : null}
      </div>

      <Sheet open={mobileCalOpen} onOpenChange={setMobileCalOpen}>
        <SheetContent
          side="bottom"
          className="border-white/10 bg-slate-950 text-white sm:max-w-none"
        >
          <SheetHeader>
            <SheetTitle className="text-white">Выбрать дату</SheetTitle>
          </SheetHeader>
          <div className="px-1 pb-2">
            <CrmMiniCalendar
              selected={focusDate}
              onSelect={(date) => {
                goToDate(date);
                setMobileCalOpen(false);
              }}
            />
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
