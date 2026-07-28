"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClipboardList, Inbox, ExternalLink } from "lucide-react";
import { cabinetAxios } from "../../_lib/api";
import {
  cabinetCard,
  cabinetMuted,
  cabinetLink,
  cabinetText,
  cabinetTextAccent,
  cabinetSkeleton,
  cabinetH2,
} from "../../_lib/cabinetUi";
import { cn } from "@/lib/utils";

type LeadStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "SCHEDULED"
  | "REJECTED"
  | "COMPLETED";

type LeadKind = "CALLBACK" | "PRICE_REQUEST";

type Lead = {
  id: number;
  kind: LeadKind;
  status: LeadStatus;
  message: string | null;
  carDescription: string | null;
  createdAt: string;
  processedAt: string | null;
  diskLink: string | null;
};

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Принята",
  IN_PROGRESS: "В работе",
  SCHEDULED: "Запланирован визит",
  REJECTED: "Отклонена",
  COMPLETED: "Выполнена",
};

const STATUS_CLASS: Record<LeadStatus, string> = {
  NEW: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  IN_PROGRESS: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  SCHEDULED: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  REJECTED: "bg-slate-500/15 text-slate-400 border-slate-500/25",
  COMPLETED: "bg-teal-500/15 text-teal-300 border-teal-500/25",
};

const KIND_LABELS: Record<LeadKind, string> = {
  CALLBACK: "Обратный звонок",
  PRICE_REQUEST: "Расчёт цены",
};

export default function CabinetApplicationsPage() {
  const [items, setItems] = useState<Lead[] | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await cabinetAxios.get<Lead[]>("/user/leads");
        setItems(data);
      } catch {
        toast.error("Не удалось загрузить заявки");
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

  return (
    <div>
      <div className="mb-6">
        <h2 className={cabinetH2}>Мои заявки</h2>
        <p className={`${cabinetMuted} mt-1`}>
          Статусы обновляются менеджером. После выполнения здесь появится ссылка на
          материалы.
        </p>
      </div>

      {items.length === 0 ? (
        <div className={`${cabinetCard} text-center py-12 px-6`}>
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 border border-white/10 mb-4">
            <Inbox className="h-7 w-7 text-slate-500" />
          </span>
          <h3 className="text-lg font-semibold text-white">Заявок пока нет</h3>
          <p className={`${cabinetMuted} mt-2 max-w-sm mx-auto`}>
            Оставьте заявку на сайте с номером телефона из профиля — она появится
            здесь.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((lead) => (
            <li key={lead.id} className={`${cabinetCard} relative`}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20">
                  <ClipboardList className="h-5 w-5 text-teal-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`${cabinetTextAccent} font-semibold`}>
                      {KIND_LABELS[lead.kind]}
                    </p>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs font-medium",
                        STATUS_CLASS[lead.status],
                      )}
                    >
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </div>
                  <p className={`${cabinetMuted} text-xs mt-1`}>
                    {new Date(lead.createdAt).toLocaleString("ru-RU")}
                  </p>
                  {lead.carDescription && (
                    <p className={`${cabinetText} text-sm mt-2`}>
                      {lead.carDescription}
                    </p>
                  )}
                  {lead.message && (
                    <p className={`${cabinetText} text-sm mt-1 text-slate-400`}>
                      {lead.message}
                    </p>
                  )}
                  {lead.status === "COMPLETED" && lead.diskLink && (
                    <a
                      href={lead.diskLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 mt-3 text-sm ${cabinetLink}`}
                    >
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      Материалы на Яндекс.Диске
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
