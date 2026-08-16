import JSZip from "jszip";
import { rublesInWordsRu } from "./rublesInWordsRu";

const TEMPLATE_URL = "/templates/dogovor-client.docx";

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

export type ContractDocxInput = {
  contractNumber: number | string;
  fio: string;
  phone: string;
  birthDate: string | null;
  carModel: string;
  vin: string | null;
  plate?: string | null;
  year?: string | null;
  startsAt: string | Date;
  endsAt: string | Date;
  priceRub: number;
  serviceType: string;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y!, m! - 1, d);
  }
  return new Date(value);
}

function formatPhone8(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("7")) {
    return `8${digits.slice(1)}`;
  }
  if (digits.length === 11 && digits.startsWith("8")) return digits;
  if (digits.length === 10) return `8${digits}`;
  return phone;
}

function formatBirthDate(value: string | null): string {
  if (!value) return "";
  const d = parseDate(value);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function formatWorkDate(value: string | Date): string {
  const d = parseDate(value);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}г`;
}

/** Как в шаблоне: «г. Жуковский   8  июня  2026 г» */
function formatCityDate(value: string | Date): string {
  const d = parseDate(value);
  const month = MONTHS_GENITIVE[d.getMonth()]!;
  return `г. Жуковский   ${d.getDate()}  ${month}  ${d.getFullYear()} г`;
}

type ServiceFlags = {
  anticor: boolean;
  mechanical: boolean;
  laser: boolean;
  welding: boolean;
};

function serviceFlags(serviceType: string): ServiceFlags {
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

function check(label: string, on: boolean): string {
  return `${on ? "☑" : "☐"} ${label}`;
}

function applyReplacements(xml: string, input: ContractDocxInput): string {
  const flags = serviceFlags(input.serviceType);
  const yearRaw = (input.year ?? "").trim();
  const values: Record<string, string> = {
    "{{CONTRACT_NO}}": String(input.contractNumber),
    "{{FIO}}": input.fio.trim() || "________________",
    "{{PHONE}}": formatPhone8(input.phone),
    "{{BIRTH}}": formatBirthDate(input.birthDate),
    "{{CAR}}": input.carModel.trim() || "______________",
    "{{VIN}}": (input.vin ?? "").trim() || "_________________",
    "{{PLATE}}": (input.plate ?? "").trim(),
    "{{YEAR}}": yearRaw
      ? yearRaw.endsWith("г")
        ? yearRaw
        : `${yearRaw}г`
      : "",
    "{{START}}": formatWorkDate(input.startsAt),
    "{{END}}": formatWorkDate(input.endsAt),
    "{{PRICE}}": `${Math.round(input.priceRub || 0)}р`,
    "{{PRICE_WORDS}}": rublesInWordsRu(input.priceRub || 0),
    "{{CITY_DATE}}": formatCityDate(input.startsAt),
    "{{SERVICE_NOTE}}": input.serviceType.trim(),
  };

  let out = xml;
  for (const [token, value] of Object.entries(values)) {
    out = out.split(token).join(escapeXml(value));
  }

  out = out
    .split("☐ Антикоррозийная обработка")
    .join(check("Антикоррозийная обработка", flags.anticor));
  out = out
    .split("☐ Механическая очистка коррозии;")
    .join(check("Механическая очистка коррозии;", flags.mechanical));
  out = out
    .split("☐ Лазерная очистка коррозии;")
    .join(check("Лазерная очистка коррозии;", flags.laser));
  out = out
    .split("☐ Сварочные работы.")
    .join(check("Сварочные работы.", flags.welding));

  return out;
}

export async function fillContractDocx(
  input: ContractDocxInput,
): Promise<Blob> {
  const res = await fetch(TEMPLATE_URL);
  if (!res.ok) {
    throw new Error("Не удалось загрузить шаблон договора");
  }
  const zip = await JSZip.loadAsync(await res.arrayBuffer());
  const docFile = zip.file("word/document.xml");
  if (!docFile) {
    throw new Error("В шаблоне нет word/document.xml");
  }
  const xml = await docFile.async("string");
  zip.file("word/document.xml", applyReplacements(xml, input));
  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
