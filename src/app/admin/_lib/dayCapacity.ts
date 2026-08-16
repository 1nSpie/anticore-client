export type DayCapacity = {
  limit: number;
  booked: number;
  remaining: number;
};

export function calendarDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function bookedByDateMap(
  items: Array<{ startsAt: string }>,
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of items) {
    const key = calendarDateKey(new Date(item.startsAt));
    map[key] = (map[key] ?? 0) + 1;
  }
  return map;
}

export function dayCapacity(
  date: Date,
  limits: Record<string, number>,
  bookedByDay: Record<string, number>,
): DayCapacity | null {
  const key = calendarDateKey(date);
  if (!(key in limits)) return null;
  const limit = limits[key]!;
  const booked = bookedByDay[key] ?? 0;
  return {
    limit,
    booked,
    remaining: Math.max(0, limit - booked),
  };
}

/** Коротко для ячеек: «2/5», «закрыт». */
export function capacityShort(cap: DayCapacity): string {
  if (cap.limit === 0) return "закрыт";
  return `${cap.booked}/${cap.limit}`;
}

/** Для шапки: «ещё 3», «нет мест». */
export function capacityRemainingLabel(cap: DayCapacity): string {
  if (cap.limit === 0) return "закрыт";
  if (cap.remaining === 0) return "нет мест";
  return `ещё ${cap.remaining}`;
}

export function monthsOverlapping(
  fromIso: string,
  toIso: string,
): Array<{ year: number; month: number }> {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const last = new Date(to.getTime() - 1);
  const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(last.getFullYear(), last.getMonth(), 1);
  const out: Array<{ year: number; month: number }> = [];
  while (cursor <= end) {
    out.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  if (out.length === 0) {
    out.push({ year: from.getFullYear(), month: from.getMonth() + 1 });
  }
  return out;
}
