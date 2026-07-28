"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Label } from "@/shadcn/label";
import { Autocomplete } from "@/shadcn/autocomplete";
import type { Brand, Car } from "../../_lib/types";

type Props = {
  brand: string;
  model: string;
  brands: Brand[];
  cars: Car[];
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
  inputClassName?: string;
};

export function CarCatalogFields({
  brand,
  model,
  brands,
  cars,
  onBrandChange,
  onModelChange,
  inputClassName = "border-white/20 bg-slate-800 text-slate-100",
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-slate-200">Автомобиль</Label>
        <Link
          href="/admin/auto"
          target="_blank"
          className="inline-flex items-center gap-1 text-xs text-emerald-300 hover:underline"
        >
          Добавить модель
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      <p className="text-xs text-slate-500">
        Выберите марку и модель из каталога. Если модели нет — добавьте её во вкладке
        «Автомобили» в админке, затем обновите форму.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Autocomplete
          options={brands.map((b) => ({ value: b.name, label: b.name }))}
          value={brand}
          onChange={(v) => {
            onBrandChange(v);
            onModelChange("");
          }}
          placeholder="Марка"
          emptyMessage="Марка не найдена"
          inputClassName={inputClassName}
        />
        <Autocomplete
          options={cars.map((c) => ({ value: c.model, label: c.model }))}
          value={model}
          onChange={onModelChange}
          placeholder={brand ? "Модель" : "Сначала марка"}
          emptyMessage={brand ? "Модель не найдена" : "Выберите марку"}
          inputClassName={inputClassName}
          disabled={!brand}
        />
      </div>
    </div>
  );
}
