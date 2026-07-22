"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApi } from "../../../_lib/api";
import type { CrmClient, CrmClientVisit } from "../../../_lib/crmTypes";
import { CarCatalogFields } from "../../../components/cars/CarCatalogFields";
import { useCarCatalog } from "../../../components/cars/useCarCatalog";
import { ClientVisitsSection } from "../../../components/clients/ClientVisitsSection";
import { PhoneRuInput } from "@/components/PhoneRuInput";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { Button } from "@/shadcn/button";
import { Textarea } from "@/shadcn/textarea";
import { Checkbox } from "@/shadcn/checkbox";
import { Switch } from "@/shadcn/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/card";
import { normalizePhoneRu, formatPhoneRuDisplay, PHONE_RU_INPUT_PREFIX } from "@/lib/phoneRu";
import { getVinValidationError } from "@/lib/vin";
import { toast } from "sonner";
import { cn } from "src/lib/utils";

const fieldClass = "border-white/20 bg-slate-800 text-white";

export default function AdminClientCardPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";
  const [vinError, setVinError] = useState<string | null>(null);
  const [visits, setVisits] = useState<CrmClientVisit[]>([]);
  const [meta, setMeta] = useState<{
    phoneVerified: boolean;
    blocked: boolean;
    createdAt: string;
  } | null>(null);
  const [form, setForm] = useState({
    phone: PHONE_RU_INPUT_PREFIX,
    lastName: "",
    firstName: "",
    patronymic: "",
    birthDate: "",
    brand: "",
    model: "",
    customCar: "",
    isNotInCatalog: false,
    vin: "",
    adminComment: "",
    blocked: false,
    smsEnabled: true,
    notifyReminder: true,
  });
  const { brands, cars, resolveCarId } = useCarCatalog(form.brand);

  const reloadClient = async () => {
    if (isNew) return;
    const { data } = await adminApi.get<CrmClient>(`/crm/clients/${params.id}`);
    setVisits(data.visits ?? []);
    setMeta({
      phoneVerified: data.phoneVerified,
      blocked: data.blocked,
      createdAt: data.createdAt,
    });
  };

  useEffect(() => {
    if (isNew) return;
    void adminApi.get<CrmClient>(`/crm/clients/${params.id}`).then(({ data }) => {
      const hasCustom = Boolean(data.customCar?.trim());
      setForm({
        phone: formatPhoneRuDisplay(data.phone),
        lastName: data.lastName ?? "",
        firstName: data.firstName ?? "",
        patronymic: data.patronymic ?? "",
        birthDate: data.birthDate?.toString().slice(0, 10) ?? "",
        brand: hasCustom ? "" : (data.carBrand ?? ""),
        model: hasCustom ? "" : (data.carModelName ?? ""),
        customCar: data.customCar ?? "",
        isNotInCatalog: hasCustom,
        vin: data.vin ?? "",
        adminComment: data.adminComment ?? "",
        blocked: data.blocked,
        smsEnabled: data.notificationSettings?.smsEnabled ?? true,
        notifyReminder: data.notificationSettings?.notifyReminder ?? true,
      });
      setVisits(data.visits ?? []);
      setMeta({
        phoneVerified: data.phoneVerified,
        blocked: data.blocked,
        createdAt: data.createdAt,
      });
    });
  }, [isNew, params.id]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.vin.trim()) {
      const err = getVinValidationError(form.vin);
      if (err) {
        setVinError(err);
        toast.error(err);
        return;
      }
    }

    let carId: number | null | undefined;
    let customCar: string | null | undefined;

    if (form.isNotInCatalog) {
      const text = form.customCar.trim();
      if (!text) {
        toast.error("Укажите автомобиль или выберите из каталога");
        return;
      }
      customCar = text;
      carId = null;
    } else if (form.brand || form.model) {
      if (!form.brand || !form.model) {
        toast.error("Выберите марку и модель из каталога");
        return;
      }
      const id = resolveCarId(form.model);
      if (!id) {
        toast.error("Модель не найдена в каталоге. Добавьте её в админке.");
        return;
      }
      carId = id;
      customCar = null;
    } else if (!isNew) {
      carId = null;
      customCar = null;
    }

    setVinError(null);
    try {
      const payload = {
        lastName: form.lastName,
        firstName: form.firstName,
        patronymic: form.patronymic,
        birthDate: form.birthDate || null,
        vin: form.vin,
        adminComment: form.adminComment,
        blocked: form.blocked,
        smsEnabled: form.smsEnabled,
        notifyReminder: form.notifyReminder,
        ...(carId !== undefined && { carId }),
        ...(customCar !== undefined && { customCar }),
      };

      if (isNew) {
        await adminApi.post("/crm/clients", {
          ...payload,
          phone: normalizePhoneRu(form.phone),
        });
        toast.success("Клиент создан");
        router.push("/admin/clients");
      } else {
        await adminApi.patch(`/crm/clients/${params.id}`, payload);
        toast.success("Сохранено");
        setMeta((m) => (m ? { ...m, blocked: form.blocked } : m));
      }
    } catch {
      toast.error("Ошибка сохранения. Проверьте мобильный номер (+7 9XX…) и VIN (17 символов, если указан).");
    }
  };

  const sendReview = async () => {
    try {
      await adminApi.post(`/crm/clients/${params.id}/send-review-sms`);
      toast.success("SMS отправлено");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })
        ?.response?.data?.message;
      toast.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : typeof msg === "string"
            ? msg
            : "Не удалось отправить SMS",
      );
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">
          {isNew ? "Новый клиент" : "Карточка клиента"}
        </h2>
        {!isNew && meta && (
          <div className="flex flex-wrap gap-2 text-xs">
            <span
              className={cn(
                "rounded-full px-2.5 py-1",
                meta.phoneVerified
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-slate-700 text-slate-300",
              )}
            >
              {meta.phoneVerified ? "ЛК активен" : "ЛК не активирован"}
            </span>
            {meta.blocked && (
              <span className="rounded-full bg-red-500/20 px-2.5 py-1 text-red-300">
                Заблокирован
              </span>
            )}
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-slate-400">
              с {new Date(meta.createdAt).toLocaleDateString("ru-RU")}
            </span>
          </div>
        )}
      </div>

      <Card className="border-white/10 bg-slate-950/50">
        <CardHeader>
          <CardTitle className="text-base text-white">Профиль</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-200">Телефон *</Label>
            <PhoneRuInput
              className={fieldClass}
              value={form.phone}
              disabled={!isNew}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Дата рождения</Label>
            <Input
              type="date"
              className={fieldClass}
              value={form.birthDate}
              onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Фамилия</Label>
            <Input
              className={fieldClass}
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-200">Имя</Label>
            <Input
              className={fieldClass}
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-slate-200">Отчество</Label>
            <Input
              className={fieldClass}
              value={form.patronymic}
              onChange={(e) => setForm((f) => ({ ...f, patronymic: e.target.value }))}
            />
          </div>

          <div className="space-y-3 sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={form.isNotInCatalog}
                onCheckedChange={(v) => {
                  const on = v === true;
                  setForm((f) => ({
                    ...f,
                    isNotInCatalog: on,
                    ...(on ? { brand: "", model: "" } : { customCar: "" }),
                  }));
                }}
                className="border-white/20 data-[state=checked]:bg-emerald-600"
              />
              <span className="text-slate-200">Авто нет в каталоге</span>
            </label>
            {form.isNotInCatalog ? (
              <Input
                placeholder="Марка и модель"
                className={fieldClass}
                value={form.customCar}
                onChange={(e) => setForm((f) => ({ ...f, customCar: e.target.value }))}
              />
            ) : (
              <CarCatalogFields
                brand={form.brand}
                model={form.model}
                brands={brands}
                cars={cars}
                onBrandChange={(brand) => setForm((f) => ({ ...f, brand, model: "" }))}
                onModelChange={(model) => setForm((f) => ({ ...f, model }))}
                inputClassName={fieldClass}
              />
            )}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label className="text-slate-200">VIN</Label>
            <Input
              className={`${fieldClass} font-mono`}
              value={form.vin}
              maxLength={17}
              placeholder="17 символов, без I/O/Q"
              onChange={(e) => {
                const v = e.target.value.toUpperCase();
                setForm((f) => ({ ...f, vin: v }));
                setVinError(v.trim() ? getVinValidationError(v) : null);
              }}
            />
            {vinError && <p className="text-xs text-red-400">{vinError}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-slate-200">Комментарий</Label>
            <Textarea
              className={fieldClass}
              value={form.adminComment}
              onChange={(e) =>
                setForm((f) => ({ ...f, adminComment: e.target.value }))
              }
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {!isNew && (
        <Card className="border-white/10 bg-slate-950/50">
          <CardHeader>
            <CardTitle className="text-base text-white">Личный кабинет</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-200">Заблокирован</Label>
              <Switch
                checked={form.blocked}
                onCheckedChange={(v) => setForm((f) => ({ ...f, blocked: v }))}
                className="data-[state=checked]:bg-red-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-200">SMS-уведомления</Label>
              <Switch
                checked={form.smsEnabled}
                onCheckedChange={(v) => setForm((f) => ({ ...f, smsEnabled: v }))}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-slate-200">Напоминания</Label>
              <Switch
                checked={form.notifyReminder}
                onCheckedChange={(v) => setForm((f) => ({ ...f, notifyReminder: v }))}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {!isNew && (
        <ClientVisitsSection
          clientId={Number(params.id)}
          visits={visits}
          onVisitsChange={reloadClient}
        />
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit">Сохранить</Button>
        {!isNew && (
          <Button type="button" variant="secondary" onClick={() => void sendReview()}>
            Отправить отзыв сейчас
          </Button>
        )}
      </div>
    </form>
  );
}
