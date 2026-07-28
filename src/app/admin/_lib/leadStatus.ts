import type { SiteLeadStatus } from "./crmTypes";

export const STATUS_LABELS: Record<SiteLeadStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  NEEDS_CLARIFICATION: "На уточнении",
  SCHEDULED: "В календаре",
  REJECTED: "Отклонена",
  COMPLETED: "Выполнена",
};

export const STATUS_CLASS: Record<SiteLeadStatus, string> = {
  NEW: "bg-blue-500/20 text-blue-300",
  IN_PROGRESS: "bg-amber-500/20 text-amber-300",
  NEEDS_CLARIFICATION: "bg-orange-500/20 text-orange-300",
  SCHEDULED: "bg-emerald-500/20 text-emerald-300",
  REJECTED: "bg-slate-500/20 text-slate-400",
  COMPLETED: "bg-teal-500/20 text-teal-300",
};

export const FILTER_STATUSES = [
  "ALL",
  "NEW",
  "NEEDS_CLARIFICATION",
  "IN_PROGRESS",
  "SCHEDULED",
  "COMPLETED",
  "REJECTED",
] as const;

export type LeadFilterStatus = (typeof FILTER_STATUSES)[number];

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
