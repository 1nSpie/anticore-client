"use client";

import { FormEvent, useState } from "react";
import { adminApi } from "../../_lib/api";
import type { ClientVehicle } from "../../_lib/crmTypes";
import { CarCatalogFields } from "../cars/CarCatalogFields";
import { SegmentPricePreview } from "../prices/SegmentPricePreview";
import { useCarCatalog } from "../cars/useCarCatalog";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { Button } from "@/shadcn/button";
import { Checkbox } from "@/shadcn/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/dialog";
import { getVinValidationError } from "@/lib/vin";
import { toast } from "sonner";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";

const fieldClass = "border-white/20 bg-slate-800 text-white";

type Props = {
  clientId: number;
  vehicles: ClientVehicle[];
  onChange: () => void | Promise<void>;
  /** Фильтр истории по авто */
  selectedVehicleId: number | null;
  onSelectVehicle: (id: number | null) => void;
};

type FormState = {
  brand: string;
  model: string;
  customLabel: string;
  isNotInCatalog: boolean;
  vin: string;
  isPrimary: boolean;
};

const emptyForm = (): FormState => ({
  brand: "",
  model: "",
  customLabel: "",
  isNotInCatalog: false,
  vin: "",
  isPrimary: false,
});

export function ClientVehiclesSection({
  clientId,
  vehicles,
  onChange,
  selectedVehicleId,
  onSelectVehicle,
}: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClientVehicle | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [vinError, setVinError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { brands, cars, resolveCarId, resolveCarSegment } = useCarCatalog(
    form.brand,
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm(), isPrimary: vehicles.length === 0 });
    setVinError(null);
    setOpen(true);
  };

  const openEdit = (v: ClientVehicle) => {
    const hasCustom = Boolean(v.customLabel?.trim());
    setEditing(v);
    setForm({
      brand: hasCustom ? "" : (v.carBrand ?? ""),
      model: hasCustom ? "" : (v.carModelName ?? ""),
      customLabel: v.customLabel ?? "",
      isNotInCatalog: hasCustom,
      vin: v.vin ?? "",
      isPrimary: v.isPrimary,
    });
    setVinError(null);
    setOpen(true);
  };

  const buildPayload = () => {
    if (form.vin.trim()) {
      const err = getVinValidationError(form.vin);
      if (err) {
        setVinError(err);
        throw new Error(err);
      }
    }

    let carId: number | null = null;
    let customLabel: string | null = null;

    if (form.isNotInCatalog) {
      const text = form.customLabel.trim();
      if (!text && !form.vin.trim()) {
        throw new Error("Укажите автомобиль или VIN");
      }
      customLabel = text || null;
    } else if (form.brand || form.model) {
      if (!form.brand || !form.model) {
        throw new Error("Выберите марку и модель из каталога");
      }
      const id = resolveCarId(form.model);
      if (!id) throw new Error("Модель не найдена в каталоге");
      carId = id;
    } else if (!form.vin.trim()) {
      throw new Error("Укажите автомобиль или VIN");
    }

    return {
      carId,
      customLabel,
      vin: form.vin.trim().toUpperCase() || null,
      isPrimary: form.isPrimary,
    };
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editing) {
        await adminApi.patch(
          `/crm/clients/${clientId}/vehicles/${editing.id}`,
          payload,
        );
        toast.success("Автомобиль обновлён");
      } else {
        await adminApi.post(`/crm/clients/${clientId}/vehicles`, payload);
        toast.success("Автомобиль добавлен");
      }
      setOpen(false);
      await onChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const setPrimary = async (v: ClientVehicle) => {
    try {
      await adminApi.patch(`/crm/clients/${clientId}/vehicles/${v.id}`, {
        isPrimary: true,
      });
      toast.success("Основной автомобиль обновлён");
      await onChange();
    } catch {
      toast.error("Не удалось сделать основным");
    }
  };

  const archive = async (v: ClientVehicle) => {
    if (!confirm(`Убрать «${v.label || "автомобиль"}» из карточки?`)) return;
    try {
      await adminApi.delete(`/crm/clients/${clientId}/vehicles/${v.id}`);
      if (selectedVehicleId === v.id) onSelectVehicle(null);
      toast.success("Автомобиль архивирован");
      await onChange();
    } catch {
      toast.error("Не удалось удалить");
    }
  };

  return (
    <>
      <Card className="border-white/10 bg-slate-950/50">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base text-white">Автомобили</CardTitle>
          <Button type="button" size="sm" variant="secondary" onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Добавить
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {vehicles.length === 0 ? (
            <p className="text-sm text-slate-400">Автомобилей пока нет</p>
          ) : (
            <ul className="space-y-2">
              {vehicles.map((v) => {
                const active = selectedVehicleId === v.id;
                return (
                  <li
                    key={v.id}
                    className={`rounded-xl border px-3 py-2.5 ${
                      active
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : "border-white/10 bg-slate-900/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() =>
                          onSelectVehicle(active ? null : v.id)
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-white">
                            {v.label || "Без названия"}
                          </span>
                          {v.isPrimary ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-200">
                              <Star className="h-3 w-3" />
                              основное
                            </span>
                          ) : null}
                        </div>
                        {v.vin ? (
                          <p className="mt-0.5 font-mono text-xs text-slate-400">
                            VIN {v.vin}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-slate-500">
                          {active
                            ? "Фильтр истории: этот авто"
                            : "Нажмите, чтобы фильтровать историю"}
                        </p>
                      </button>
                      <div className="flex shrink-0 gap-1">
                        {!v.isPrimary ? (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-300"
                            title="Сделать основным"
                            onClick={() => void setPrimary(v)}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-300"
                          onClick={() => openEdit(v)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-300"
                          onClick={() => void archive(v)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {selectedVehicleId != null ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-slate-400"
              onClick={() => onSelectVehicle(null)}
            >
              Показать всю историю
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-white/10 bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Редактировать авто" : "Новый автомобиль"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={form.isNotInCatalog}
                onCheckedChange={(v) => {
                  const on = v === true;
                  setForm((f) => ({
                    ...f,
                    isNotInCatalog: on,
                    ...(on ? { brand: "", model: "" } : { customLabel: "" }),
                  }));
                }}
                className="border-white/20 data-[state=checked]:bg-emerald-600"
              />
              <span className="text-sm text-slate-200">Авто нет в каталоге</span>
            </label>

            {form.isNotInCatalog ? (
              <div className="space-y-2">
                <Label>Марка и модель</Label>
                <Input
                  className={fieldClass}
                  value={form.customLabel}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customLabel: e.target.value }))
                  }
                  placeholder="Например, Toyota Camry"
                />
              </div>
            ) : (
              <>
                <CarCatalogFields
                  brand={form.brand}
                  model={form.model}
                  brands={brands}
                  cars={cars}
                  onBrandChange={(brand) =>
                    setForm((f) => ({ ...f, brand, model: "" }))
                  }
                  onModelChange={(model) => setForm((f) => ({ ...f, model }))}
                  inputClassName={fieldClass}
                />
                {form.model ? (
                  <SegmentPricePreview
                    segment={resolveCarSegment(form.model)}
                    brand={form.brand}
                    model={form.model}
                  />
                ) : null}
              </>
            )}

            <div className="space-y-2">
              <Label>VIN</Label>
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
              {vinError ? <p className="text-xs text-red-400">{vinError}</p> : null}
            </div>

            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={form.isPrimary}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, isPrimary: v === true }))
                }
                className="border-white/20 data-[state=checked]:bg-emerald-600"
              />
              <span className="text-sm text-slate-200">Основной автомобиль</span>
            </label>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "…" : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
