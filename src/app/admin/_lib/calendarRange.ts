import type { CalendarViewType } from "../components/crm/CrmCalendarToolbar";

/** Даты календаря — по локальному времени браузера (как и ключи в `dayCapacity`). */

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Пн–Вс недели, в которую попадает `focus`. */
export function weekDays(focus: Date): Date[] {
  const start = startOfWeekMonday(focus);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Сетка месяца: от понедельника недели с 1-м числом до воскресенья недели с последним. */
export function monthGridDays(focus: Date): Date[] {
  const first = new Date(focus.getFullYear(), focus.getMonth(), 1);
  const last = new Date(focus.getFullYear(), focus.getMonth() + 1, 0);
  const start = startOfWeekMonday(first);
  const end = addDays(startOfWeekMonday(last), 6);
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  return days;
}

/** Какой период загружать с сервера: месяц — вся сетка, день и неделя — неделя целиком. */
export function loadRange(
  view: CalendarViewType,
  focus: Date,
): { from: string; to: string } {
  if (view === "dayGridMonth") {
    const days = monthGridDays(focus);
    return {
      from: days[0]!.toISOString(),
      to: addDays(days[days.length - 1]!, 1).toISOString(),
    };
  }
  const start = startOfWeekMonday(focus);
  return { from: start.toISOString(), to: addDays(start, 7).toISOString() };
}

/** Перенос записи на другой календарный день с тем же временем и длительностью. */
export function moveToDay(
  startsAt: string,
  endsAt: string,
  target: Date,
): { start: Date; end: Date } {
  const start = new Date(startsAt);
  const duration = new Date(endsAt).getTime() - start.getTime();
  const next = new Date(start);
  next.setFullYear(target.getFullYear(), target.getMonth(), target.getDate());
  return { start: next, end: new Date(next.getTime() + duration) };
}
