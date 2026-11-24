/** Выполнение работ, допработы и выдача (ТЗ §13–14): типы ответа API и подписи. */

import type { MissingField } from "./inspectionTypes";
import type { Pricing } from "./servicesTypes";

export type WorkStatus = "WAITING" | "IN_PROGRESS" | "DONE" | "PAUSED" | "NEEDS_APPROVAL" | "CANCELLED";

export const WORK_STATUS_LABEL: Record<WorkStatus, string> = {
  WAITING: "Ожидает выполнения",
  IN_PROGRESS: "В работе",
  DONE: "Выполнено",
  PAUSED: "Приостановлено",
  NEEDS_APPROVAL: "Требуется согласование",
  CANCELLED: "Отменено по согласованию",
};

/** Допустимые переходы — те же, что проверяет сервер. */
export const NEXT_STATUSES: Record<WorkStatus, WorkStatus[]> = {
  WAITING: ["IN_PROGRESS", "NEEDS_APPROVAL", "CANCELLED"],
  IN_PROGRESS: ["DONE", "PAUSED", "NEEDS_APPROVAL", "WAITING", "CANCELLED"],
  PAUSED: ["IN_PROGRESS", "NEEDS_APPROVAL", "CANCELLED"],
  NEEDS_APPROVAL: ["WAITING", "IN_PROGRESS", "CANCELLED"],
  DONE: ["IN_PROGRESS"],
  CANCELLED: ["WAITING"],
};

/** Подпись кнопки перехода в статус. */
export const STATUS_ACTION: Record<WorkStatus, string> = {
  WAITING: "Вернуть в ожидание",
  IN_PROGRESS: "В работу",
  DONE: "Выполнено",
  PAUSED: "Приостановить",
  NEEDS_APPROVAL: "Требует согласования",
  CANCELLED: "Отменить по согласованию",
};

export type ApprovalChannel = "PHONE" | "MESSENGER" | "EMAIL" | "IN_PERSON" | "OTHER";
export const APPROVAL_CHANNEL_LABEL: Record<ApprovalChannel, string> = {
  PHONE: "Телефон",
  MESSENGER: "Мессенджер",
  EMAIL: "Электронная почта",
  IN_PERSON: "Лично",
  OTHER: "Другое",
};

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export const APPROVAL_STATUS_LABEL: Record<ApprovalStatus, string> = {
  PENDING: "Ждёт решения клиента",
  APPROVED: "Согласовано клиентом",
  REJECTED: "Клиент отказался",
};

export type ExecPhoto = { id: number; url: string | null };

export type ExecItem = {
  id: number;
  kind: "AGREED" | "EXTRA";
  categoryName: string;
  title: string;
  comment: string | null;
  priceRub: number | null;
  status: WorkStatus;
  master: { id: number; fullName: string } | null;
  startedAt: string | null;
  finishedAt: string | null;
  actualVolume: string | null;
  workNote: string | null;
  defectPlace: string | null;
  termChangeNote: string | null;
  approval: {
    status: ApprovalStatus | null;
    approvedAt: string | null;
    approvedBy: string | null;
    channel: ApprovalChannel | null;
    note: string | null;
  } | null;
  photosBefore: ExecPhoto[];
  photosAfter: ExecPhoto[];
};

export type ActualPricing = {
  main: number | null;
  extras: number | null;
  gross: number | null;
  discountRub: number;
  total: number | null;
  paidRub: number;
  remaining: number | null;
};

export type ExecutionView = {
  visitId: number;
  workStartedAt: string | null;
  workFinishedAt: string | null;
  items: ExecItem[];
  summary: { unfinished: number; pendingExtras: number };
  pricing: { contract: Pricing; actual: ActualPricing };
  masters: { id: number; fullName: string; assigned: boolean }[];
  signed: boolean;
};

export type HandoverData = {
  issuedAt: string | null;
  issuedBy: { id: number; fullName: string } | null;
  mileageKm: number | null;
  fuelPercent: number | null;
  warrantyBookIssued: boolean | null;
  warrantyTermsExplained: boolean | null;
  warrantyMonths: number | null;
  warrantyStartsAt: string | null;
  warrantyTerms: string | null;
  careRecommendations: string | null;
};

export type HandoverView = {
  visitId: number;
  handover: HandoverData | null;
  reception: { mileageKm: number | null; fuelPercent: number | null };
  staff: { id: number; fullName: string; assigned: boolean }[];
  missing: MissingField[];
};
