import type { DocIssuer } from "./docIssuer";
import type { InspectionView, MissingField } from "./inspectionTypes";
import type { ActualPricing, ApprovalChannel, ApprovalStatus, WorkStatus } from "./executionTypes";
import type { PaymentMethod } from "./servicesTypes";

/** Договор и акты по записи: типы ответа API (зеркалят сервер) и подписи статусов. */

export type DocumentKind = "CONTRACT" | "ACCEPTANCE" | "WORKS";
export type DocVersionStatus = "READY" | "SIGNED" | "VOID";
export type DocStatus = DocVersionStatus | "NOT_FORMED" | "INSUFFICIENT_DATA";

export const DOCUMENT_LABEL: Record<DocumentKind, string> = {
  CONTRACT: "Договор",
  ACCEPTANCE: "Акт приёма-передачи",
  WORKS: "Акт выполненных работ",
};

/** Статусы из ТЗ §17: «Не сформирован», «Недостаточно данных», «Готов к подписанию», «Подписан», «Аннулирован / заменён новой версией». */
export const DOC_STATUS_LABEL: Record<DocStatus, string> = {
  NOT_FORMED: "Не сформирован",
  INSUFFICIENT_DATA: "Недостаточно данных",
  READY: "Готов к подписанию",
  SIGNED: "Подписан",
  VOID: "Аннулирован / заменён новой версией",
};

export type DocumentSnapshot = {
  schemaVersion: number;
  kind: DocumentKind;
  number: string | null;
  docDate: string | null;
  formedAt: string;
  draft: boolean;
  missing: MissingField[];
  issuer: DocIssuer;
  client: {
    id: number;
    lastName: string | null;
    firstName: string | null;
    patronymic: string | null;
    phone: string;
    birthDate: string | null;
  };
  vehicle: {
    id: number;
    label: string;
    year: number | null;
    vin: string | null;
    plate: string | null;
  } | null;
  visit: {
    id: number;
    startsAt: string | null;
    endsAt: string | null;
    serviceType: string;
    priceRub: number | null;
    completedAt: string | null;
    location: string;
  };
  inspection: InspectionView | null;
  /** Согласованные работы и стоимость; в версиях со схемой 1 их нет — документ строится по услуге и цене записи. */
  works?: SnapshotWork[];
  pricing?: SnapshotPricing;
  /** Фактическое выполнение и выдача — для акта выполненных работ (схема снимка 3). */
  execution?: SnapshotExecution | null;
  handover?: SnapshotHandover | null;
  acceptanceDate: string | null;
};

export type SnapshotWork = {
  id: number;
  categoryName: string;
  title: string;
  comment: string | null;
  priceRub: number | null;
};

export type SnapshotExecutionItem = {
  id: number;
  kind: "AGREED" | "EXTRA";
  title: string;
  comment: string | null;
  priceRub: number | null;
  status: WorkStatus;
  masterName: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  actualVolume: string | null;
  workNote: string | null;
  defectPlace: string | null;
  approval: {
    status: ApprovalStatus | null;
    approvedAt: string | null;
    approvedBy: string | null;
    channel: ApprovalChannel | null;
    note: string | null;
  } | null;
  photosBefore: number;
  photosAfter: number;
};

export type SnapshotExecution = {
  startedAt: string | null;
  finishedAt: string | null;
  items: SnapshotExecutionItem[];
};

export type SnapshotHandover = {
  issuedAt: string | null;
  issuedByName: string | null;
  mileageKm: number | null;
  fuelPercent: number | null;
  warrantyBookIssued: boolean | null;
  warrantyTermsExplained: boolean | null;
  warrantyMonths: number | null;
  warrantyStartsAt: string | null;
  warrantyTerms: string | null;
  careRecommendations: string | null;
};

export type SnapshotPricing = {
  /** Фактическая стоимость для акта выполненных работ (схема снимка 3). */
  actual?: ActualPricing;
  preliminary: number | null;
  discountPercent: number | null;
  discountRub: number;
  agreedTotal: number | null;
  paidRub: number;
  remaining: number | null;
  paymentMethod: PaymentMethod | null;
};

export type DocVersionRow = {
  id: number;
  version: number;
  status: DocVersionStatus;
  formedAt: string;
  formedBy: string;
  signedAt: string | null;
  signedBy: string | null;
  scanUrl: string | null;
  voidedAt: string | null;
  voidReason: string | null;
};

export type DocState = {
  kind: DocumentKind;
  label: string;
  status: DocStatus;
  missing: MissingField[];
  currentVersionId: number | null;
  versions: DocVersionRow[];
};

export type DocumentsView = {
  visitId: number;
  number: string | null;
  docDate: string | null;
  location: string;
  documents: DocState[];
};
