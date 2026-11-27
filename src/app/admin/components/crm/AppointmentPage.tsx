"use client";

import { safeCalendarBack, withBack } from "../../_lib/calendarBack";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/select";
import { adminApi } from "../../_lib/api";
import { withDayLimitOverride, withIgnoreFlag } from "../../_lib/dayLimitOverride";
import {
  isEndNotAfterStart,
  shiftEndWithStart,
  toLocalInput,
} from "../../_lib/appointmentTime";
import type { CrmAppointment, CrmClient, ClientVehicle, ServiceType } from "../../_lib/crmTypes";
import {
  CRM_LOCATIONS,
  CRM_LOCATION_LABELS,
  DEFAULT_CRM_LOCATION,
  isCrmLocation,
  type CrmLocationCode,
} from "../../_lib/crmLocations";
import { toast } from "sonner";
import { ClientQuickCreate } from "./ClientQuickCreate";
import { ClientSearchAutocomplete } from "./ClientSearchAutocomplete";
import { AcceptanceForm } from "./AcceptanceForm";
import { DocumentsPanel } from "./DocumentsPanel";
import { ExecutionPanel } from "./ExecutionPanel";
import { HandoverForm } from "./HandoverForm";
import { WorkItemsEditor } from "./WorkItemsEditor";
import { AssignMastersSection } from "./AssignMastersSection";
import { VisitPayrollPanel } from "../money/VisitPayrollPanel";
import type { WorksView } from "../../_lib/servicesTypes";
import { DayCapacityHint } from "./DayCapacityHint";
import { getVinValidationError } from "@/lib/vin";
import { getPlateError, getVehicleYearError, normalizePlateInput } from "@/lib/vehicle";
import { useQueryParams, withQuery } from "../../_lib/useQueryParams";

type Tab = "details" | "acceptance" | "works" | "execution" | "handover" | "documents";
/** Порядок вкладок — по ходу обслуживания (ТЗ §25): запись → приёмка → согласование → выполнение → выдача → документы. */
const TABS: { id: Tab; label: string }[] = [
  { id: "details", label: "Запись" },
  { id: "acceptance", label: "Приёмка" },
  { id: "works", label: "Согласованные работы" },
  { id: "execution", label: "Выполнение" },
  { id: "handover", label: "Выдача" },
  { id: "documents", label: "Документы" },
];

function defaultSlot() {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  if (start.getHours() >= 20) {
    start.setDate(start.getDate() + 1);
    start.setHours(9, 0, 0, 0);
  } else {
    start.setHours(start.getHours() + 1);
  }
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

function appointmentClientPreset(
  appointment: CrmAppointment,
): Pick<CrmClient, "id" | "fio" | "phone"> {
  const c = appointment.client;
  const fio =
    [c.lastName, c.firstName, c.patronymic].filter(Boolean).join(" ") || c.phone;
  return { id: c.id, fio, phone: c.phone };
}

/**
 * Страница записи: `/admin/appointments/new` (новая) и `/admin/appointments/<id>` (существующая).
 * Состояние в адресе: `?tab=details|works|acceptance|documents`, `?item=` (позиция работ), `?focus=` (поле приёмки),
 * для новой записи — `start`, `end`, `location`, `lead`, `q`, `newClient=1`.
 */
export function AppointmentPage({ appointmentId }: { appointmentId: number | null }) {
  const router = useRouter();
  const { params, pathname, set } = useQueryParams();
  const tab: Tab =
    appointmentId == null
      ? "details"
      : (TABS.find((t) => t.id === params.get("tab"))?.id ?? "details");

  const [appointment, setAppointment] = useState<CrmAppointment | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pageLoading, setPageLoading] = useState(appointmentId != null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [typesLoaded, setTypesLoaded] = useState(false);

  const leadId = Number(params.get("lead")) || null;
  const initialClientQuery = params.get("q") ?? undefined;
  const queryLocation = params.get("location") ?? "";
  const defaultLocation: CrmLocationCode = isCrmLocation(queryLocation)
    ? queryLocation
    : DEFAULT_CRM_LOCATION;
  const backHref = safeCalendarBack(params.get("back"));
  const slotStart = params.get("start");
  const slotEnd = params.get("end");
  const quickCreateOpen = params.get("newClient") === "1";
  const openQuickCreate = () => set({ newClient: 1 });
  const setQuickCreateOpen = (open: boolean) => set({ newClient: open ? 1 : null });

  const reload = useCallback(async () => {
    if (appointmentId == null) return;
    try {
      const { data } = await adminApi.get<CrmAppointment>(`/crm/appointments/${appointmentId}`);
      setAppointment(data);
      setNotFound(false);
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 404) setNotFound(true);
      else toast.error("Не удалось загрузить запись");
    } finally {
      setPageLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    adminApi
      .get<ServiceType[]>("/crm/settings/service-types")
      .then((r) => setServiceTypes(r.data))
      .catch(() => setServiceTypes([]))
      .finally(() => setTypesLoaded(true));
  }, []);

  const ready = typesLoaded && !pageLoading;

  // Перечень работ нужен и на вкладке «Запись»: от него зависит, считаются ли цена и услуга автоматически
  useEffect(() => {
    if (appointmentId == null || !appointment) return;
    adminApi
      .get<WorksView>(`/crm/appointments/${appointmentId}/works`)
      .then((r) => setWorks(r.data))
      .catch(() => undefined);
  }, [appointmentId, appointment]);

  const [selectedClient, setSelectedClient] = useState<CrmClient | null>(null);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState<string>("");
  const [priceRub, setPriceRub] = useState("0");
  const [managerName, setManagerName] = useState("");
  const [masterComment, setMasterComment] = useState("");
  const [location, setLocation] = useState<CrmLocationCode>(defaultLocation);
  const [loading, setLoading] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [vin, setVin] = useState("");
  const [vinError, setVinError] = useState<string | null>(null);
  const [year, setYear] = useState("");
  const [yearError, setYearError] = useState<string | null>(null);
  const [plate, setPlate] = useState("");
  const [plateError, setPlateError] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState<string>("");
  const [reviewSmsSentAt, setReviewSmsSentAt] = useState<string | null>(null);
  const [sendingReview, setSendingReview] = useState(false);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [closeLink, setCloseLink] = useState("");
  const [closing, setClosing] = useState(false);
  /** Перечень согласованных работ: из него считаются цена и название услуги записи. */
  const [works, setWorks] = useState<WorksView | null>(null);
  const worksLocked = (works?.items.length ?? 0) > 0;
  const priceLocked = worksLocked && works?.pricing.preliminary != null;

  const clientVehicles: ClientVehicle[] = selectedClient?.vehicles ?? [];
  const endInvalid = isEndNotAfterStart(startsAt, endsAt);

  /** Окончание едет вместе с началом (длительность сохраняется). */
  const changeStartsAt = (next: string) => {
    setEndsAt((end) => shiftEndWithStart(startsAt, next, end));
    setStartsAt(next);
  };

  useEffect(() => {
    if (!ready) return;
    if (appointment) {
      setStartsAt(toLocalInput(appointment.startsAt));
      setEndsAt(toLocalInput(appointment.endsAt));
      setServiceType(appointment.serviceType);
      setServiceTypeId(
        appointment.serviceTypeId ? String(appointment.serviceTypeId) : "",
      );
      setPriceRub(String(appointment.priceRub));
      setManagerName(appointment.managerName ?? "");
      setMasterComment(appointment.masterComment ?? "");
      setLocation(appointment.location ?? defaultLocation);
      setReviewSmsSentAt(appointment.reviewSmsSentAt ?? null);
      setCompletedAt(appointment.completedAt ?? null);
      setCloseLink(appointment.diskLink ?? "");
      setVehicleId(
        appointment.vehicleId ? String(appointment.vehicleId) : "",
      );

      void adminApi
        .get<CrmClient>(`/crm/clients/${appointment.clientId}`)
        .then(({ data }) => setSelectedClient(data))
        .catch(() => setSelectedClient(null));
    } else {
      setSelectedClient(null);
      const timeSlot = slotStart && slotEnd && !Number.isNaN(Date.parse(slotStart)) ? { start: slotStart, end: slotEnd } : defaultSlot();
      setStartsAt(toLocalInput(timeSlot.start));
      setEndsAt(toLocalInput(timeSlot.end));
      setServiceType(serviceTypes[0]?.name ?? "");
      setServiceTypeId(serviceTypes[0] ? String(serviceTypes[0].id) : "");
      setPriceRub("0");
      setManagerName("");
      setMasterComment("");
      setLocation(defaultLocation);
      setReviewSmsSentAt(null);
      setVehicleId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- форму заполняем при загрузке записи и справочника, а не при смене вкладки
  }, [ready, appointment, slotStart, slotEnd, serviceTypes, defaultLocation]);

  const applyVehicle = (v: ClientVehicle | undefined, fallbackVin?: string | null) => {
    setVin(v?.vin ?? fallbackVin ?? "");
    setYear(v?.year != null ? String(v.year) : "");
    setPlate(v?.plate ?? "");
    setYearError(null);
    setPlateError(null);
  };

  useEffect(() => {
    if (!selectedClient) return;
    const list = selectedClient.vehicles ?? [];
    if (appointment?.vehicleId) {
      setVehicleId(String(appointment.vehicleId));
      applyVehicle(list.find((x) => x.id === appointment.vehicleId), selectedClient.vin);
      return;
    }
    if (!vehicleId || !list.some((v) => String(v.id) === vehicleId)) {
      const primary = list.find((v) => v.isPrimary) ?? list[0];
      setVehicleId(primary ? String(primary.id) : "");
      applyVehicle(primary, selectedClient.vin);
    }
    setVinError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when client changes
  }, [selectedClient?.id, appointment?.vehicleId]);

  useEffect(() => {
    if (!selectedClient || !vehicleId) return;
    const v = (selectedClient.vehicles ?? []).find((x) => String(x.id) === vehicleId);
    if (v) applyVehicle(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId, selectedClient]);

  const save = async () => {
    if (loading) return;
    if (!selectedClient) {
      toast.error("Выберите клиента");
      return;
    }
    if (clientVehicles.length > 0 && !vehicleId) {
      toast.error("Выберите автомобиль клиента");
      return;
    }
    if (endInvalid) {
      toast.error("Окончание должно быть позже начала");
      return;
    }
    if (vin.trim()) {
      const err = getVinValidationError(vin);
      if (err) {
        setVinError(err);
        toast.error(err);
        return;
      }
    }
    const yearErr = year.trim() ? getVehicleYearError(year) : null;
    const plateErr = getPlateError(plate);
    if (yearErr || plateErr) {
      setYearError(yearErr);
      setPlateError(plateErr);
      toast.error(yearErr ?? plateErr ?? "Проверьте данные автомобиля");
      return;
    }
    setLoading(true);
    try {
      // Данные автомобиля (VIN, год, госномер) сохраняются вместе с записью, одним запросом
      if (vehicleId) {
        const current = clientVehicles.find((v) => String(v.id) === vehicleId);
        const patch: Record<string, unknown> = {};
        const nextVin = vin.trim().toUpperCase() || null;
        if (nextVin !== (current?.vin?.trim().toUpperCase() || null)) patch.vin = nextVin;
        const nextYear = year.trim() ? Number(year) : null;
        if (nextYear !== (current?.year ?? null)) patch.year = nextYear;
        const nextPlate = normalizePlateInput(plate) || null;
        if (nextPlate !== (current?.plate ?? null)) patch.plate = nextPlate;
        if (Object.keys(patch).length > 0) {
          await adminApi.patch(`/crm/clients/${selectedClient.id}/vehicles/${vehicleId}`, patch);
          const { data: updatedClient } = await adminApi.get<CrmClient>(`/crm/clients/${selectedClient.id}`);
          setSelectedClient(updatedClient);
        }
      }

      const body = {
        clientId: selectedClient.id,
        vehicleId: vehicleId ? Number(vehicleId) : undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        serviceType,
        serviceTypeId: serviceTypeId ? Number(serviceTypeId) : undefined,
        priceRub: Number(priceRub) || 0,
        managerName: managerName.trim() || undefined,
        masterComment: masterComment.trim() || null,
        location,
        ...(leadId && !appointment ? { leadId } : {}),
      };

      if (appointment) {
        const patched = await withDayLimitOverride((ignore) =>
          adminApi.patch<CrmAppointment>(
            `/crm/appointments/${appointment.id}`,
            withIgnoreFlag(body, ignore),
          ),
        );
        if (patched === null) return; // отказался записывать сверх лимита

        toast.success("Запись обновлена");
      } else {
        const created = await withDayLimitOverride((ignore) =>
          adminApi.post<CrmAppointment & { smsError?: string | null }>(
            "/crm/appointments",
            withIgnoreFlag(body, ignore),
          ),
        );
        if (created === null) return; // отказался записывать сверх лимита
        const { data } = created;
        toast.success(
          leadId ? "Заявка записана в календарь" : "Запись создана",
        );
        if (data.smsError) {
          toast.error(data.smsError);
        }
        router.replace(withBack(`/admin/appointments/${data.id}`, backHref));
        return;
      }

      await reload();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message;
      const text = Array.isArray(msg)
        ? msg.join(", ")
        : typeof msg === "string"
          ? msg
          : "Ошибка сохранения";
      toast.error(text);
    } finally {
      setLoading(false);
    }
  };

  /** Назад в календарь — на день и филиал этой записи. */
  const calendarHref = backHref ?? (() => {
    const q = new URLSearchParams();
    const iso = appointment?.startsAt ?? slotStart;
    if (iso && !Number.isNaN(Date.parse(iso))) q.set("date", toLocalInput(iso).slice(0, 10));
    q.set("location", location);
    return `/admin/calendar?${q.toString()}`;
  })();

  const remove = async () => {
    if (!appointment) return;
    if (!confirm("Удалить запись?")) return;
    await adminApi.delete(`/crm/appointments/${appointment.id}`);
    toast.success("Удалено");
    router.push(calendarHref);
  };

  const apiErrorText = (e: unknown, fallback: string) => {
    const msg = (e as { response?: { data?: { message?: string | string[] } } })
      ?.response?.data?.message;
    return Array.isArray(msg)
      ? msg.join(", ")
      : typeof msg === "string"
        ? msg
        : fallback;
  };

  /** Закрыть запись: работы выполнены → связанная заявка становится «Выполнена». */
  const completeAppointment = async () => {
    if (!appointment || completedAt) return;
    const link = closeLink.trim();
    if (!link) {
      toast.error("Укажите ссылку на Яндекс.Диск — клиент увидит её в личном кабинете");
      return;
    }
    setClosing(true);
    try {
      const { data } = await adminApi.post<CrmAppointment>(
        `/crm/appointments/${appointment.id}/complete`,
        { diskLink: link },
      );
      setCompletedAt(data.completedAt ?? new Date().toISOString());
      toast.success(
        appointment.lead
          ? `Запись закрыта, заявка #${appointment.lead.id} — «Выполнена»`
          : "Запись закрыта",
      );
      await reload();
    } catch (e: unknown) {
      toast.error(apiErrorText(e, "Не удалось закрыть запись"));
    } finally {
      setClosing(false);
    }
  };

  const reopenAppointment = async () => {
    if (!appointment || !completedAt) return;
    if (!confirm("Вернуть запись в работу? Заявка снова станет незакрытой.")) return;
    setClosing(true);
    try {
      await adminApi.post<CrmAppointment>(
        `/crm/appointments/${appointment.id}/reopen`,
      );
      setCompletedAt(null);
      toast.success("Запись возвращена в работу");
      await reload();
    } catch (e: unknown) {
      toast.error(apiErrorText(e, "Не удалось вернуть запись"));
    } finally {
      setClosing(false);
    }
  };

  const sendReviewSms = async () => {
    if (!appointment || reviewSmsSentAt) return;
    setSendingReview(true);
    try {
      const { data } = await adminApi.post<CrmAppointment>(
        `/crm/appointments/${appointment.id}/send-review-sms`,
      );
      setReviewSmsSentAt(data.reviewSmsSentAt);
      toast.success("SMS с запросом отзыва отправлено");
      await reload();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message;
      const text = Array.isArray(msg)
        ? msg.join(", ")
        : typeof msg === "string"
          ? msg
          : "Не удалось отправить SMS";
      toast.error(text);
    } finally {
      setSendingReview(false);
    }
  };

  const clientPreset =
    selectedClient ?? (appointment ? appointmentClientPreset(appointment) : null);

  if (appointmentId != null && pageLoading) {
    return <div className="h-64 animate-pulse rounded-xl border border-white/10 bg-slate-900/60" />;
  }
  if (appointmentId != null && notFound) {
    return (
      <div className="space-y-3 text-white">
        <p>Запись не найдена. Возможно, её удалили.</p>
        <Button variant="outline" asChild className="border-white/20">
          <Link href="/admin/calendar">К календарю</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-4 text-white [&_label]:text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" asChild className="border-white/20 text-slate-100">
          <Link href={calendarHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К календарю
          </Link>
        </Button>
        <h1 className="text-xl font-bold">
          {appointment ? `Запись № ${appointment.id}` : "Новая запись"}
        </h1>
      </div>

      {appointment ? (
        <nav className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-slate-900/60 p-1" aria-label="Разделы записи">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={withQuery(pathname, params, { tab: t.id === "details" ? null : t.id, item: null, focus: null })}
              scroll={false}
              aria-current={tab === t.id ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                tab === t.id ? "bg-emerald-500/20 text-emerald-300" : "text-slate-300 hover:bg-white/5"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      ) : null}

      {tab === "details" ? (
        <div className="space-y-4">
          <ClientQuickCreate
            open={quickCreateOpen}
            onOpenChange={setQuickCreateOpen}
            initialPhone={clientSearchQuery}
            onCreated={async (client) => {
              setSelectedClient(client);
            }}
          />
          <div className="space-y-2">
            <Label>Клиент</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <ClientSearchAutocomplete
                key={leadId ? `lead-${leadId}` : `apt-${appointment?.id ?? "new"}`}
                clientId={selectedClient?.id ?? null}
                onClientChange={setSelectedClient}
                presetClient={clientPreset}
                initialQuery={initialClientQuery}
                onQueryChange={setClientSearchQuery}
                inputClassName="border-white/20 bg-slate-800 text-white"
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 border-white/20"
                onClick={openQuickCreate}
              >
                + Новый
              </Button>
            </div>
            {selectedClient && (
              <Link
                href={withBack(`/admin/clients/${selectedClient.id}`, calendarHref)}
                className="text-xs text-emerald-300 hover:underline"
              >
                Заполнить или изменить карточку клиента
              </Link>
            )}
          </div>

          {selectedClient ? (
            <div className="space-y-2">
              <Label>Автомобиль</Label>
              {clientVehicles.length === 0 ? (
                <p className="text-sm text-slate-400">
                  У клиента нет автомобилей —{" "}
                  <Link
                    href={withBack(`/admin/clients/${selectedClient.id}`, calendarHref)}
                    className="text-emerald-300 hover:underline"
                  >
                    добавить в карточке
                  </Link>
                </p>
              ) : (
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger className="w-full border-white/20 bg-slate-800">
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
              )}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Начало</Label>
              <Input
                type="datetime-local"
                className="border-white/20 bg-slate-800"
                value={startsAt}
                onChange={(e) => changeStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Окончание</Label>
              <Input
                type="datetime-local"
                className={cn(
                  "border-white/20 bg-slate-800",
                  endInvalid && "border-red-500/70",
                )}
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
          <div className="space-y-2">
            <Label>Филиал</Label>
            <Select
              value={location}
              onValueChange={(v) => setLocation(v as CrmLocationCode)}
            >
              <SelectTrigger className="w-full border-white/20 bg-slate-800">
                <SelectValue />
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
          <DayCapacityHint
            startsAt={startsAt}
            location={location}
            excludeAppointmentId={appointment?.id}
          />

          <div className="space-y-2">
            <Label>Услуга</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                disabled={worksLocked}
                value={serviceTypeId}
                onValueChange={(v) => {
                  setServiceTypeId(v);
                  const t = serviceTypes.find((s) => String(s.id) === v);
                  if (t) setServiceType(t.name);
                }}
              >
                <SelectTrigger className="w-full border-white/20 bg-slate-800 sm:w-48">
                  <SelectValue placeholder="Список" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="flex-1 border-white/20 bg-slate-800"
                disabled={worksLocked}
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              />
            </div>
            {worksLocked ? (
              <p className="text-xs text-slate-400">
                Название услуги считается из перечня согласованных работ ниже.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Стоимость (руб.)</Label>
              <Input
                type="number"
                min={0}
                className="border-white/20 bg-slate-800"
                disabled={priceLocked}
                value={priceRub}
                onChange={(e) => setPriceRub(e.target.value)}
              />
              {priceLocked ? (
                <p className="text-xs text-slate-400">Сумма цен работ из перечня ниже.</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Менеджер</Label>
              <Input
                className="border-white/20 bg-slate-800"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="Только для админки"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointment-master-comment">Комментарий мастера</Label>
            <textarea
              id="appointment-master-comment"
              value={masterComment}
              onChange={(event) => setMasterComment(event.target.value)}
              maxLength={2000}
              rows={4}
              disabled={loading || closing}
              aria-describedby="appointment-master-comment-hint"
              placeholder="Что обнаружили, что сделали и на что обратить внимание…"
              className="w-full min-h-28 resize-y rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-50"
            />
            <div id="appointment-master-comment-hint" className="flex justify-between gap-3 text-xs text-slate-400">
              <span>Внутренняя заметка. Сохраняется кнопкой «Сохранить».</span>
              <span className="shrink-0 tabular-nums">{masterComment.length}/2000</span>
            </div>
          </div>

          {selectedClient && vehicleId ? (
            <div className="space-y-3 rounded-lg border border-white/10 bg-slate-950/40 p-3">
              <Label>Данные автомобиля</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="apt-year">Год выпуска</Label>
                  <Input
                    id="apt-year"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="например, 2019"
                    className="border-white/20 bg-slate-800"
                    value={year}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setYear(v);
                      setYearError(v ? getVehicleYearError(v) : null);
                    }}
                  />
                  {yearError && <p className="text-xs text-red-400">{yearError}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="apt-plate">Государственный номер</Label>
                  <Input
                    id="apt-plate"
                    maxLength={15}
                    placeholder="А123ВС77"
                    className="border-white/20 bg-slate-800 uppercase"
                    value={plate}
                    onChange={(e) => {
                      const v = normalizePlateInput(e.target.value);
                      setPlate(v);
                      setPlateError(getPlateError(v));
                    }}
                  />
                  {plateError && <p className="text-xs text-red-400">{plateError}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="apt-vin">VIN</Label>
                <Input
                  id="apt-vin"
                  className="border-white/20 bg-slate-800 font-mono uppercase"
                  value={vin}
                  maxLength={17}
                  placeholder="17 символов, без I/O/Q"
                  onChange={(e) => {
                    const v = e.target.value.toUpperCase();
                    setVin(v);
                    setVinError(v.trim() ? getVinValidationError(v) : null);
                  }}
                />
                {vinError && <p className="text-xs text-red-400">{vinError}</p>}
              </div>
            </div>
          ) : null}


          {appointment && (
            <div
              className={
                completedAt
                  ? "space-y-2 rounded-lg border border-teal-500/30 bg-teal-950/30 p-3"
                  : "space-y-2 rounded-lg border border-emerald-500/30 bg-slate-950/50 p-3"
              }
            >
              {completedAt ? (
                <>
                  <p className="text-sm font-medium text-teal-300">
                    ✓ Выполнено{" "}
                    {new Date(completedAt).toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {appointment.lead ? ` · заявка #${appointment.lead.id}` : ""}
                  </p>
                  {closeLink ? (
                    <a
                      href={closeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm text-emerald-300 underline"
                    >
                      {closeLink}
                    </a>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    disabled={closing}
                    onClick={() => void reopenAppointment()}
                  >
                    Вернуть в работу
                  </Button>
                </>
              ) : (
                <>
                  <Label htmlFor="apt-close-link">Закрыть запись</Label>
                  <p className="text-xs text-slate-400">
                    Работы выполнены.
                    {appointment.lead
                      ? ` Заявка #${appointment.lead.id} автоматически станет «Выполнена».`
                      : ""}{" "}
                    Ссылка на фотоотчёт обязательна — клиент увидит её в личном
                    кабинете.
                  </p>
                  <Input
                    id="apt-close-link"
                    value={closeLink}
                    onChange={(e) => setCloseLink(e.target.value)}
                    placeholder="https://disk.yandex.ru/..."
                    className="border-white/15 bg-slate-900"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-500"
                    disabled={closing}
                    onClick={() => void completeAppointment()}
                  >
                    {closing ? "Сохранение…" : "Выполнено"}
                  </Button>
                </>
              )}
            </div>
          )}

          {appointment && (
            <AssignMastersSection
              appointmentId={appointment.id}
              assigned={appointment.assignees ?? []}
              onSaved={reload}
            />
          )}

          {appointment && <VisitPayrollPanel visitId={appointment.id} refreshKey={completedAt} />}

          {appointment && (
            <div className="space-y-2 rounded-lg border border-white/10 bg-slate-950/50 p-3">
              <Label>SMS с запросом отзыва</Label>
              {reviewSmsSentAt ? (
                <p className="text-sm text-slate-400">
                  Уже отправлено{" "}
                  {new Date(reviewSmsSentAt).toLocaleString("ru-RU", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={sendingReview}
                  onClick={() => void sendReviewSms()}
                >
                  {sendingReview ? "Отправка…" : "Отправить SMS «спасибо за визит»"}
                </Button>
              )}
            </div>
          )}

          <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap justify-end gap-2 border-t border-white/10 bg-slate-950/90 p-3 backdrop-blur">
            {appointment && (
              <Button type="button" variant="destructive" onClick={() => void remove()}>
                Удалить
              </Button>
            )}
            <Button type="button" variant="outline" className="border-white/20" asChild>
              <Link href={calendarHref}>Отмена</Link>
            </Button>
            <Button type="button" onClick={() => void save()} disabled={loading}>
              Сохранить
            </Button>
          </div>
        </div>
      ) : null}

      {tab === "works" && appointment ? (
        <WorkItemsEditor
          appointmentId={appointment.id}
          onChanged={(view) => {
            setWorks(view);
            if (view.items.length > 0) {
              if (view.pricing.preliminary != null) {
                setPriceRub(String(view.pricing.preliminary));
              }
              setServiceType(
                [...new Set(view.items.map((i) => i.categoryName))].join("; ").slice(0, 300),
              );
            }
          }}
        />

      ) : null}

      {tab === "acceptance" && appointment ? (
        <AcceptanceForm
          appointmentId={appointment.id}
          focus={params.get("focus")}
          onChanged={() => {
            if (!selectedClient) return;
            void adminApi
              .get<CrmClient>(`/crm/clients/${selectedClient.id}`)
              .then((r) => setSelectedClient(r.data))
              .catch(() => undefined);
          }}
        />
      ) : null}

      {tab === "execution" && appointment ? <ExecutionPanel appointmentId={appointment.id} /> : null}

      {tab === "handover" && appointment ? <HandoverForm appointmentId={appointment.id} /> : null}

      {tab === "documents" && appointment ? <DocumentsPanel appointmentId={appointment.id} /> : null}
    </div>
  );
}
