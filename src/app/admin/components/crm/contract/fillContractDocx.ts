import JSZip from "jszip";
import { rublesInWordsRu } from "./rublesInWordsRu";

const TEMPLATE_URL = "/templates/dogovor-client.docx";

/** Sample values from the Word template (Dogovor_Strazhnikov_klienty.docx). */
const SAMPLE = {
  contractNo: "6874",
  fio: "Юрцев Сергей Андреевич",
  phone: "89166256925",
  carModel: "MITSUBISHI OUTLANDER",
  vin: "LL66HAB00NB031973",
  plate: "O348BH250",
  year: "2022г",
  startWork: "06.06.2026г",
  endWork: "07.06.2026г",
  price: "41500р",
  priceWords: "Сорок одна тысяча пятьсот рублей 00 копеек",
  cityDate: "г. Жуковский   8  июня  2026 г",
} as const;

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
  /** Гос. номер — в CRM пока нет, оставляем пустым. */
  plate?: string | null;
  /** Год выпуска — в CRM пока нет. */
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
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function formatWorkDate(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}г`;
}

/** Как в шаблоне: «г. Жуковский   8  июня  2026 г» */
function formatCityDate(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  const day = d.getDate();
  const month = MONTHS_GENITIVE[d.getMonth()]!;
  return `г. Жуковский   ${day}  ${month}  ${d.getFullYear()} г`;
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
  const no = String(input.contractNumber);
  const fio = escapeXml(input.fio.trim() || "________________");
  const phone = escapeXml(formatPhone8(input.phone));
  const birth = escapeXml(formatBirthDate(input.birthDate));
  const car = escapeXml(input.carModel.trim() || "—");
  const vin = escapeXml((input.vin ?? "").trim() || "—");
  const plate = escapeXml((input.plate ?? "").trim());
  const yearRaw = (input.year ?? "").trim();
  const year = escapeXml(yearRaw ? (yearRaw.endsWith("г") ? yearRaw : `${yearRaw}г`) : "");
  const start = escapeXml(formatWorkDate(input.startsAt));
  const end = escapeXml(formatWorkDate(input.endsAt));
  const price = escapeXml(`${Math.round(input.priceRub)}р`);
  const priceWords = escapeXml(rublesInWordsRu(input.priceRub));
  const cityDate = escapeXml(formatCityDate(input.startsAt));
  const flags = serviceFlags(input.serviceType);

  let out = xml;

  out = out.split(SAMPLE.fio).join(fio);
  out = out.split(SAMPLE.phone).join(phone);
  out = out.split(SAMPLE.carModel).join(car);
  out = out.split(SAMPLE.vin).join(vin);
  out = out.split(SAMPLE.plate).join(plate);
  out = out.split(`Год выпуска: ${SAMPLE.year}`).join(`Год выпуска: ${year}`);
  out = out.split(SAMPLE.startWork).join(start);
  out = out.split(SAMPLE.endWork).join(end);
  out = out.split(SAMPLE.price).join(price);
  out = out.split(`(${SAMPLE.priceWords})`).join(`(${priceWords})`);
  out = out.split(SAMPLE.cityDate).join(cityDate);

  // Contract number variants in header / page markers
  out = out.split(`Договор №${SAMPLE.contractNo}`).join(`Договор №${no}`);
  out = out.split(`Договор № ${SAMPLE.contractNo}`).join(`Договор № ${no}`);

  // Birth date is empty in the template: «Дата рождения: »
  out = out.split("Дата рождения: ").join(`Дата рождения: ${birth}`);

  // Service checkboxes
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
