"use client";

import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../_lib/api";
import type { PriceData } from "../../_lib/types";
import { segmentName } from "@/lib/segments";

const SERVICE_ITEMS = [
  { key: "standartML" as const, label: "Стандарт ML" },
  { key: "standartMLBody" as const, label: "Стандарт ML+BODY" },
  { key: "complexML" as const, label: "Комплекс ML" },
  { key: "complexMLBody" as const, label: "Комплекс ML+BODY" },
];

function formatPrice(value: number | null | undefined): string {
  return value == null ? "Договорная" : `${value.toLocaleString("ru-RU")} ₽`;
}

type Props = {
  segment: number | null;
  brand?: string;
  model?: string;
};

export function SegmentPricePreview({ segment, brand, model }: Props) {
  const [segments, setSegments] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .get<PriceData[]>("/segment")
      .then(({ data }) => {
        if (!cancelled) setSegments(data);
      })
      .catch(() => {
        if (!cancelled) setSegments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const prices = useMemo(
    () => segments.find((s) => s.segment === segment) ?? null,
    [segments, segment],
  );

  if (!segment) return null;

  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4">
      <h4 className="text-sm font-semibold text-emerald-200">
        Стоимость обработки
      </h4>
      {(brand || model) && (
        <p className="mt-1 text-xs text-slate-400">
          {[brand, model].filter(Boolean).join(" ")}
        </p>
      )}
      <p className="mt-1 text-xs text-slate-500">
        {segmentName(segment)}
      </p>
      {loading ? (
        <p className="mt-3 text-sm text-slate-400">Загрузка цен…</p>
      ) : !prices ? (
        <p className="mt-3 text-sm text-slate-400">Цены для сегмента не найдены</p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SERVICE_ITEMS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-2 rounded-md border border-white/10 bg-slate-900/60 px-3 py-2 text-sm"
            >
              <span className="text-slate-300">{item.label}</span>
              <span className="font-medium text-emerald-300">
                {formatPrice(prices[item.key])}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
