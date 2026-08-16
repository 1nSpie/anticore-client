"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { Checkbox } from "@/shadcn/checkbox";
import { Autocomplete } from "@/shadcn/autocomplete";
import { Button } from "@/shadcn/button";
import { cabinetAxios } from "../../_lib/api";
import { getAllBrand, getAllCarWithBrand } from "@/app/glav/api";
import type { Brand, Car as CatalogCar } from "@/app/glav/type";
import {
  cabinetCard,
  cabinetMuted,
  cabinetInput,
  cabinetBtnPrimary,
  cabinetLabel,
  cabinetAutocompleteInput,
  cabinetAutocompleteDropdown,
  cabinetH2,
} from "../../_lib/cabinetUi";
import { Car as CarIcon, Pencil, Plus, Star, Trash2 } from "lucide-react";

export type CabinetVehicle = {
  id: number;
  carId: number | null;
  customLabel: string | null;
  vin: string | null;
  isPrimary: boolean;
  carBrand: string | null;
  carModelName: string | null;
  label: string;
};

type Props = {
  vehicles: CabinetVehicle[];
  onChange: () => void | Promise<void>;
};

type FormState = {
  brand: string;
  model: string;
  customLabel: string;
  isNotAuto: boolean;
  isPrimary: boolean;
};

const emptyForm = (): FormState => ({
  brand: "",
  model: "",
  customLabel: "",
  isNotAuto: false,
  isPrimary: false,
});

export function CabinetVehiclesSection({ vehicles, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CabinetVehicle | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [brands, setBrands] = useState<Brand[]>([]);
  const [cars, setCars] = useState<CatalogCar[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllBrand()
      .then(setBrands)
      .catch(() => toast.error("Не удалось загрузить марки"));
  }, []);

  useEffect(() => {
    if (!form.brand || form.isNotAuto) {
      setCars([]);
      return;
    }
    const b = brands.find((x) => x.name === form.brand);
    if (b?.id) {
      getAllCarWithBrand(b.id)
        .then(setCars)
        .catch(() => setCars([]));
    }
  }, [form.brand, form.isNotAuto, brands]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm(), isPrimary: vehicles.length === 0 });
    setOpen(true);
  };

  const openEdit = (v: CabinetVehicle) => {
    const hasCustom = Boolean(v.customLabel?.trim());
    setEditing(v);
    setForm({
      brand: hasCustom ? "" : (v.carBrand ?? ""),
      model: hasCustom ? "" : (v.carModelName ?? ""),
      customLabel: v.customLabel ?? "",
      isNotAuto: hasCustom,
      isPrimary: v.isPrimary,
    });
    setOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let carId: number | null = null;
      let customLabel: string | null = null;

      if (form.isNotAuto) {
        const text = form.customLabel.trim();
        if (!text) {
          toast.error("Укажите марку и модель");
          return;
        }
        customLabel = text;
      } else {
        if (!form.brand || !form.model) {
          toast.error("Выберите марку и модель из списка");
          return;
        }
        const found = cars.find((c) => c.model === form.model);
        if (!found) {
          toast.error("Выберите модель из списка");
          return;
        }
        carId = found.id;
      }

      const payload = {
        carId,
        customLabel,
        isPrimary: form.isPrimary,
      };

      if (editing) {
        await cabinetAxios.patch(`/user/vehicles/${editing.id}`, payload);
        toast.success("Автомобиль обновлён");
      } else {
        await cabinetAxios.post("/user/vehicles", payload);
        toast.success("Автомобиль добавлен");
      }
      setOpen(false);
      await onChange();
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? Array.isArray(err.response.data.message)
            ? err.response.data.message[0]
            : String(err.response.data.message)
          : "Ошибка сохранения";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const setPrimary = async (v: CabinetVehicle) => {
    try {
      await cabinetAxios.patch(`/user/vehicles/${v.id}`, { isPrimary: true });
      toast.success("Основной автомобиль обновлён");
      await onChange();
    } catch {
      toast.error("Не удалось сделать основным");
    }
  };

  const archive = async (v: CabinetVehicle) => {
    if (!confirm(`Убрать «${v.label || "автомобиль"}»?`)) return;
    try {
      await cabinetAxios.delete(`/user/vehicles/${v.id}`);
      toast.success("Автомобиль удалён");
      await onChange();
    } catch {
      toast.error("Не удалось удалить");
    }
  };

  return (
    <section className={cabinetCard}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10">
            <CarIcon className="h-5 w-5 text-teal-400" />
          </span>
          <div>
            <h2 className={cabinetH2}>Автомобили</h2>
            <p className={cabinetMuted}>Можно добавить несколько машин</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          className="bg-teal-600 hover:bg-teal-500"
          onClick={openCreate}
        >
          <Plus className="mr-1 h-4 w-4" />
          Добавить
        </Button>
      </div>

      {vehicles.length === 0 ? (
        <p className={`text-sm ${cabinetMuted}`}>Автомобилей пока нет</p>
      ) : (
        <ul className="space-y-2">
          {vehicles.map((v) => (
            <li
              key={v.id}
              className="flex items-start justify-between gap-2 rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2.5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium text-white">
                    {v.label || "Без названия"}
                  </span>
                  {v.isPrimary ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-200">
                      <Star className="h-3 w-3" />
                      основное
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                {!v.isPrimary ? (
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-amber-300"
                    title="Сделать основным"
                    onClick={() => void setPrimary(v)}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                  onClick={() => openEdit(v)}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-red-300"
                  onClick={() => void archive(v)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="mt-5 space-y-4 rounded-xl border border-white/10 bg-slate-950/50 p-4"
        >
          <p className="text-sm font-medium text-white">
            {editing ? "Редактировать авто" : "Новый автомобиль"}
          </p>

          <div className="flex items-center gap-2">
            <Checkbox
              id="cab-not-auto"
              checked={form.isNotAuto}
              onCheckedChange={(checked) => {
                const on = checked === true;
                setForm((f) => ({
                  ...f,
                  isNotAuto: on,
                  ...(on ? { brand: "", model: "" } : { customLabel: "" }),
                }));
              }}
              className="border-white/25 data-[state=checked]:border-teal-500 data-[state=checked]:bg-teal-600"
            />
            <label htmlFor="cab-not-auto" className={`cursor-pointer text-sm ${cabinetLabel}`}>
              Моего автомобиля нет в списке
            </label>
          </div>

          {form.isNotAuto ? (
            <div className="space-y-2">
              <Label className={cabinetLabel}>Ваш автомобиль</Label>
              <Input
                className={cabinetInput}
                placeholder="Например: Toyota Camry 2020"
                value={form.customLabel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customLabel: e.target.value }))
                }
              />
            </div>
          ) : (
            <div className="grid gap-4">
              <div>
                <Label className={`${cabinetLabel} mb-2 block`}>Марка</Label>
                <Autocomplete
                  options={brands.map((b) => ({ value: b.name, label: b.name }))}
                  value={form.brand}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, brand: v, model: "" }))
                  }
                  placeholder="Введите марку для поиска"
                  emptyMessage="Марка не найдена"
                  inputClassName={cabinetAutocompleteInput}
                  dropdownClassName={cabinetAutocompleteDropdown}
                />
              </div>
              {form.brand ? (
                <div>
                  <Label className={`${cabinetLabel} mb-2 block`}>Модель</Label>
                  <Autocomplete
                    options={cars.map((c) => ({
                      value: c.model,
                      label: c.model,
                    }))}
                    value={form.model}
                    onChange={(v) => setForm((f) => ({ ...f, model: v }))}
                    placeholder="Введите модель для поиска"
                    emptyMessage="Модель не найдена"
                    inputClassName={cabinetAutocompleteInput}
                    dropdownClassName={cabinetAutocompleteDropdown}
                  />
                </div>
              ) : null}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="cab-primary"
              checked={form.isPrimary}
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, isPrimary: checked === true }))
              }
              className="border-white/25 data-[state=checked]:border-teal-500 data-[state=checked]:bg-teal-600"
            />
            <label htmlFor="cab-primary" className={`cursor-pointer text-sm ${cabinetLabel}`}>
              Основной автомобиль
            </label>
          </div>

          <div className="flex gap-2">
            <button type="submit" className={cabinetBtnPrimary} disabled={saving}>
              {saving ? "…" : "Сохранить"}
            </button>
            <Button
              type="button"
              variant="ghost"
              className="text-slate-300"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
