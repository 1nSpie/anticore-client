"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Inbox } from "lucide-react";
import { cabinetAxios } from "../../_lib/api";
import {
  cabinetCard,
  cabinetMuted,
  cabinetLink,
  cabinetText,
  cabinetTextAccent,
  cabinetSkeleton,
} from "../../_lib/cabinetUi";
import type { CabinetVehicle } from "../profile/CabinetVehiclesSection";

type Visit = {
  id: number;
  visitDate: string;
  serviceType: string;
  diskLink?: string | null;
  vehicleId?: number | null;
  vehicleLabel?: string | null;
};

export default function CabinetHistoryPage() {
  const [items, setItems] = useState<Visit[] | null>(null);
  const [vehicles, setVehicles] = useState<CabinetVehicle[]>([]);
  const [filterVehicleId, setFilterVehicleId] = useState<number | null>(null);

  useEffect(() => {
    void cabinetAxios
      .get<CabinetVehicle[]>("/user/vehicles")
      .then(({ data }) => setVehicles(data))
      .catch(() => setVehicles([]));
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const qs =
          filterVehicleId != null ? `?vehicleId=${filterVehicleId}` : "";
        const { data } = await cabinetAxios.get<Visit[]>(
          `/user/history/visits${qs}`,
        );
        setItems(data);
      } catch {
        toast.error("Не удалось загрузить историю");
        setItems([]);
      }
    })();
  }, [filterVehicleId]);

  if (items === null) {
    return (
      <div className={`animate-pulse ${cabinetCard}`}>
        <div className={`mb-3 h-24 ${cabinetSkeleton}`} />
        <div className={`mb-3 h-24 ${cabinetSkeleton}`} />
        <div className={`h-24 ${cabinetSkeleton}`} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {vehicles.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterVehicleId(null)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              filterVehicleId == null
                ? "bg-teal-500/20 text-teal-200 ring-1 ring-teal-500/40"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            Все авто
          </button>
          {vehicles.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setFilterVehicleId(v.id)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                filterVehicleId === v.id
                  ? "bg-teal-500/20 text-teal-200 ring-1 ring-teal-500/40"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {v.label || `Авто #${v.id}`}
            </button>
          ))}
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className={`${cabinetCard} px-6 py-12 text-center`}>
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-slate-800/80">
            <Inbox className="h-7 w-7 text-slate-500" />
          </span>
          <h2 className="text-lg font-semibold text-white">Пока нет визитов</h2>
          <p className={`${cabinetMuted} mx-auto mt-2 max-w-sm`}>
            {filterVehicleId
              ? "Для выбранного автомобиля записей нет."
              : "После обслуживания администратор добавит запись — она появится здесь автоматически."}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((v, i) => (
            <li key={v.id} className={`${cabinetCard} relative pl-4 sm:pl-5`}>
              <span
                className="absolute bottom-6 left-0 top-6 hidden w-px bg-gradient-to-b from-teal-500/50 to-transparent sm:block"
                aria-hidden
              />
              <span
                className="absolute -left-[5px] top-7 hidden h-2.5 w-2.5 rounded-full bg-teal-500 ring-4 ring-teal-500/20 sm:block"
                aria-hidden
              />
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10">
                  <CalendarDays className="h-5 w-5 text-teal-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`${cabinetTextAccent} font-semibold`}>
                    {new Date(v.visitDate).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className={`${cabinetText} mt-1 text-sm`}>{v.serviceType}</p>
                  {v.vehicleLabel ? (
                    <p className={`mt-1 text-xs ${cabinetMuted}`}>
                      {v.vehicleLabel}
                    </p>
                  ) : null}
                  {v.diskLink && (
                    <a
                      href={v.diskLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-3 inline-flex items-center gap-1 text-sm ${cabinetLink}`}
                    >
                      Материалы на диске →
                    </a>
                  )}
                </div>
                <span className="hidden shrink-0 font-mono text-xs text-slate-600 sm:inline">
                  #{items.length - i}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
