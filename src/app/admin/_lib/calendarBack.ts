/**
 * Возврат в календарь: адрес календаря (день, вид, филиал) едет в `?back=` через запись и карточку клиента,
 * чтобы выход возвращал туда, где пользователь был, а не на день записи или на сегодня.
 */
export function safeCalendarBack(raw: string | null | undefined): string | null {
  if (!raw || !raw.startsWith("/admin/calendar")) return null;
  return raw;
}

export function withBack(path: string, back: string | null): string {
  if (!back) return path;
  return `${path}${path.includes("?") ? "&" : "?"}back=${encodeURIComponent(back)}`;
}
