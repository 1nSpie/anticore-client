"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { Textarea } from "@/shadcn/textarea";
import { Checkbox } from "@/shadcn/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/select";
import { PhoneRuInput } from "@/components/PhoneRuInput";
import { adminApi } from "../../_lib/api";
import {
  isEndNotAfterStart,
  shiftEndWithStart,
  toLocalInput,
} from "../../_lib/appointmentTime";
import type {
  ClientVehicle,
  CrmAppointment,
  CrmClient,
  ServiceType,
  SiteLead,
  SiteLeadStatus,
} from "../../_lib/crmTypes";
import {
  CRM_LOCATIONS,
  CRM_LOCATION_LABELS,
  DEFAULT_CRM_LOCATION,
  type CrmLocationCode,
} from "../../_lib/crmLocations";
import {
  hasAdminNote,
  requiresAdminNoteOnStatusChange,
  STATUS_HINTS,
  STATUS_LABELS,
  VISIT_DRIVEN_STATUSES,
} from "../../_lib/leadStatus";
import { CarCatalogFields } from "../cars/CarCatalogFields";
import { useCarCatalog } from "../cars/useCarCatalog";
import { SegmentPricePreview } from "../prices/SegmentPricePreview";
import type { Brand, Car } from "../../_lib/types";
import {
  formatPhoneRuDisplay,
  formatPhoneRuDisplaySafe,
  normalizePhoneRu,
  PHONE_RU_INPUT_PREFIX,
  phonesMatchRu,
} from "@/lib/phoneRu";
import { getVinValidationError } from "@/lib/vin";
import { toast } from "sonner";
import { DayCapacityHint } from "../crm/DayCapacityHint";

const fieldClass = "border-white/20 bg-slate-800 text-white";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: SiteLead | null;
  /** take = из «Взять в работу», edit = продолжить */
  mode?: "take" | "edit";
  serviceTypes: ServiceType[];
  onSaved: () => void | Promise<void>;
};

type LeadForm = {
  name: string;
  phone: string;
  message: string;
  brand: string;
  model: string;
  customCar: string;
  isNotInCatalog: boolean;
  communicationMethod: string;
  adminNote: string;
  status: SiteLeadStatus;
  location: CrmLocationCode | "";
  /** Дата возврата для «На уточнении» (YYYY-MM-DD). */
  followUpAt: string;
};

type ClientMode = "loading" | "existing" | "create";

function splitLeadName(name: string): { lastName: string; firstName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { lastName: "", firstName: "" };
  if (parts.length === 1) return { lastName: "", firstName: parts[0] };
  return { lastName: parts[0], firstName: parts.slice(1).join(" ") };
}

function parseCarDescription(
  text: string | null | undefined,
  brandNames: string[],
): Pick<LeadForm, "brand" | "model" | "customCar" | "isNotInCatalog"> {
  const raw = (text ?? "").trim();
  if (!raw) {
    return { brand: "", model: "", customCar: "", isNotInCatalog: false };
  }
  if (brandNames.length === 0) {
    return { brand: "", model: "", customCar: raw, isNotInCatalog: true };
  }
  const sorted = [...brandNames].sort((a, b) => b.length - a.length);
  for (const brand of sorted) {
    if (raw.toLowerCase().startsWith(brand.toLowerCase())) {
      const rest = raw
        .slice(brand.length)
        .trim()
        .replace(/^[\s,/|\-–—]+/, "");
      return { brand, model: rest, customCar: "", isNotInCatalog: false };
    }
  }
  return { brand: "", model: "", customCar: raw, isNotInCatalog: true };
}

function buildCarDescription(form: LeadForm): string | null {
  if (form.isNotInCatalog) return form.customCar.trim() || null;
  const parts = [form.brand.trim(), form.model.trim()].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

function defaultSlot() {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  if (start.getHours() >= 20) {
    start.setDate(start.getDate() + 1);
    start.setHours(10, 0, 0, 0);
  } else {
    start.setHours(Math.max(start.getHours() + 1, 10), 0, 0, 0);
  }
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

function leadToForm(lead: SiteLead, mode: "take" | "edit"): LeadForm {
  const takeStatus =
    mode === "take" &&
    (lead.status === "NEW" || lead.status === "NEEDS_CLARIFICATION")
      ? "PROCESSING"
      : lead.status;

  return {
    name: lead.name,
    phone: formatPhoneRuDisplay(lead.phone),
    message: lead.message ?? "",
    brand: "",
    model: "",
    customCar: lead.carDescription ?? "",
    isNotInCatalog: Boolean(lead.carDescription?.trim()),
    communicationMethod: lead.communicationMethod ?? "",
    adminNote: lead.adminNote ?? "",
    status: takeStatus,
    location: lead.location ?? "",
    followUpAt: lead.followUpAt?.slice(0, 10) ?? "",
  };
}

export function LeadScheduleDialog({
  open,
  onOpenChange,
  lead,
  mode = "take",
  serviceTypes,
  onSaved,
}: Props) {
  const [leadForm, setLeadForm] = useState<LeadForm | null>(null);
  const [carParsed, setCarParsed] = useState(false);

  const [clientMode, setClientMode] = useState<ClientMode>("loading");
  const [selectedClient, setSelectedClient] = useState<CrmClient | null>(null);
  const [matchedClients, setMatchedClients] = useState<CrmClient[]>([]);

  const [createLastName, setCreateLastName] = useState("");
  const [createFirstName, setCreateFirstName] = useState("");
  const [vin, setVin] = useState("");
  const [vinError, setVinError] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState("");

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const endInvalid = isEndNotAfterStart(startsAt, endsAt);
  const [serviceType, setServiceType] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState("");
  const [priceRub, setPriceRub] = useState("0");
  const [managerName, setManagerName] = useState("");
  const [location, setLocation] = useState<CrmLocationCode>(DEFAULT_CRM_LOCATION);

  const [saving, setSaving] = useState(false);

  const leadBrand = leadForm?.brand ?? "";
  const { brands, cars, resolveCarId, resolveCarSegment, reloadBrands } =
    useCarCatalog(leadBrand);
  const brandNames = useMemo(() => brands.map((b) => b.name), [brands]);
  const clientVehicles: ClientVehicle[] = selectedClient?.vehicles ?? [];

  const syncCreateFromLead = useCallback((form: LeadForm) => {
    const names = splitLeadName(form.name);
    setCreateLastName(names.lastName);
    setCreateFirstName(names.firstName);
  }, []);

  const findClientByPhone = useCallback(async (rawPhone: string) => {
    setClientMode("loading");
    setSelectedClient(null);
    setMatchedClients([]);
    setVehicleId("");
    try {
      const digits = rawPhone.replace(/\D/g, "");
      const { data } = await adminApi.get<{ items: CrmClient[] }>(
        "/crm/clients",
        { params: { q: digits || rawPhone, limit: 20 } },
      );
      const matches = data.items.filter((c) => phonesMatchRu(c.phone, rawPhone));
      setMatchedClients(matches);
      if (matches.length === 1) {
        setSelectedClient(matches[0]);
        setClientMode("existing");
        const primary =
          matches[0].vehicles?.find((v) => v.isPrimary) ??
          matches[0].vehicles?.[0];
        setVehicleId(primary ? String(primary.id) : "");
        setVin(primary?.vin ?? matches[0].vin ?? "");
      } else if (matches.length > 1) {
        setClientMode("existing");
      } else {
        setClientMode("create");
      }
    } catch {
      setClientMode("create");
    }
  }, []);

  useEffect(() => {
    if (!open || !lead) return;
    void reloadBrands();
    const form = leadToForm(lead, mode);
    setLeadForm(form);
    setCarParsed(false);
    setVin("");
    setVinError(null);
    setLocation(
      (lead.location as CrmLocationCode | null) ?? DEFAULT_CRM_LOCATION,
    );
    const slot = defaultSlot();
    setStartsAt(toLocalInput(slot.start));
    setEndsAt(toLocalInput(slot.end));
    setServiceType(serviceTypes[0]?.name ?? "");
    setServiceTypeId(serviceTypes[0] ? String(serviceTypes[0].id) : "");
    setPriceRub("0");
    setManagerName("");
    syncCreateFromLead(form);
    void findClientByPhone(lead.phone);
  }, [
    open,
    lead,
    mode,
    serviceTypes,
    reloadBrands,
    findClientByPhone,
    syncCreateFromLead,
  ]);

  useEffect(() => {
    if (!leadForm || carParsed || brandNames.length === 0 || !lead) return;
    const parsed = parseCarDescription(lead.carDescription, brandNames);
    setLeadForm((f) =>
      f
        ? {
            ...f,
            brand: parsed.brand,
            model: parsed.model,
            customCar: parsed.customCar,
            isNotInCatalog: parsed.isNotInCatalog,
          }
        : f,
    );
    setCarParsed(true);
  }, [brandNames, carParsed, leadForm, lead]);

  useEffect(() => {
    if (!carParsed || !leadForm || clientMode !== "create") return;
    syncCreateFromLead(leadForm);
  }, [carParsed, leadForm, clientMode, syncCreateFromLead]);

  useEffect(() => {
    if (!selectedClient || !vehicleId) return;
    const v = clientVehicles.find((x) => String(x.id) === vehicleId);
    if (v) setVin(v.vin ?? "");
  }, [vehicleId, selectedClient, clientVehicles]);

  const selectExisting = (client: CrmClient) => {
    setSelectedClient(client);
    setClientMode("existing");
    const primary =
      client.vehicles?.find((v) => v.isPrimary) ?? client.vehicles?.[0];
    setVehicleId(primary ? String(primary.id) : "");
    setVin(primary?.vin ?? client.vin ?? "");
  };

  const switchToCreate = () => {
    setSelectedClient(null);
    setVehicleId("");
    setClientMode("create");
    if (leadForm) syncCreateFromLead(leadForm);
  };

  const persistLead = async (): Promise<SiteLead | null> => {
    if (!lead || !leadForm) return null;
    if (!leadForm.name.trim()) {
      toast.error("Укажите имя");
      return null;
    }
    if (!leadForm.phone.trim() || leadForm.phone === PHONE_RU_INPUT_PREFIX) {
      toast.error("Укажите телефон");
      return null;
    }
    if (!leadForm.isNotInCatalog && (leadForm.brand || leadForm.model)) {
      if (!leadForm.brand || !leadForm.model) {
        toast.error("Выберите марку и модель автомобиля");
        return null;
      }
    }
    let phone: string;
    try {
      phone = normalizePhoneRu(leadForm.phone);
    } catch {
      toast.error("Укажите мобильный номер России: +79…");
      return null;
    }
    if (
      requiresAdminNoteOnStatusChange(lead.status, leadForm.status) &&
      !hasAdminNote(leadForm.adminNote)
    ) {
      toast.error("Укажите комментарий администратора");
      return null;
    }
    if (!leadForm.location) {
      toast.error("Выберите город (филиал)");
      return null;
    }
    if (leadForm.status === "NEEDS_CLARIFICATION" && !leadForm.followUpAt) {
      toast.error("Для «На уточнении» укажите день, когда вернуться к заявке");
      return null;
    }

    const { data } = await adminApi.patch<SiteLead>(`/crm/leads/${lead.id}`, {
      name: leadForm.name.trim(),
      phone,
      message: leadForm.message.trim() || null,
      carDescription: buildCarDescription(leadForm),
      communicationMethod: leadForm.communicationMethod || null,
      adminNote: leadForm.adminNote.trim() || null,
      status: leadForm.status,
      location: leadForm.location,
      ...(leadForm.status === "NEEDS_CLARIFICATION" && {
        followUpAt: leadForm.followUpAt,
      }),
    });
    return data;
  };

  const buildCarPayload = (opts: {
    brand: string;
    model: string;
    customCar: string;
    isNotInCatalog: boolean;
    resolveId: (model: string) => number | null;
  }) => {
    if (opts.isNotInCatalog) {
      const text = opts.customCar.trim();
      return text
        ? { carId: null as number | null, customCar: text }
        : { carId: undefined, customCar: undefined };
    }
    if (opts.brand || opts.model) {
      if (!opts.brand || !opts.model) {
        throw new Error("Выберите марку и модель из каталога");
      }
      const id = opts.resolveId(opts.model);
      if (!id) throw new Error("Модель не найдена в каталоге");
      return { carId: id, customCar: null as string | null };
    }
    return { carId: undefined, customCar: undefined };
  };

  const ensureClientAndVehicle = async (): Promise<{
    clientId: number;
    vehicleId: number | null;
  }> => {
    if (vin.trim()) {
      const err = getVinValidationError(vin);
      if (err) {
        setVinError(err);
        throw new Error(err);
      }
    }

    if (clientMode === "existing" && selectedClient) {
      let nextVehicleId = vehicleId ? Number(vehicleId) : null;
      if (!nextVehicleId && clientVehicles.length === 0 && leadForm) {
        const car = buildCarPayload({
          brand: leadForm.brand,
          model: leadForm.model,
          customCar: leadForm.customCar,
          isNotInCatalog: leadForm.isNotInCatalog,
          resolveId: resolveCarId,
        });
        if (car.carId != null || car.customCar || vin.trim()) {
          const { data: vehicle } = await adminApi.post<ClientVehicle>(
            `/crm/clients/${selectedClient.id}/vehicles`,
            {
              carId: car.carId ?? null,
              customLabel: car.customCar ?? null,
              vin: vin.trim().toUpperCase() || null,
              isPrimary: true,
            },
          );
          nextVehicleId = vehicle.id;
        }
      } else if (nextVehicleId && vin.trim()) {
        const current = clientVehicles.find((v) => v.id === nextVehicleId);
        const prev = current?.vin?.trim().toUpperCase() || null;
        const next = vin.trim().toUpperCase();
        if (next !== prev) {
          await adminApi.patch(
            `/crm/clients/${selectedClient.id}/vehicles/${nextVehicleId}`,
            { vin: next },
          );
        }
      }
      return { clientId: selectedClient.id, vehicleId: nextVehicleId };
    }

    if (!leadForm) throw new Error("Нет данных заявки");
    const phone = normalizePhoneRu(leadForm.phone);
    const car = buildCarPayload({
      brand: leadForm.brand,
      model: leadForm.model,
      customCar: leadForm.customCar,
      isNotInCatalog: leadForm.isNotInCatalog,
      resolveId: resolveCarId,
    });

    const { data: created } = await adminApi.post<CrmClient>("/crm/clients", {
      phone,
      ...(createLastName.trim() && { lastName: createLastName.trim() }),
      ...(createFirstName.trim() && { firstName: createFirstName.trim() }),
      ...(car.carId !== undefined && { carId: car.carId }),
      ...(car.customCar !== undefined && { customCar: car.customCar }),
      ...(vin.trim() && { vin: vin.trim().toUpperCase() }),
    });

    const primary =
      created.vehicles?.find((v) => v.isPrimary) ?? created.vehicles?.[0];
    return { clientId: created.id, vehicleId: primary?.id ?? null };
  };

  const saveLeadOnly = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const updated = await persistLead();
      if (!updated) return;
      toast.success(
        mode === "take" ? "Заявка взята в работу" : "Заявка сохранена",
      );
      await onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Не удалось сохранить заявку");
    } finally {
      setSaving(false);
    }
  };

  const saveAndBook = async () => {
    if (!lead || !leadForm || saving) return;
    if (clientMode === "loading") {
      toast.error("Подождите, ищем клиента…");
      return;
    }
    if (clientMode === "existing" && !selectedClient) {
      toast.error("Выберите клиента или создайте нового");
      return;
    }
    if (
      clientMode === "existing" &&
      selectedClient &&
      (selectedClient.vehicles?.length ?? 0) > 0 &&
      !vehicleId
    ) {
      toast.error("Выберите автомобиль клиента");
      return;
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error("Укажите дату и время");
      return;
    }
    if (end <= start) {
      toast.error("Окончание должно быть позже начала");
      return;
    }
    if (!serviceType.trim()) {
      toast.error("Укажите услугу");
      return;
    }
    if (
      requiresAdminNoteOnStatusChange(lead.status, "SCHEDULED") &&
      !hasAdminNote(leadForm.adminNote)
    ) {
      toast.error("Укажите комментарий администратора перед записью");
      return;
    }

    setSaving(true);
    try {
      // Статус PROCESSING при взятии; запись выставит SCHEDULED / IN_PROGRESS через leadId
      const updated = await persistLead();
      if (!updated) return;

      const { clientId, vehicleId: resolvedVehicleId } =
        await ensureClientAndVehicle();

      const bookLocation =
        (leadForm.location as CrmLocationCode) || location;

      const { data } = await adminApi.post<
        CrmAppointment & { smsError?: string | null }
      >("/crm/appointments", {
        clientId,
        ...(resolvedVehicleId ? { vehicleId: resolvedVehicleId } : {}),
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        serviceType: serviceType.trim(),
        serviceTypeId: serviceTypeId ? Number(serviceTypeId) : undefined,
        priceRub: Number(priceRub) || 0,
        managerName: managerName.trim() || undefined,
        location: bookLocation,
        leadId: lead.id,
      });

      toast.success("Клиент и запись созданы");
      if (data.smsError) toast.error(data.smsError);
      await onSaved();
      onOpenChange(false);
    } catch (e: unknown) {
      const msg = (
        e as {
          response?: { data?: { message?: string | string[] } };
          message?: string;
        }
      )?.response?.data?.message;
      const text = Array.isArray(msg)
        ? msg.join(", ")
        : typeof msg === "string"
          ? msg
          : e instanceof Error
            ? e.message
            : "Не удалось записать";
      toast.error(text);
    } finally {
      setSaving(false);
    }
  };

  if (!lead || !leadForm) return null;

  const clientToggle =
    clientMode === "existing" ? (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-emerald-300"
        onClick={switchToCreate}
      >
        Создать нового
      </Button>
    ) : clientMode === "create" && matchedClients.length > 0 ? (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-emerald-300"
        onClick={() => setClientMode("existing")}
      >
        Выбрать найденного
      </Button>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-slate-900 text-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === "take"
              ? `Оформить запись · заявка #${lead.id}`
              : `Оформить запись · #${lead.id}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Контакт + статус */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Имя *</Label>
              <Input
                className={fieldClass}
                value={leadForm.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setLeadForm((f) => (f ? { ...f, name } : f));
                  if (clientMode === "create") {
                    const n = splitLeadName(name);
                    setCreateLastName(n.lastName);
                    setCreateFirstName(n.firstName);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Телефон *</Label>
              <PhoneRuInput
                className={fieldClass}
                value={leadForm.phone}
                onChange={(e) =>
                  setLeadForm((f) => (f ? { ...f, phone: e.target.value } : f))
                }
                onBlur={() => {
                  if (leadForm.phone.trim()) {
                    void findClientByPhone(leadForm.phone);
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Способ связи</Label>
              <Select
                value={leadForm.communicationMethod || "none"}
                onValueChange={(v) =>
                  setLeadForm((f) =>
                    f
                      ? {
                          ...f,
                          communicationMethod: v === "none" ? "" : v,
                        }
                      : f,
                  )
                }
              >
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Не указан" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не указан</SelectItem>
                  <SelectItem value="phone">Телефон</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Статус заявки</Label>
              <Select
                value={leadForm.status}
                onValueChange={(v) =>
                  setLeadForm((f) =>
                    f ? { ...f, status: v as SiteLeadStatus } : f,
                  )
                }
              >
                <SelectTrigger className={fieldClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as SiteLeadStatus[])
                    .filter((s) => !VISIT_DRIVEN_STATUSES.includes(s))
                    .map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {STATUS_HINTS[leadForm.status] ? (
                <p className="text-xs text-slate-500">
                  {STATUS_HINTS[leadForm.status]}
                </p>
              ) : null}
              {leadForm.status === "NEEDS_CLARIFICATION" ? (
                <div className="space-y-1 pt-1">
                  <Label className="text-xs text-orange-300">
                    Вернуться к заявке *
                  </Label>
                  <Input
                    type="date"
                    className={fieldClass}
                    value={leadForm.followUpAt}
                    onChange={(e) =>
                      setLeadForm((f) =>
                        f ? { ...f, followUpAt: e.target.value } : f,
                      )
                    }
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* Карточка клиента — сразу после контакта */}
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-200">
                Карточка клиента
              </p>
              {clientToggle}
            </div>

            {clientMode === "loading" ? (
              <p className="text-sm text-slate-400">Ищем по телефону…</p>
            ) : null}

            {clientMode === "existing" &&
            matchedClients.length > 1 &&
            !selectedClient ? (
              <ul className="space-y-2">
                {matchedClients.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => selectExisting(c)}
                      className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-left text-sm hover:border-emerald-500/40"
                    >
                      <span className="font-medium text-white">{c.fio}</span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {formatPhoneRuDisplaySafe(c.phone)}
                        {c.carModel ? ` · ${c.carModel}` : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {clientMode === "existing" && selectedClient ? (
              <div className="space-y-2">
                <p className="text-white">
                  {selectedClient.fio}
                  <span className="ml-2 text-xs font-normal text-emerald-300/90">
                    найден в базе
                  </span>
                </p>
                <p className="text-xs text-slate-400">
                  {formatPhoneRuDisplaySafe(selectedClient.phone)}
                  {selectedClient.carModel
                    ? ` · ${selectedClient.carModel}`
                    : ""}
                </p>
                <Link
                  href={`/admin/clients/${selectedClient.id}`}
                  className="inline-block text-xs text-emerald-300 hover:underline"
                >
                  Открыть полную карточку
                </Link>
              </div>
            ) : null}

            {clientMode === "create" ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  В базе нет — создадим карточку вместе с записью. ФИО и авто
                  берутся из полей выше.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Фамилия в карточке</Label>
                    <Input
                      className={fieldClass}
                      value={createLastName}
                      onChange={(e) => setCreateLastName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Имя в карточке</Label>
                    <Input
                      className={fieldClass}
                      value={createFirstName}
                      onChange={(e) => setCreateFirstName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Авто — одно на заявку и клиента */}
          <div className="space-y-3">
            <CarFields
              brand={leadForm.brand}
              model={leadForm.model}
              customCar={leadForm.customCar}
              isNotInCatalog={leadForm.isNotInCatalog}
              brands={brands}
              cars={cars}
              onBrandChange={(brand) =>
                setLeadForm((f) => (f ? { ...f, brand, model: "" } : f))
              }
              onModelChange={(model) =>
                setLeadForm((f) => (f ? { ...f, model } : f))
              }
              onCustomCarChange={(customCar) =>
                setLeadForm((f) => (f ? { ...f, customCar } : f))
              }
              onNotInCatalogChange={(on) =>
                setLeadForm((f) =>
                  f
                    ? {
                        ...f,
                        isNotInCatalog: on,
                        ...(on ? { brand: "", model: "" } : { customCar: "" }),
                      }
                    : f,
                )
              }
              resolveCarSegment={resolveCarSegment}
            />

            {clientMode === "existing" &&
            selectedClient &&
            clientVehicles.length > 0 ? (
              <div className="space-y-2">
                <Label>Автомобиль для этой записи</Label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Выберите авто" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientVehicles.map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.label || `Авто #${v.id}`}
                        {v.isPrimary ? " · основное" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>VIN</Label>
              <Input
                className={`${fieldClass} font-mono`}
                value={vin}
                maxLength={17}
                placeholder="необязательно"
                onChange={(e) => {
                  const v = e.target.value.toUpperCase();
                  setVin(v);
                  setVinError(v.trim() ? getVinValidationError(v) : null);
                }}
              />
              {vinError ? (
                <p className="text-xs text-red-400">{vinError}</p>
              ) : null}
            </div>
          </div>

          {/* Визит — продолжение той же формы */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Филиал *</Label>
              <Select
                value={leadForm.location || undefined}
                onValueChange={(v) => {
                  setLeadForm((f) =>
                    f ? { ...f, location: v as CrmLocationCode } : f,
                  );
                  setLocation(v as CrmLocationCode);
                }}
              >
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent>
                  {CRM_LOCATIONS.map((code) => (
                    <SelectItem key={code} value={code}>
                      {CRM_LOCATION_LABELS[code]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Услуга</Label>
              <Select
                value={serviceTypeId}
                onValueChange={(v) => {
                  setServiceTypeId(v);
                  const t = serviceTypes.find((s) => String(s.id) === v);
                  if (t) setServiceType(t.name);
                }}
              >
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder="Из списка" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Название услуги</Label>
            <Input
              className={fieldClass}
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="Можно уточнить вручную"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Начало *</Label>
              <Input
                type="datetime-local"
                className={fieldClass}
                value={startsAt}
                onChange={(e) => {
                  const next = e.target.value;
                  // Окончание едет вместе с началом (длительность сохраняется)
                  setEndsAt((end) => shiftEndWithStart(startsAt, next, end));
                  setStartsAt(next);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Окончание *</Label>
              <Input
                type="datetime-local"
                className={cn(fieldClass, endInvalid && "border-red-500/70")}
                min={startsAt || undefined}
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
              {endInvalid ? (
                <p className="text-xs text-red-400">
                Окончание должно быть позже начала
                </p>
              ) : null}
            </div>
          </div>
          <DayCapacityHint startsAt={startsAt} location={leadForm.location} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Стоимость (руб.)</Label>
              <Input
                type="number"
                min={0}
                className={fieldClass}
                value={priceRub}
                onChange={(e) => setPriceRub(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Менеджер</Label>
              <Input
                className={fieldClass}
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="необязательно"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Сообщение клиента</Label>
            <Textarea
              rows={2}
              className={fieldClass}
              value={leadForm.message}
              onChange={(e) =>
                setLeadForm((f) =>
                  f ? { ...f, message: e.target.value } : f,
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Комментарий администратора</Label>
            <Textarea
              rows={2}
              className={fieldClass}
              value={leadForm.adminNote}
              onChange={(e) =>
                setLeadForm((f) =>
                  f ? { ...f, adminNote: e.target.value } : f,
                )
              }
            />
            {lead.status === "NEW" ? (
              <p className="text-xs text-slate-500">
                Обязателен при записи из статуса «Новая».
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="border-white/20"
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={() => void saveLeadOnly()}
          >
            {saving ? "…" : "Только сохранить заявку"}
          </Button>
          <Button
            type="button"
            disabled={saving || clientMode === "loading"}
            onClick={() => void saveAndBook()}
          >
            {saving
              ? "…"
              : clientMode === "create"
                ? "Создать клиента и записать"
                : "Записать в календарь"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CarFields({
  brand,
  model,
  customCar,
  isNotInCatalog,
  brands,
  cars,
  onBrandChange,
  onModelChange,
  onCustomCarChange,
  onNotInCatalogChange,
  resolveCarSegment,
}: {
  brand: string;
  model: string;
  customCar: string;
  isNotInCatalog: boolean;
  brands: Brand[];
  cars: Car[];
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
  onCustomCarChange: (v: string) => void;
  onNotInCatalogChange: (v: boolean) => void;
  resolveCarSegment: (model: string) => number | null;
}) {
  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox
          checked={isNotInCatalog}
          onCheckedChange={(v) => onNotInCatalogChange(v === true)}
          className="border-white/20 data-[state=checked]:bg-emerald-600"
        />
        <span className="text-sm text-slate-200">Авто нет в каталоге</span>
      </label>
      {isNotInCatalog ? (
        <Input
          className={fieldClass}
          placeholder="Марка и модель"
          value={customCar}
          onChange={(e) => onCustomCarChange(e.target.value)}
        />
      ) : (
        <>
          <CarCatalogFields
            brand={brand}
            model={model}
            brands={brands}
            cars={cars}
            onBrandChange={onBrandChange}
            onModelChange={onModelChange}
            inputClassName={fieldClass}
          />
          {model ? (
            <SegmentPricePreview
              segment={resolveCarSegment(model)}
              brand={brand}
              model={model}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
