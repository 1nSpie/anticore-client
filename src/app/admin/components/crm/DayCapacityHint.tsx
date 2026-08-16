"use client";

import { useEffect, useState } from "react";
import { adminApi } from "../../_lib/api";
import type { CrmAppointment } from "../../_lib/crmTypes";
import {
  CRM_LOCATION_LABELS,
  type CrmLocationCode,
} from "../../_lib/crmLocations";
import { cn } from "src/lib/utils";

type DayLimit = {
  date: string;
  maxAppointments: number;
};

type Props = {
  startsAt: string;
  location: CrmLocationCode | "";
  /** Текущая запись уже занимает место — не вычитаем её повторно. */
  excludeAppointmentId?: number | null;
};

function datePart(value: string) {
  return value.slice(0, 10);
}

export function DayCapacityHint({
  startsAt,
  location,
  excludeAppointmentId,
}: Props) {
  const date = datePart(startsAt);
  const [booked, setBooked] = useState(0);
  const [limit, setLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date || !location) {
      setBooked(0);
      setLimit(null);
      return;
    }

    const year = Number(date.slice(0, 4));
    const month = Number(date.slice(5, 7));
    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);
    let cancelled = false;
    setLoading(true);

    void adminApi
      .get<CrmAppointment[]>("/crm/appointments", {
        params: {
          from: dayStart.toISOString(),
          to: dayEnd.toISOString(),
          location,
        },
      })
      .then(({ data }) => {
        if (cancelled) return;
        setBooked(data.filter((a) => a.id !== excludeAppointmentId).length);
      })
      .catch(() => {
        if (!cancelled) setBooked(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    void adminApi
      .get<DayLimit[]>("/crm/settings/day-limits", {
        params: { year, month, location },
      })
      .then(({ data }) => {
        if (cancelled) return;
        const row = data.find((l) => l.date === date);
        setLimit(row ? row.maxAppointments : null);
      })
      .catch(() => {
        if (!cancelled) setLimit(null);
      });

    return () => {
      cancelled = true;
    };
  }, [date, location, excludeAppointmentId]);

  if (!date) return null;

  if (!location) {
    return (
      <p className="text-xs text-amber-300/90">
        Выберите филиал — покажем, сколько мест осталось.
      </p>
    );
  }

  const city = CRM_LOCATION_LABELS[location];

  if (loading && limit === null) {
    return (
      <p className="text-xs text-slate-500">
        Проверяем лимит · {city}…
      </p>
    );
  }

  if (limit === null) {
    return (
      <p className="text-xs text-slate-500">
        {city}: лимит на {date} не задан — можно записывать без ограничения
        {booked > 0 ? ` (уже ${booked})` : ""}.
      </p>
    );
  }

  const remaining = Math.max(0, limit - booked);
  const closed = limit === 0 || remaining === 0;

  return (
    <p
      className={cn(
        "text-sm",
        closed ? "text-amber-300" : "text-emerald-300",
      )}
    >
      {limit === 0
        ? `${city}: день закрыт (лимит 0) — записывать нельзя`
        : remaining === 0
          ? `${city}: мест нет, уже ${booked} из ${limit}`
          : `${city}: можно записать ещё ${remaining} (занято ${booked} из ${limit})`}
    </p>
  );
}
