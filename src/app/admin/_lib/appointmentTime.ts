/** Время записи в полях `<input type="datetime-local">` (локальное время браузера). */

const DEFAULT_DURATION_MS = 60 * 60 * 1000;

/** ISO → значение для `datetime-local` (`YYYY-MM-DDTHH:mm`). */
export function toLocalInput(iso: string | Date) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Новое окончание при смене начала: сдвигаем вместе с началом, сохраняя длительность.
 * Если длительность была некорректной (окончание не позже начала) — ставим +1 ч.
 */
export function shiftEndWithStart(
  prevStart: string,
  nextStart: string,
  end: string,
): string {
  const next = new Date(nextStart).getTime();
  if (Number.isNaN(next)) return end;
  const duration =
    new Date(end).getTime() - new Date(prevStart).getTime();
  const keep = Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_DURATION_MS;
  return toLocalInput(new Date(next + keep));
}

/** Окончание не позже начала (оба значения заполнены). */
export function isEndNotAfterStart(start: string, end: string): boolean {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return !Number.isNaN(s) && !Number.isNaN(e) && e <= s;
}
