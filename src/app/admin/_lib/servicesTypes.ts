/** Справочник услуг, перечень согласованных работ и стоимость записи (ТЗ §8.5, §9): типы ответа API. */

export type PaymentMethod = "CASH" | "CARD_SBP" | "INVOICE_IP";
export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  CASH: "Наличные",
  CARD_SBP: "Оплата банковской картой / СБП",
  INVOICE_IP: "Оплата по договору с ИП",
};

export type CatalogOption = { id: number; name: string; active: boolean };
export type CatalogGroup = {
  id: number;
  key: string;
  label: string;
  multiple: boolean;
  allowCustom: boolean;
  options: CatalogOption[];
};
export type CatalogCategory = {
  id: number;
  code: string;
  name: string;
  groups: CatalogGroup[];
};

export type WorkItem = {
  id: number;
  categoryId: number;
  categoryName: string;
  selections: Record<string, string[]>;
  comment: string | null;
  /** null — стоимость не определена; 0 — бесплатно. */
  priceRub: number | null;
  title: string;
};

export type Pricing = {
  preliminary: number | null;
  discountPercent: number | null;
  discountRub: number;
  agreedTotal: number | null;
  paidRub: number;
  remaining: number | null;
};

export type WorksView = {
  visitId: number;
  items: WorkItem[];
  pricing: Pricing;
  paymentMethod: PaymentMethod | null;
  contractSigned: boolean;
};

/** «45 000 ₽»; null — «не определена». */
export function formatRub(value: number | null | undefined): string {
  return value == null ? "не определена" : `${value.toLocaleString("ru-RU")} ₽`;
}
