"use client";

import { useEffect, useState } from "react";
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
import { useCarCatalog } from "../cars/useCarCatalog";
import { SegmentPricePreview } from "../prices/SegmentPricePreview";
import { adminApi } from "../../_lib/api";
import type { SiteLead, SiteLeadStatus } from "../../_lib/crmTypes";
import {
  STATUS_LABELS,
  hasAdminNote,
  requiresAdminNoteOnStatusChange,
} from "../../_lib/leadStatus";
import {
  CRM_LOCATIONS,
  CRM_LOCATION_LABELS,
  type CrmLocationCode,
} from "../../_lib/crmLocations";
import {
  formatPhoneRuDisplay,
  normalizePhoneRu,
  PHONE_RU_INPUT_PREFIX,
} from "@/lib/phoneRu";
import { toast } from "sonner";

const fieldClass = "border-white/15 bg-slate-800 text-white";

type FormState = {
  name: string;
  phone: string;
  message: string;
  brand: string;
  model: string;
  customCar: string;
  isNotInCatalog: boolean;
  communicationMethod: string;
  adminNote: string;
  diskLink: string;
  status: SiteLeadStatus;
  location: CrmLocationCode | "";
  followUpAt: string;
  followUpEnabled: boolean;
};

type Props = {
  lead: SiteLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void | Promise<void>;
  /** Режим «взять в работу»: статус по умолчанию IN_PROGRESS, другой заголовок. */
  mode?: "edit" | "take";
  /** После сохранения открыть запись в календарь. */
  onSchedule?: (lead: SiteLead) => void;
};

/** Разбор «Toyota Camry» → марка/модель по каталогу. */
function parseCarDescription(
  text: string | null | undefined,
  brandNames: string[],
): Pick<FormState, "brand" | "model" | "customCar" | "isNotInCatalog"> {
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
      return {
        brand,
        model: rest,
        customCar: "",
        isNotInCatalog: false,
      };
    }
  }

  return { brand: "", model: "", customCar: raw, isNotInCatalog: true };
}

function buildCarDescription(form: FormState): string | null {
  if (form.isNotInCatalog) {
    return form.customCar.trim() || null;
  }
  const parts = [form.brand.trim(), form.model.trim()].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

function leadToForm(lead: SiteLead, mode: "edit" | "take"): FormState {
  const takeStatus =
    mode === "take" &&
    (lead.status === "NEW" || lead.status === "NEEDS_CLARIFICATION")
      ? "IN_PROGRESS"
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
    diskLink: lead.diskLink ?? "",
    status: takeStatus,
    location: lead.location ?? "",
    followUpAt: lead.followUpAt?.slice(0, 10) ?? "",
    followUpEnabled: Boolean(lead.followUpAt),
  };
}

export function LeadEditDialog({
  lead,
  open,
  onOpenChange,
  onSaved,
  mode = "edit",
  onSchedule,
}: Props) {
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [carParsed, setCarParsed] = useState(false);

  const { brands, cars, resolveCarSegment } = useCarCatalog(form?.brand ?? "");

  useEffect(() => {
    if (open && lead) {
      setForm(leadToForm(lead, mode));
      setCarParsed(false);
    } else if (!open) {
      setForm(null);
      setCarParsed(false);
    }
  }, [open, lead, mode]);

  useEffect(() => {
    if (!form || carParsed || brands.length === 0 || !lead) return;
    const parsed = parseCarDescription(lead.carDescription, brands.map((b) => b.name));
    setForm((f) =>
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
  }, [brands, carParsed, form, lead]);

  const persist = async (): Promise<SiteLead | null> => {
    if (!lead || !form) return null;
    if (!form.name.trim()) {
      toast.error("Укажите имя");
      return null;
    }
    if (!form.phone.trim() || form.phone === PHONE_RU_INPUT_PREFIX) {
      toast.error("Укажите телефон");
      return null;
    }
    if (!form.isNotInCatalog && (form.brand || form.model)) {
      if (!form.brand || !form.model) {
        toast.error("Выберите марку и модель автомобиля");
        return null;
      }
    }

    let phone: string;
    try {
      phone = normalizePhoneRu(form.phone);
    } catch {
      toast.error("Укажите мобильный номер России: +79 и ещё 9 цифр");
      return null;
    }
    if (form.status === "COMPLETED" && !form.diskLink.trim()) {
      toast.error("Для статуса «Выполнена» укажите ссылку на Яндекс.Диск");
      return null;
    }
    if (
      requiresAdminNoteOnStatusChange(lead.status, form.status) &&
      !hasAdminNote(form.adminNote)
    ) {
      toast.error("Укажите комментарий администратора при смене статуса с «Новая»");
      return null;
    }
    if (form.followUpEnabled && !form.followUpAt) {
      toast.error("Укажите дату повторной связи");
      return null;
    }
    if (!form.location) {
      toast.error("Выберите город (филиал)");
      return null;
    }

    const { data } = await adminApi.patch<SiteLead>(`/crm/leads/${lead.id}`, {
      name: form.name.trim(),
      phone,
      message: form.message.trim() || null,
      carDescription: buildCarDescription(form),
      communicationMethod: form.communicationMethod || null,
      adminNote: form.adminNote.trim() || null,
      diskLink: form.diskLink.trim() || null,
      status: form.status,
      location: form.location,
      followUpAt:
        form.followUpEnabled && form.followUpAt
          ? `${form.followUpAt}T09:00:00.000Z`
          : null,
    });
    return data;
  };

  const save = async () => {
    if (!lead || !form) return;
    setSaving(true);
    try {
      const updated = await persist();
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

  const saveAndSchedule = async () => {
    if (!lead || !form || !onSchedule) return;
    if (
      requiresAdminNoteOnStatusChange(lead.status, form.status) &&
      !hasAdminNote(form.adminNote)
    ) {
      toast.error("Укажите комментарий администратора перед записью в календарь");
      return;
    }
    setSaving(true);
    try {
      const updated = await persist();
      if (!updated) return;
      await onSaved();
      onOpenChange(false);
      onSchedule(updated);
    } catch {
      toast.error("Не удалось сохранить заявку");
    } finally {
      setSaving(false);
    }
  };

  if (!form) return null;

  const canSchedule =
    onSchedule &&
    !lead?.visitId &&
    form.status !== "SCHEDULED" &&
    form.status !== "REJECTED" &&
    form.status !== "COMPLETED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-slate-950 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "take"
              ? `Взять в работу · заявка #${lead?.id}`
              : `Заявка #${lead?.id}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Статус</Label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm((f) => f && { ...f, status: v as SiteLeadStatus })
              }
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABELS) as SiteLeadStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Имя *</Label>
            <Input
              className={fieldClass}
              value={form.name}
              onChange={(e) =>
                setForm((f) => f && { ...f, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Телефон *</Label>
            <PhoneRuInput
              className={fieldClass}
              value={form.phone}
              onChange={(e) =>
                setForm((f) => f && { ...f, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Способ связи</Label>
            <Select
              value={form.communicationMethod || "none"}
              onValueChange={(v) =>
                setForm((f) =>
                  f && { ...f, communicationMethod: v === "none" ? "" : v },
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
            <Label>Город *</Label>
            <Select
              value={form.location || undefined}
              onValueChange={(v) =>
                setForm((f) => f && { ...f, location: v as CrmLocationCode })
              }
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

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={form.isNotInCatalog}
                onCheckedChange={(v) => {
                  const on = v === true;
                  setForm((f) =>
                    f
                      ? {
                          ...f,
                          isNotInCatalog: on,
                          ...(on
                            ? { brand: "", model: "" }
                            : { customCar: "" }),
                        }
                      : f,
                  );
                }}
                className="border-white/20 data-[state=checked]:bg-emerald-600"
              />
              <span className="text-sm text-slate-200">Авто нет в каталоге</span>
            </label>

            {form.isNotInCatalog ? (
              <div className="space-y-2">
                <Label>Автомобиль</Label>
                <Input
                  className={fieldClass}
                  value={form.customCar}
                  onChange={(e) =>
                    setForm((f) => f && { ...f, customCar: e.target.value })
                  }
                  placeholder="Марка и модель текстом"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>Автомобиль</Label>
                  <a
                    href="/admin/auto"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-300 hover:underline"
                  >
                    Добавить модель
                  </a>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Select
                    value={form.brand || undefined}
                    onValueChange={(brand) =>
                      setForm((f) => f && { ...f, brand, model: "" })
                    }
                  >
                    <SelectTrigger className={`w-full ${fieldClass}`}>
                      <SelectValue placeholder="Марка" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={form.model || undefined}
                    onValueChange={(model) =>
                      setForm((f) => f && { ...f, model })
                    }
                    disabled={!form.brand}
                  >
                    <SelectTrigger className={`w-full ${fieldClass}`}>
                      <SelectValue
                        placeholder={form.brand ? "Модель" : "Сначала марка"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cars.map((c) => (
                        <SelectItem key={c.id} value={c.model}>
                          {c.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.model && (
                  <SegmentPricePreview
                    segment={resolveCarSegment(form.model)}
                    brand={form.brand}
                    model={form.model}
                  />
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Сообщение</Label>
            <Textarea
              rows={3}
              className={fieldClass}
              value={form.message}
              onChange={(e) =>
                setForm((f) => f && { ...f, message: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Комментарий администратора</Label>
            <Textarea
              rows={2}
              className={fieldClass}
              value={form.adminNote}
              onChange={(e) =>
                setForm((f) => f && { ...f, adminNote: e.target.value })
              }
            />
            {lead?.status === "NEW" && (
              <p className="text-xs text-slate-500">
                Обязателен при переводе заявки из статуса «Новая».
              </p>
            )}
          </div>

          {form.status !== "REJECTED" && form.status !== "COMPLETED" && (
            <div className="space-y-3 rounded-lg border border-white/10 p-3">
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={form.followUpEnabled}
                  onCheckedChange={(v) =>
                    setForm((f) =>
                      f
                        ? {
                            ...f,
                            followUpEnabled: v === true,
                            ...(v !== true ? { followUpAt: "" } : {}),
                          }
                        : f,
                    )
                  }
                  className="border-white/20 data-[state=checked]:bg-orange-600"
                />
                <span className="text-sm text-slate-200">
                  Повторная связь (вернётся в «На уточнении» в выбранную дату)
                </span>
              </label>
              {form.followUpEnabled && (
                <div className="space-y-2">
                  <Label>Дата повторной связи</Label>
                  <Input
                    type="date"
                    className={fieldClass}
                    value={form.followUpAt}
                    onChange={(e) =>
                      setForm((f) => f && { ...f, followUpAt: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
          )}

          {(form.status === "COMPLETED" || form.diskLink) && (
            <div className="space-y-2">
              <Label>Яндекс.Диск</Label>
              <Input
                className={fieldClass}
                value={form.diskLink}
                onChange={(e) =>
                  setForm((f) => f && { ...f, diskLink: e.target.value })
                }
                placeholder="https://disk.yandex.ru/..."
              />
              <p className="text-xs text-slate-500">
                Обязательно для статуса «Выполнена» — клиент увидит ссылку в ЛК.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="border-white/20"
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          {canSchedule && (
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => void saveAndSchedule()}
            >
              {saving ? "…" : "В календарь"}
            </Button>
          )}
          <Button disabled={saving} onClick={() => void save()}>
            {saving
              ? "Сохранение…"
              : mode === "take"
                ? "Взять в работу"
                : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
