// Типы и общие функции для зарплаты, кассы и склада (контракты API: /crm/payroll, /crm/cash, /crm/stock)

import { CRM_LOCATIONS, CRM_LOCATION_LABELS, type CrmLocationCode } from "./crmLocations";

export { CRM_LOCATIONS, CRM_LOCATION_LABELS };
export type { CrmLocationCode };

export type PayrollRole = "MASTER" | "RECEIVER";
export const PAYROLL_ROLE_LABELS: Record<PayrollRole, string> = { MASTER: "Мастер", RECEIVER: "Админ" };

export type PayrollSettings = { masterBaseRub: number; receiverBaseRub: number };

export type BonusType = { id: number; title: string; amountRub: number; role: PayrollRole; active: boolean; sortOrder: number };

export type ClosingItem = { key: string; label: string; done: boolean };

export type VisitPayrollEntry = {
  id: number;
  staffId: number | null;
  staffName: string;
  role: PayrollRole;
  baseRub: number;
  accrued: boolean;
  bonuses: { id: number; typeId: number | null; title: string; amountRub: number }[];
  totalRub: number;
};

export type VisitPayroll = {
  closed: boolean;
  receiver: { id: number; fullName: string } | null;
  closing: ClosingItem[];
  bonusTypes: BonusType[];
  entries: VisitPayrollEntry[];
};

export type PayrollReport = {
  from: string;
  to: string;
  totalRub: number;
  staff: { staffId: number | null; staffName: string; baseRub: number; bonusRub: number; totalRub: number; orders: number }[];
  entries: {
    id: number;
    visitId: number;
    visitDate: string;
    serviceType: string;
    location: CrmLocationCode;
    docNumber: string | null;
    staffId: number | null;
    staffName: string;
    role: PayrollRole;
    baseRub: number;
    bonuses: { title: string; amountRub: number }[];
    totalRub: number;
    accruedAt: string;
  }[];
};

export type CashEntry = {
  id: number;
  date: string;
  location: CrmLocationCode;
  direction: "IN" | "OUT";
  amountRub: number;
  category: string | null;
  comment: string | null;
  visitId: number | null;
  createdBy: string;
  createdAt: string;
  voided: boolean;
  voidReason: string | null;
  voidedBy: string | null;
};

export type CashReport = {
  from: string;
  to: string;
  openingRub: number;
  inRub: number;
  outRub: number;
  balanceRub: number;
  closingRub: number;
  entries: CashEntry[];
};

export type StockItem = {
  id: number;
  name: string;
  unit: string;
  minQty: number;
  active: boolean;
  qty: number;
  byLocation: Record<CrmLocationCode, number>;
  low: boolean;
};

export type StockMovement = {
  id: number;
  itemId: number;
  itemName: string;
  unit: string;
  location: CrmLocationCode;
  kind: "IN" | "OUT" | "ADJUST";
  delta: number;
  comment: string | null;
  visitId: number | null;
  createdBy: string;
  createdAt: string;
};

export const STOCK_KIND_LABELS = { IN: "Приход", OUT: "Расход", ADJUST: "Инвентаризация" } as const;

const rub = new Intl.NumberFormat("ru-RU");
export const formatRub = (v: number) => `${rub.format(v)} ₽`;
export const formatQty = (v: number) => rub.format(Math.round(v * 1000) / 1000);

/** Сегодняшняя дата по Москве в виде ГГГГ-ММ-ДД */
export function todayMsk(): string {
  return new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
}

/** Первый день текущего месяца (МСК) */
export function monthStartMsk(): string {
  return `${todayMsk().slice(0, 8)}01`;
}

export function apiErrorText(e: unknown, fallback: string): string {
  const msg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return Array.isArray(msg) ? msg.join(", ") : typeof msg === "string" ? msg : fallback;
}
