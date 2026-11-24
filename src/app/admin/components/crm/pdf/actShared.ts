import { Font } from "@react-pdf/renderer";
import type { DocIssuer } from "../../../_lib/docIssuer";
import type { InspectionView } from "../../../_lib/inspectionTypes";
import type {
  SnapshotExecution,
  SnapshotHandover,
  SnapshotPricing,
  SnapshotWork,
} from "../../../_lib/documentTypes";
import { rublesInWordsRu } from "../contract/rublesInWordsRu";

let fontsRegistered = false;

/** Browser: absolute URL. Node: filesystem path under `public/`. */
function publicUrl(assetPath: string): string {
  const normalized = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${normalized}`;
  }
  return `${process.cwd()}/public${normalized}`;
}

export function registerActFonts() {
  if (fontsRegistered) return;
  Font.register({
    family: "DejaVu",
    fonts: [
      { src: publicUrl("/fonts/DejaVuSans.ttf"), fontWeight: "normal" },
      { src: publicUrl("/fonts/DejaVuSans-Bold.ttf"), fontWeight: "bold" },
    ],
  });
  fontsRegistered = true;
}

export function actAsset(assetPath: string): string {
  return publicUrl(assetPath);
}

const MONTHS_GEN_UPPER = [
  "ЯНВАРЯ",
  "ФЕВРАЛЯ",
  "МАРТА",
  "АПРЕЛЯ",
  "МАЯ",
  "ИЮНЯ",
  "ИЮЛЯ",
  "АВГУСТА",
  "СЕНТЯБРЯ",
  "ОКТЯБРЯ",
  "НОЯБРЯ",
  "ДЕКАБРЯ",
] as const;

export type ActDocInput = {
  issuer: DocIssuer;
  /** Данные приёмки; без них акт приёма формируется как черновик. */
  inspection?: InspectionView | null;
  /** Дата договора (день выдачи номера). Пока номера нет — пустое место для заполнения. */
  contractDate?: string | Date | null;
  /** Дата акта приёма-передачи — на неё ссылается акт выполненных работ. */
  acceptanceDate?: string | Date | null;
  /** Дата самого акта выполненных работ (формирования). */
  actDate?: string | Date | null;
  /** Согласованные работы и стоимость (из снимка); без них документ строится по услуге и цене записи. */
  works?: SnapshotWork[];
  pricing?: SnapshotPricing;
  /** Фактическое выполнение и выдача (акт выполненных работ). */
  execution?: SnapshotExecution | null;
  handover?: SnapshotHandover | null;
  /** Предпросмотр: на документ ставится пометка «ЧЕРНОВИК» с перечнем недостающего. */
  draft?: boolean;
  draftMissing?: string[];
  contractNumber: number | string;
  lastName: string | null;
  firstName: string | null;
  patronymic: string | null;
  /** Fallback, если ФИО по частям пустое */
  fioFallback?: string | null;
  carModel: string | null;
  vin: string | null;
  plate?: string | null;
  year?: string | null;
  startsAt: string | Date;
  endsAt: string | Date;
  priceRub: number;
  serviceType: string;
};

export function blank(value: string | null | undefined, width = 28): string {
  const t = value?.trim();
  if (t) return t;
  return "_".repeat(width);
}

/** ФИО: есть часть — пишем, нет — подчёркивание под заполнение. */
export function formatFioForAct(input: ActDocInput): string {
  const parts = [input.lastName, input.firstName, input.patronymic];
  const hasAny = parts.some((p) => p?.trim());
  if (!hasAny) {
    const fb = input.fioFallback?.trim();
    if (fb) return fb;
    return `${"_".repeat(14)} ${"_".repeat(12)}`;
  }
  // Отчество необязательно: если его нет — просто не пишем, без пустого подчёркивания.
  return [
    input.lastName?.trim() || "_".repeat(12),
    input.firstName?.trim() || "_".repeat(12),
    input.patronymic?.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

export function formatCityDateUpper(
  value: string | Date,
  city: string,
): string {
  const d = value instanceof Date ? value : new Date(value);
  return `г. ${city} ${d.getDate()} ${MONTHS_GEN_UPPER[d.getMonth()]} ${d.getFullYear()}г.`;
}

export function formatDateDots(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function formatDateTimeRu(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return `${formatDateDots(d)} ${d.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function formatPriceLine(amount: number): {
  digits: string;
  words: string;
} {
  const n = Math.round(amount);
  return {
    digits: `${n} р`,
    words: `(${rublesInWordsRu(n)})`,
  };
}

export function serviceFlags(serviceType: string) {
  const s = serviceType.toLowerCase();
  const complex =
    s.includes("комплекс") || s.includes("полный") || s.includes("пакет");
  return {
    anticor:
      complex ||
      s.includes("антикор") ||
      s.includes("обработк") ||
      s.includes("защит"),
    mechanical: complex || s.includes("механ") || s.includes("очистк"),
    laser: complex || s.includes("лазер"),
    welding: complex || s.includes("сварк"),
  };
}

export function box(on: boolean): string {
  return on ? "☑" : "☐";
}
