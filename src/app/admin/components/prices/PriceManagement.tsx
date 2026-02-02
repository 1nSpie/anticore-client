"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/card";
import { PriceData } from "../../_lib/types";
import { PriceSegmentCard } from "./PriceSegmentCard";

interface PriceManagementProps {
  prices: PriceData[];
  loading: boolean;
  editingPrices: Record<number, Partial<PriceData>>;
  onPriceChange: (
    segment: number,
    field: keyof PriceData,
    value: string
  ) => void;
  onSavePrice: (segment: number) => void;
}

export function PriceManagement({
  prices,
  loading,
  editingPrices,
  onPriceChange,
  onSavePrice,
}: PriceManagementProps) {
  if (loading && prices.length === 0) {
    return (
      <Card className="bg-slate-900/60 border border-white/10">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-200 mt-4">Загрузка цен...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/60 border border-white/10 shadow-xl">
      <CardHeader>
        <CardTitle className="text-slate-50 flex items-center gap-2">
          <span className="w-1 h-6 bg-emerald-500 rounded-full" />
          Управление ценами по классам автомобилей
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {prices.map((price) => (
            <PriceSegmentCard
              key={price.id}
              price={price}
              isSaving={loading}
              hasChanges={
                Object.keys(editingPrices[price.segment] || {}).length > 0
              }
              onPriceChange={onPriceChange}
              onSavePrice={onSavePrice}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
