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
import { adminApi } from "../../_lib/api";
import type { CrmClient } from "../../_lib/crmTypes";
import { CarCatalogFields } from "../cars/CarCatalogFields";
import { useCarCatalog } from "../cars/useCarCatalog";
import { PhoneRuInput } from "@/components/PhoneRuInput";
import { normalizePhoneRu, formatPhoneRuInput, PHONE_RU_INPUT_PREFIX } from "@/lib/phoneRu";
import { getVinValidationError } from "@/lib/vin";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (client: CrmClient) => void | Promise<void>;
  /** Телефон из поля поиска клиента (модалка записи) */
  initialPhone?: string;
};

const emptyForm = {
  phone: PHONE_RU_INPUT_PREFIX,
  lastName: "",
  firstName: "",
  brand: "",
  model: "",
  vin: "",
};

export function ClientQuickCreate({ open, onOpenChange, onCreated, initialPhone }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [vinError, setVinError] = useState<string | null>(null);
  const { brands, cars, resolveCarId, reloadBrands } = useCarCatalog(form.brand);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setVinError(null);
      return;
    }
    void reloadBrands();
    const phoneFromSearch = initialPhone?.trim();
    setForm({
      ...emptyForm,
      phone: phoneFromSearch
        ? formatPhoneRuInput(phoneFromSearch)
        : PHONE_RU_INPUT_PREFIX,
    });
  }, [open, reloadBrands, initialPhone]);

  const save = async () => {
    if (!form.phone.trim() || form.phone === PHONE_RU_INPUT_PREFIX) {
      toast.error("Укажите телефон");
      return;
    }
    let phone: string;
    try {
      phone = normalizePhoneRu(form.phone);
    } catch {
      toast.error("Укажите мобильный номер России: +79 и ещё 9 цифр");
      return;
    }
    if (form.vin.trim()) {
      const err = getVinValidationError(form.vin);
      if (err) {
        setVinError(err);
        toast.error(err);
        return;
      }
    }

    let carId: number | undefined;
    if (form.brand || form.model) {
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
    }

    setVinError(null);
    setLoading(true);
    try {
      const { data } = await adminApi.post<CrmClient>("/crm/clients", {
        phone,
        ...(form.lastName.trim() && { lastName: form.lastName.trim() }),
        ...(form.firstName.trim() && { firstName: form.firstName.trim() }),
        ...(carId !== undefined && { carId }),
        ...(form.vin.trim() && { vin: form.vin.trim() }),
      });
      toast.success("Клиент создан");
      await onCreated(data);
      onOpenChange(false);
    } catch {
      toast.error("Не удалось создать клиента");
    } finally {
      setLoading(false);
    }
  };

  const field = "border-white/20 bg-slate-800";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Быстрое создание клиента</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-400">
          Обязателен только телефон. Остальное можно заполнить сейчас или позже в карточке.
          При регистрации в личном кабинете клиент увидит эти данные.
        </p>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-slate-200">Телефон *</Label>
            <PhoneRuInput
              className={field}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-slate-200">Фамилия</Label>
              <Input
                className={field}
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Имя</Label>
              <Input
                className={field}
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
            </div>
          </div>
          <CarCatalogFields
            brand={form.brand}
            model={form.model}
            brands={brands}
            cars={cars}
            onBrandChange={(brand) => setForm((f) => ({ ...f, brand, model: "" }))}
            onModelChange={(model) => setForm((f) => ({ ...f, model }))}
            inputClassName={`${field} text-slate-100`}
          />
          <div className="space-y-2">
            <Label className="text-slate-200">VIN</Label>
            <Input
              className={`${field} font-mono`}
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
        </div>
        <DialogFooter>
          <Button variant="outline" className="border-white/20" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={() => void save()} disabled={loading || !form.phone.trim()}>
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
