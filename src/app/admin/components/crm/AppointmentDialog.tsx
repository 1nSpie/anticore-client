"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/dialog";
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
import type { CrmAppointment, CrmClient, ServiceType } from "../../_lib/crmTypes";
import { toast } from "sonner";
import { ClientQuickCreate } from "./ClientQuickCreate";
import { ClientSearchAutocomplete } from "./ClientSearchAutocomplete";
import { DocumentActions } from "./DocumentActions";
import { getVinValidationError } from "@/lib/vin";

const dialogClass =
  "max-w-lg bg-slate-900 border border-white/10 text-white [&_label]:text-slate-200";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  appointment: CrmAppointment | null;
  slot: { start: string; end: string } | null;
  serviceTypes: ServiceType[];
  onSaved: () => Promise<void>;
  leadId?: number | null;
  initialClientQuery?: string;
};

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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

export function AppointmentDialog({
  open,
  onOpenChange,
  appointment,
  slot,
  serviceTypes,
  onSaved,
  leadId,
  initialClientQuery,
}: Props) {
  const [selectedClient, setSelectedClient] = useState<CrmClient | null>(null);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState<string>("");
  const [priceRub, setPriceRub] = useState("0");
  const [managerName, setManagerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [vin, setVin] = useState("");
  const [vinError, setVinError] = useState<string | null>(null);
  const [reviewSmsSentAt, setReviewSmsSentAt] = useState<string | null>(null);
  const [sendingReview, setSendingReview] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedClient(null);
      setManagerName("");
      setClientSearchQuery("");
      setVin("");
      setVinError(null);
      setReviewSmsSentAt(null);
      setSendingReview(false);
      return;
    }

    if (appointment) {
      setStartsAt(toLocalInput(appointment.startsAt));
      setEndsAt(toLocalInput(appointment.endsAt));
      setServiceType(appointment.serviceType);
      setServiceTypeId(
        appointment.serviceTypeId ? String(appointment.serviceTypeId) : "",
      );
      setPriceRub(String(appointment.priceRub));
      setManagerName(appointment.managerName ?? "");
      setReviewSmsSentAt(appointment.reviewSmsSentAt ?? null);

      void adminApi
        .get<CrmClient>(`/crm/clients/${appointment.clientId}`)
        .then(({ data }) => setSelectedClient(data))
        .catch(() => setSelectedClient(null));
    } else {
      setSelectedClient(null);
      const timeSlot = slot ?? defaultSlot();
      setStartsAt(toLocalInput(timeSlot.start));
      setEndsAt(toLocalInput(timeSlot.end));
      setServiceType(serviceTypes[0]?.name ?? "");
      setServiceTypeId(serviceTypes[0] ? String(serviceTypes[0].id) : "");
      setPriceRub("0");
      setManagerName("");
      setReviewSmsSentAt(null);
    }
  }, [open, appointment, slot, serviceTypes]);

  useEffect(() => {
    if (!appointment || !selectedClient) return;
    setVin(selectedClient.vin ?? "");
    setVinError(null);
  }, [appointment, selectedClient]);

  const save = async () => {
    if (!selectedClient) {
      toast.error("Выберите клиента");
      return;
    }
    if (appointment && vin.trim()) {
      const err = getVinValidationError(vin);
      if (err) {
        setVinError(err);
        toast.error(err);
        return;
      }
    }
    setLoading(true);
    try {
      const body = {
        clientId: selectedClient.id,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        serviceType,
        serviceTypeId: serviceTypeId ? Number(serviceTypeId) : undefined,
        priceRub: Number(priceRub) || 0,
        managerName: managerName.trim() || undefined,
      };

      let visitId: number;
      if (appointment) {
        const { data } = await adminApi.patch<CrmAppointment>(
          `/crm/appointments/${appointment.id}`,
          body,
        );
        visitId = data.id;

        const nextVin = vin.trim().toUpperCase() || null;
        const prevVin = selectedClient.vin?.trim().toUpperCase() || null;
        if (nextVin !== prevVin) {
          const { data: updatedClient } = await adminApi.patch<CrmClient>(
            `/crm/clients/${selectedClient.id}`,
            { vin: nextVin },
          );
          setSelectedClient(updatedClient);
        }

        toast.success("Запись обновлена");
      } else {
        const { data } = await adminApi.post<CrmAppointment>(
          "/crm/appointments",
          body,
        );
        visitId = data.id;
        toast.success("Запись создана");
      }

      if (leadId) {
        await adminApi.post(`/crm/leads/${leadId}/schedule`, { visitId });
      }

      await onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!appointment) return;
    if (!confirm("Удалить запись?")) return;
    await adminApi.delete(`/crm/appointments/${appointment.id}`);
    toast.success("Удалено");
    await onSaved();
    onOpenChange(false);
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
      await onSaved();
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={dialogClass}>
          <DialogHeader>
            <DialogTitle className="text-white">
              {appointment ? "Редактирование записи" : "Новая запись"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
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
                  onClick={() => setQuickCreateOpen(true)}
                >
                  + Новый
                </Button>
              </div>
              {selectedClient && (
                <Link
                  href={`/admin/clients/${selectedClient.id}`}
                  className="text-xs text-emerald-300 hover:underline"
                >
                  Заполнить или изменить карточку клиента
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Начало</Label>
                <Input
                  type="datetime-local"
                  className="border-white/20 bg-slate-800"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Окончание</Label>
                <Input
                  type="datetime-local"
                  className="border-white/20 bg-slate-800"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Услуга</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select
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
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Стоимость (руб.)</Label>
                <Input
                  type="number"
                  min={0}
                  className="border-white/20 bg-slate-800"
                  value={priceRub}
                  onChange={(e) => setPriceRub(e.target.value)}
                />
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

            {appointment && (
              <div className="space-y-2">
                <Label>VIN</Label>
                <Input
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
            )}

            {appointment && selectedClient && (
              <DocumentActions
                client={selectedClient}
                appointment={appointment}
                vin={vin}
                startsAt={startsAt ? new Date(startsAt).toISOString() : null}
                endsAt={endsAt ? new Date(endsAt).toISOString() : null}
                priceRub={Number(priceRub) || 0}
                serviceType={serviceType}
              />
            )}

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
          </div>

          <DialogFooter className="gap-2">
            {appointment && (
              <Button type="button" variant="destructive" onClick={() => void remove()}>
                Удалить
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="border-white/20"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="button" onClick={() => void save()} disabled={loading}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ClientQuickCreate
        open={quickCreateOpen}
        onOpenChange={setQuickCreateOpen}
        initialPhone={clientSearchQuery}
        onCreated={async (client) => {
          setSelectedClient(client);
        }}
      />
    </>
  );
}
