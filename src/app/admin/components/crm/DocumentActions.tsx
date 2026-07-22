"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import type { CrmAppointment, CrmClient } from "../../_lib/crmTypes";
import {
  downloadBlob,
  fillContractDocx,
} from "./contract/fillContractDocx";
import { AcceptanceActPdf } from "./pdf/AcceptanceActPdf";
import { CompletedWorksActPdf } from "./pdf/CompletedWorksActPdf";
import type { ActDocInput } from "./pdf/actShared";

type DocKind = "contract" | "acceptance" | "works";

type Props = {
  client: CrmClient;
  appointment: CrmAppointment;
  /** VIN из поля формы записи (может быть ещё не сохранён). */
  vin?: string | null;
  /** Дата/время начала из формы записи. */
  startsAt?: string | null;
  /** Дата/время окончания из формы записи. */
  endsAt?: string | null;
  priceRub?: number | null;
  serviceType?: string | null;
};

function buildActInput(
  client: CrmClient,
  appointment: CrmAppointment,
  overrides?: Pick<Props, "vin" | "startsAt" | "endsAt" | "priceRub" | "serviceType">,
): ActDocInput {
  const car =
    client.carModel?.trim() ||
    client.customCar?.trim() ||
    [client.carBrand, client.carModelName].filter(Boolean).join(" ").trim() ||
    null;

  return {
    contractNumber: appointment.id,
    lastName: client.lastName,
    firstName: client.firstName,
    patronymic: client.patronymic,
    fioFallback: client.fio,
    carModel: car,
    vin: overrides?.vin?.trim() || client.vin,
    plate: null,
    year: null,
    startsAt: overrides?.startsAt || appointment.startsAt,
    endsAt: overrides?.endsAt || appointment.endsAt,
    priceRub: overrides?.priceRub ?? appointment.priceRub,
    serviceType: overrides?.serviceType || appointment.serviceType,
  };
}

export function DocumentActions({
  client,
  appointment,
  vin,
  startsAt,
  endsAt,
  priceRub,
  serviceType,
}: Props) {
  const [busy, setBusy] = useState<DocKind | null>(null);
  const overrides = { vin, startsAt, endsAt, priceRub, serviceType };

  const downloadContract = async () => {
    setBusy("contract");
    try {
      const act = buildActInput(client, appointment, overrides);
      const blob = await fillContractDocx({
        contractNumber: appointment.id,
        fio: client.fio,
        phone: client.phone,
        birthDate: client.birthDate,
        carModel: act.carModel || "",
        vin: act.vin,
        startsAt: act.startsAt,
        endsAt: act.endsAt,
        priceRub: act.priceRub,
        serviceType: act.serviceType,
      });
      downloadBlob(blob, `dogovor-${appointment.id}.docx`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Не удалось сформировать договор",
      );
    } finally {
      setBusy(null);
    }
  };

  const downloadAcceptance = async () => {
    setBusy("acceptance");
    try {
      const blob = await pdf(
        <AcceptanceActPdf {...buildActInput(client, appointment, overrides)} />,
      ).toBlob();
      downloadBlob(blob, `akt-priema-${appointment.id}.pdf`);
    } catch {
      toast.error("Не удалось сформировать акт приёма-передачи");
    } finally {
      setBusy(null);
    }
  };

  const downloadWorks = async () => {
    setBusy("works");
    try {
      const blob = await pdf(
        <CompletedWorksActPdf
          {...buildActInput(client, appointment, overrides)}
        />,
      ).toBlob();
      downloadBlob(blob, `akt-rabot-${appointment.id}.pdf`);
    } catch {
      toast.error("Не удалось сформировать акт выполненных работ");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={busy !== null}
        onClick={() => void downloadContract()}
      >
        {busy === "contract" ? "Договор…" : "Договор"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={busy !== null}
        onClick={() => void downloadAcceptance()}
      >
        {busy === "acceptance" ? "Акт приёма…" : "Акт приёма-передачи"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={busy !== null}
        onClick={() => void downloadWorks()}
      >
        {busy === "works" ? "Акт работ…" : "Акт выполненных работ"}
      </Button>
    </div>
  );
}
