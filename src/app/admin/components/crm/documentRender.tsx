import { pdf } from "@react-pdf/renderer";
import type { DocumentSnapshot } from "../../_lib/documentTypes";
import { fillContractDocx } from "./contract/fillContractDocx";
import { AcceptanceActPdf } from "./pdf/AcceptanceActPdf";
import { ContractPdf } from "./pdf/ContractPdf";
import { CompletedWorksActPdf } from "./pdf/CompletedWorksActPdf";
import type { ActDocInput } from "./pdf/actShared";

export type RenderedDocument = {
  blob: Blob;
  filename: string;
  format: "pdf" | "docx";
};

const PLACEHOLDER_NUMBER = "________";
const SLUG = { CONTRACT: "dogovor", ACCEPTANCE: "akt-priema", WORKS: "akt-rabot" } as const;

function fioParts(s: DocumentSnapshot) {
  return [s.client.lastName, s.client.firstName, s.client.patronymic]
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p))
    .join(" ");
}

/** Данные для PDF-актов строятся только из снимка версии — не из текущих данных карточки. */
export function snapshotToActInput(s: DocumentSnapshot): ActDocInput {
  const startsAt = s.visit.startsAt ?? s.formedAt;
  return {
    issuer: s.issuer,
    contractNumber: s.number ?? PLACEHOLDER_NUMBER,
    contractDate: s.docDate,
    acceptanceDate: s.acceptanceDate,
    actDate: s.formedAt,
    lastName: s.client.lastName,
    firstName: s.client.firstName,
    patronymic: s.client.patronymic,
    carModel: s.vehicle?.label ?? null,
    vin: s.vehicle?.vin ?? null,
    plate: s.vehicle?.plate ?? null,
    year: s.vehicle?.year != null ? String(s.vehicle.year) : null,
    startsAt,
    endsAt: s.visit.endsAt ?? startsAt,
    priceRub: s.pricing?.preliminary ?? s.visit.priceRub ?? 0,
    serviceType: s.visit.serviceType,
    inspection: s.inspection,
    works: s.works,
    pricing: s.pricing,
    execution: s.execution,
    handover: s.handover,
    draft: s.draft,
    draftMissing: s.missing.map((m) => m.label),
  };
}

/**
 * Рисует документ по снимку версии. Для подписанных версий результат всегда тот же, что при формировании,
 * даже если потом исправили карточку клиента или автомобиля.
 */
export async function renderDocument(
  s: DocumentSnapshot,
  version?: number,
  /** Договор можно получить и в DOCX (для правок); по умолчанию — PDF, как и акты. */
  format: "pdf" | "docx" = "pdf",
): Promise<RenderedDocument> {
  const suffix = `${s.number ?? "chernovik"}${version ? `-v${version}` : ""}`;
  const base = `${SLUG[s.kind]}-${suffix}`;

  if (s.kind === "CONTRACT" && format === "docx") {
    const start = s.visit.startsAt ?? s.formedAt;
    const draftNote = s.draft
      ? s.missing.length > 0
        ? `ЧЕРНОВИК — документ не готов к подписанию. Не заполнено: ${s.missing.map((m) => m.label).join("; ")}.`
        : "ЧЕРНОВИК — предварительный просмотр, документ ещё не сформирован."
      : null;
    const blob = await fillContractDocx({
      issuer: s.issuer,
      contractNumber: s.number ?? PLACEHOLDER_NUMBER,
      docDate: s.docDate,
      mileageKm: s.inspection?.inspection?.mileageKm ?? null,
      draftNote,
      fio: fioParts(s) || "________________",
      phone: s.client.phone,
      birthDate: s.client.birthDate,
      carModel: s.vehicle?.label ?? "",
      vin: s.vehicle?.vin ?? null,
      plate: s.vehicle?.plate ?? null,
      year: s.vehicle?.year != null ? String(s.vehicle.year) : null,
      startsAt: start,
      endsAt: s.visit.endsAt ?? start,
      priceRub: s.pricing?.preliminary ?? s.visit.priceRub ?? 0,
      serviceType: s.visit.serviceType,
      works: s.works,
      pricing: s.pricing,
    });
    return { blob, filename: `${base}.docx`, format: "docx" };
  }

  const input = snapshotToActInput(s);
  const blob = await pdf(
    s.kind === "CONTRACT" ? (
      <ContractPdf {...input} phone={s.client.phone} birthDate={s.client.birthDate} />
    ) : s.kind === "ACCEPTANCE" ? (
      <AcceptanceActPdf {...input} />
    ) : (
      <CompletedWorksActPdf {...input} />
    ),
  ).toBlob();
  return { blob, filename: `${base}.pdf`, format: "pdf" };
}

export function downloadRendered(doc: RenderedDocument) {
  const url = URL.createObjectURL(doc.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** PDF — в новой вкладке (там же можно печатать); DOCX браузер показать не может, его скачивают. */
export function openRendered(doc: RenderedDocument, print = false) {
  if (doc.format !== "pdf") {
    downloadRendered(doc);
    return;
  }
  const url = URL.createObjectURL(doc.blob);
  const win = window.open(url, "_blank");
  if (win && print) {
    win.addEventListener("load", () => {
      win.focus();
      win.print();
    });
  }
}
