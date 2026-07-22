import { Font } from "@react-pdf/renderer";
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
    return `${"_".repeat(14)} ${"_".repeat(12)} ${"_".repeat(14)}`;
  }
  return parts.map((p) => (p?.trim() ? p.trim() : "_".repeat(12))).join(" ");
}

export function formatCityDateUpper(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  return `г. Жуковский ${d.getDate()} ${MONTHS_GEN_UPPER[d.getMonth()]} ${d.getFullYear()}г.`;
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
