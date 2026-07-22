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

type Visit = {
  id: number;
  visitDate: string;
  serviceType: string;
  diskLink?: string | null;
};

export default function CabinetHistoryPage() {
  const [items, setItems] = useState<Visit[] | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await cabinetAxios.get<Visit[]>("/user/history/visits");
        setItems(data);
      } catch {
        toast.error("Не удалось загрузить историю");
        setItems([]);
      }
    })();
  }, []);

  if (items === null) {
    return (
      <div className={`animate-pulse ${cabinetCard}`}>
        <div className={`h-24 ${cabinetSkeleton} mb-3`} />
        <div className={`h-24 ${cabinetSkeleton} mb-3`} />
        <div className={`h-24 ${cabinetSkeleton}`} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${cabinetCard} text-center py-12 px-6`}>
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 border border-white/10 mb-4">
          <Inbox className="h-7 w-7 text-slate-500" />
        </span>
        <h2 className="text-lg font-semibold text-white">Пока нет визитов</h2>
        <p className={`${cabinetMuted} mt-2 max-w-sm mx-auto`}>
          После обслуживания администратор добавит запись — она появится здесь автоматически.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((v, i) => (
        <li key={v.id} className={`${cabinetCard} relative pl-4 sm:pl-5`}>
          <span
            className="absolute left-0 top-6 bottom-6 w-px bg-gradient-to-b from-teal-500/50 to-transparent hidden sm:block"
            aria-hidden
          />
          <span
            className="absolute -left-[5px] top-7 h-2.5 w-2.5 rounded-full bg-teal-500 ring-4 ring-teal-500/20 hidden sm:block"
            aria-hidden
          />
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20">
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
              <p className={`${cabinetText} text-sm mt-1`}>{v.serviceType}</p>
              {v.diskLink && (
                <a
                  href={v.diskLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 mt-3 text-sm ${cabinetLink}`}
                >
                  Материалы на диске →
                </a>
              )}
            </div>
            <span className="text-xs text-slate-600 font-mono shrink-0 hidden sm:inline">
              #{items.length - i}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
