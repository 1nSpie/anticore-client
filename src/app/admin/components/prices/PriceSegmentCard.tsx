"use client";

import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { PriceData, SEGMENT_NAMES } from "../../_lib/types";
import { Save } from "lucide-react";

interface PriceSegmentCardProps {
  price: PriceData;
  isSaving: boolean;
  hasChanges: boolean;
  onPriceChange: (
    segment: number,
    field: keyof PriceData,
    value: string
  ) => void;
  onSavePrice: (segment: number) => void;
}

export function PriceSegmentCard({
  price,
  isSaving,
  hasChanges,
  onPriceChange,
  onSavePrice,
}: PriceSegmentCardProps) {
  const fields = [
    { key: "standartML", label: "Стандарт ML" },
    { key: "standartMLBody", label: "Стандарт ML Body" },
    { key: "complexML", label: "Комплекс ML" },
    { key: "complexMLBody", label: "Комплекс ML Body" },
  ] as const;

  return (
    <div className="border border-white/10 rounded-2xl p-5 sm:p-6 bg-slate-900/60 hover:bg-slate-900/80 transition-all duration-200 shadow-lg hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-slate-50 flex items-center gap-2">
          <span className="w-1 h-5 bg-emerald-500 rounded-full" />
          {SEGMENT_NAMES[price.segment] || `Сегмент ${price.segment}`}
        </h3>
        {hasChanges && (
          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
            Есть изменения
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <label className="text-sm text-slate-300 font-medium block">
              {field.label}
            </label>
            <Input
              type="number"
              min="0"
              defaultValue={price[field.key] || ""}
              onChange={(e) =>
                onPriceChange(price.segment, field.key, e.target.value)
              }
              className="bg-slate-900/80 border-white/10 text-slate-50 focus:ring-2 focus:ring-emerald-500/50 transition-all"
              disabled={isSaving}
            />
          </div>
        ))}
      </div>
      <Button
        onClick={() => onSavePrice(price.segment)}
        disabled={isSaving || !hasChanges}
        className={`w-full mt-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-all duration-200 ${
          hasChanges
            ? "hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20"
            : "opacity-50 cursor-not-allowed"
        }`}
      >
        {isSaving ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            Сохранение...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Сохранить изменения
          </span>
        )}
      </Button>
    </div>
  );
}
