import type { SiteLead } from "./crmTypes";

/**
 * Контроль реакции на заявку: «Новая» должна быть обработана за 30 минут рабочего времени.
 * Рабочее время — 07:30–20:00 МСК каждый день (Москва — UTC+3 круглый год).
 * Заявка, пришедшая ночью, начинает «тикать» с 07:30.
 */
export const LEAD_SLA_MINUTES = 30;
export const WORK_START_MIN = 7 * 60 + 30;
export const WORK_END_MIN = 20 * 60;

const MSK_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_MS = 60 * 1000;

/** Миллисекунды рабочего времени (07:30–20:00 МСК) в интервале [from; to). */
export function workingMsBetween(from: Date, to: Date): number {
  const fromMs = from.getTime();
  const toMs = to.getTime();
  if (!(toMs > fromMs)) return 0;

  let total = 0;
  // Полночь МСК суток, в которые попадает `from`, как UTC-момент
  let dayStart =
    Math.floor((fromMs + MSK_OFFSET_MS) / DAY_MS) * DAY_MS - MSK_OFFSET_MS;
  for (; dayStart < toMs; dayStart += DAY_MS) {
    const workStart = dayStart + WORK_START_MIN * MIN_MS;
    const workEnd = dayStart + WORK_END_MIN * MIN_MS;
    const a = Math.max(fromMs, workStart);
    const b = Math.min(toMs, workEnd);
    if (b > a) total += b - a;
  }
  return total;
}

/** С какого момента считается срок реакции. */
export function leadSlaStart(lead: Pick<SiteLead, "createdAt" | "surfacedAt">): Date {
  return new Date(lead.surfacedAt ?? lead.createdAt);
}

/**
 * Насколько просрочена заявка (мс рабочего времени сверх 30 минут), или 0.
 * Считается только для статуса «Новая».
 */
export function leadOverdueMs(
  lead: Pick<SiteLead, "status" | "createdAt" | "surfacedAt">,
  now: Date = new Date(),
): number {
  if (lead.status !== "NEW") return 0;
  const worked = workingMsBetween(leadSlaStart(lead), now);
  return Math.max(0, worked - LEAD_SLA_MINUTES * MIN_MS);
}

/** Сколько рабочих минут осталось до просрочки (для «Новых», ещё не просроченных). */
export function leadSlaRemainingMs(
  lead: Pick<SiteLead, "status" | "createdAt" | "surfacedAt">,
  now: Date = new Date(),
): number {
  if (lead.status !== "NEW") return 0;
  const worked = workingMsBetween(leadSlaStart(lead), now);
  return Math.max(0, LEAD_SLA_MINUTES * MIN_MS - worked);
}

/** «1 ч 20 мин», «45 мин», «2 д 3 ч» — рабочее время. */
export function formatDurationRu(ms: number): string {
  const totalMin = Math.max(1, Math.round(ms / MIN_MS));
  const workDayMin = WORK_END_MIN - WORK_START_MIN;
  const days = Math.floor(totalMin / workDayMin);
  const rest = totalMin - days * workDayMin;
  const h = Math.floor(rest / 60);
  const m = rest % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days} раб. д`);
  if (h) parts.push(`${h} ч`);
  if (m && !days) parts.push(`${m} мин`);
  return parts.join(" ") || "1 мин";
}
