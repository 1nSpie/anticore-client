import type { SiteLeadStatus } from "./crmTypes";

export const STATUS_LABELS: Record<SiteLeadStatus, string> = {
  NEW: "Новая",
  PROCESSING: "Обрабатывается",
  IN_PROGRESS: "В работе",
  NEEDS_CLARIFICATION: "На уточнении",
  SCHEDULED: "В календаре",
  REJECTED: "Отклонена",
  COMPLETED: "Выполнена",
};

/** Подсказки к статусам (в фильтре и выпадающих списках). */
export const STATUS_HINTS: Partial<Record<SiteLeadStatus, string>> = {
  PROCESSING: "Заявку взяли, связываемся с клиентом",
  IN_PROGRESS: "Авто на подъёмнике: день записи наступил, запись не закрыта",
  SCHEDULED: "Записана в календарь на другой день",
  NEEDS_CLARIFICATION: "Вернётся в «Новые» в 07:30 указанного дня",
};

export const STATUS_CLASS: Record<SiteLeadStatus, string> = {
  NEW: "bg-blue-500/20 text-blue-300",
  PROCESSING: "bg-violet-500/20 text-violet-300",
  IN_PROGRESS: "bg-amber-500/20 text-amber-300",
  NEEDS_CLARIFICATION: "bg-orange-500/20 text-orange-300",
  SCHEDULED: "bg-emerald-500/20 text-emerald-300",
  REJECTED: "bg-slate-500/20 text-slate-400",
  COMPLETED: "bg-teal-500/20 text-teal-300",
};

export const FILTER_STATUSES = [
  "ALL",
  "NEW",
  "PROCESSING",
  "NEEDS_CLARIFICATION",
  "IN_PROGRESS",
  "SCHEDULED",
  "COMPLETED",
  "REJECTED",
] as const;

export type LeadFilterStatus = (typeof FILTER_STATUSES)[number];

/** Статусы, которые ставит система по записи в календаре — вручную не выбираются. */
export const VISIT_DRIVEN_STATUSES: readonly SiteLeadStatus[] = [
  "SCHEDULED",
  "IN_PROGRESS",
];

/**
 * Статусы для выпадающего списка в карточке заявки.
 * «В календаре» / «В работе» показываем только если заявка уже в них (выбрать вручную нельзя).
 */
export function selectableStatuses(current: SiteLeadStatus): SiteLeadStatus[] {
  return (Object.keys(STATUS_LABELS) as SiteLeadStatus[]).filter(
    (s) => !VISIT_DRIVEN_STATUSES.includes(s) || s === current,
  );
}

/** При смене статуса с «Новая» комментарий администратора обязателен. */
export function requiresAdminNoteOnStatusChange(
  from: SiteLeadStatus,
  to: SiteLeadStatus,
): boolean {
  return from === "NEW" && to !== "NEW";
}

export function hasAdminNote(note: string | null | undefined): boolean {
  return Boolean(note?.trim());
}
