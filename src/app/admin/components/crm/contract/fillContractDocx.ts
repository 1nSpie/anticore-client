import JSZip from "jszip";
import type { DocIssuer } from "../../../_lib/docIssuer";
import type { SnapshotPricing, SnapshotWork } from "../../../_lib/documentTypes";
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
  issuer: DocIssuer;
  contractNumber: number | string;
  /** Дата договора (день выдачи номера); без неё — плановое начало работ. */
  docDate?: string | Date | null;
  mileageKm?: number | null;
  /** Согласованные работы (из снимка). Без них перечень строится по названию услуги записи. */
  works?: SnapshotWork[];
  pricing?: SnapshotPricing;
  /** Предпросмотр: сверху документа добавляется пометка «ЧЕРНОВИК». */
  draftNote?: string | null;
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

export function formatPhone8(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("7")) {
    return `8${digits.slice(1)}`;
  }
  if (digits.length === 11 && digits.startsWith("8")) return digits;
  if (digits.length === 10) return `8${digits}`;
  return phone;
}

export function formatBirthDate(value: string | null): string {
  if (!value) return "";
  const d = parseDate(value);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function formatWorkDate(value: string | Date): string {
  const d = parseDate(value);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}г`;
}

/** Как в шаблоне: «г. Жуковский   8  июня  2026 г» */
export function formatCityDate(value: string | Date, city: string): string {
  const d = parseDate(value);
  const month = MONTHS_GENITIVE[d.getMonth()]!;
  return `г. ${city}   ${d.getDate()}  ${month}  ${d.getFullYear()} г`;
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
    "{{PRICE}}": ` ${Math.round(input.priceRub || 0).toLocaleString("ru-RU")} руб.`,
    "{{PRICE_WORDS}}": rublesInWordsRu(input.priceRub || 0),
    "{{CITY_DATE}}": formatCityDate(input.docDate ?? input.startsAt, input.issuer.city),
    "{{MILEAGE}}": input.mileageKm != null ? String(input.mileageKm) : "________",
    "{{ISSUER_TITLE}}": input.issuer.title,
    "{{BRANCH_ADDRESS}}": input.issuer.branchAddress,
    "{{ORG_FULLNAME}}": input.issuer.fullName,
    "{{ORG_LEGAL_ADDRESS}}": input.issuer.legalAddress,
    "{{ORG_EMAIL}}": input.issuer.email,
    "{{ORG_PHONE}}": input.issuer.phone,
    "{{ORG_INN}}": input.issuer.inn,
    "{{ORG_OGRNIP}}": input.issuer.ogrnip,
    "{{ORG_SIGNER}}": input.issuer.signerName,
  };

  // Перечень согласованных работ в п. 2.2: пять строк; длинный перечень выносится в Приложение № 1
  const works = input.works ?? [];
  const layout = layoutWorks(works);
  const slots = works.length
    ? layout.slots
    : [
        check("Антикоррозийная обработка", flags.anticor),
        input.serviceType.trim(),
        check("Механическая очистка коррозии;", flags.mechanical),
        check("Лазерная очистка коррозии;", flags.laser),
        check("Сварочные работы.", flags.welding),
      ];
  slots.forEach((line, i) => {
    values[`{{WORKS_${i + 1}}}`] = line;
  });

  let out = xml;
  for (const [token, value] of Object.entries(values)) {
    out = out.split(token).join(escapeXml(value));
  }

  const method = input.pricing?.paymentMethod;
  out = markChecked(out, "Наличные;", method === "CASH");
  out = markChecked(out, "Оплата банковской картой / СБП;", method === "CARD_SBP");
  out = markChecked(out, "Оплата по договору с ИП.", method === "INVOICE_IP");

  if (works.length > 0 && layout.appendix) {
    const at = out.lastIndexOf("<w:sectPr");
    if (at >= 0) out = out.slice(0, at) + appendixXml(input, works) + out.slice(at);
  }
  return out;
}

const INLINE_MAX_LINES = 5;
const INLINE_MAX_CHARS = 110;

/**
 * Раскладка перечня работ по ячейке договора. Ничего не обрезается (ТЗ §11.3): если позиций больше пяти
 * или строка слишком длинная, в договоре остаётся ссылка, а полный перечень идёт в Приложении № 1.
 */
export function layoutWorks(works: SnapshotWork[]): { slots: string[]; appendix: boolean } {
  const lines = works.map(
    (w, i) => `${i + 1}. ${w.title}${w.comment ? ` — ${w.comment}` : ""}`,
  );
  const fits =
    lines.length <= INLINE_MAX_LINES && lines.every((l) => l.length <= INLINE_MAX_CHARS);
  if (fits) {
    return {
      slots: [...lines, ...Array(INLINE_MAX_LINES - lines.length).fill("")],
      appendix: false,
    };
  }
  return {
    slots: [
      `Перечень работ (${works.length} поз.) — в Приложении № 1 к настоящему Договору`,
      "",
      "",
      "",
      "",
    ],
    appendix: true,
  };
}

/** Отмечает ☑ вместо ☐ перед подписью варианта оплаты (☐ идёт отдельным фрагментом перед текстом). */
function markChecked(xml: string, label: string, on: boolean): string {
  if (!on) return xml;
  const at = xml.indexOf(`<w:t>${label}</w:t>`);
  if (at < 0) return xml;
  const box = xml.lastIndexOf("<w:t>☐</w:t>", at);
  if (box < 0) return xml;
  return `${xml.slice(0, box)}<w:t>☑</w:t>${xml.slice(box + "<w:t>☐</w:t>".length)}`;
}

function appendixXml(input: ContractDocxInput, works: SnapshotWork[]): string {
  const para = (
    text: string,
    o: { bold?: boolean; center?: boolean; size?: number; before?: number; after?: number } = {},
  ) =>
    `<w:p><w:pPr><w:spacing w:before="${o.before ?? 0}" w:after="${o.after ?? 80}"/><w:ind w:left="-1133" w:right="-1174"/>${
      o.center ? '<w:jc w:val="center"/>' : ""
    }</w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:eastAsia="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>${
      o.bold ? "<w:b/>" : ""
    }<w:sz w:val="${o.size ?? 20}"/><w:szCs w:val="${o.size ?? 20}"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;

  const date = parseDate(input.docDate ?? input.startsAt);
  const dateText = `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
  const rub = (n: number) => `${n.toLocaleString("ru-RU")} руб.`;

  const body: string[] = [
    '<w:p><w:r><w:br w:type="page"/></w:r></w:p>',
    para(`Приложение № 1 к Договору № ${input.contractNumber} от ${dateText} г.`, { bold: true, center: true, size: 24, before: 1200 }),
    para("Перечень согласованных работ", { center: true, size: 22, after: 200 }),
  ];
  works.forEach((w, i) => {
    body.push(para(`${i + 1}. ${w.title}`, { bold: true, before: 80, after: 20 }));
    if (w.comment) body.push(para(`Комментарий: ${w.comment}`, { after: 20 }));
    body.push(para(w.priceRub == null ? "Стоимость: не определена" : `Стоимость: ${rub(w.priceRub)}`));
  });
  const pre = input.pricing?.preliminary;
  body.push(
    para(
      `Предварительная стоимость работ: ${pre == null ? "не определена" : `${rub(pre)} (${rublesInWordsRu(pre)})`}`,
      { bold: true, before: 200 },
    ),
  );
  body.push(para("Заказчик: ____________________      Исполнитель: ____________________", { before: 600 }));
  return body.join("");
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
  let out = applyReplacements(xml, input);
  if (input.draftNote) {
    const note = `<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="B00020"/><w:sz w:val="18"/></w:rPr><w:t xml:space="preserve">${escapeXml(input.draftNote)}</w:t></w:r></w:p>`;
    out = out.replace(/(<w:body>)/, `$1${note}`);
  }
  zip.file("word/document.xml", out);
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
