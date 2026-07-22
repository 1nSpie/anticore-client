"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatPhoneRuDisplay } from "@/lib/phoneRu";
import { adminApi } from "../../_lib/api";
import type { SiteLead, SiteLeadStatus, ServiceType } from "../../_lib/crmTypes";
import { AppointmentDialog } from "../crm/AppointmentDialog";
import { LeadEditDialog } from "./LeadEditDialog";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { Textarea } from "@/shadcn/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/dialog";
import { toast } from "sonner";
import { cn } from "src/lib/utils";

const STATUS_LABELS: Record<SiteLeadStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  SCHEDULED: "В календаре",
  REJECTED: "Отклонена",
  COMPLETED: "Выполнена",
};

const STATUS_CLASS: Record<SiteLeadStatus, string> = {
  NEW: "bg-blue-500/20 text-blue-300",
  IN_PROGRESS: "bg-amber-500/20 text-amber-300",
  SCHEDULED: "bg-emerald-500/20 text-emerald-300",
  REJECTED: "bg-slate-500/20 text-slate-400",
  COMPLETED: "bg-teal-500/20 text-teal-300",
};

const KIND_LABELS = {
  CALLBACK: "Обратный звонок",
  PRICE_REQUEST: "Расчёт цены",
} as const;

const FILTER_STATUSES = [
  "ALL",
  "NEW",
  "IN_PROGRESS",
  "SCHEDULED",
  "COMPLETED",
  "REJECTED",
] as const;

export default function LeadsManager() {
  const [leads, setLeads] = useState<SiteLead[]>([]);
  const [filter, setFilter] = useState<(typeof FILTER_STATUSES)[number]>("ALL");
  const [scheduleLead, setScheduleLead] = useState<SiteLead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [completeLead, setCompleteLead] = useState<SiteLead | null>(null);
  const [completeLink, setCompleteLink] = useState("");
  const [completing, setCompleting] = useState(false);
  const [editLead, setEditLead] = useState<SiteLead | null>(null);

  const load = useCallback(async () => {
    const { data } = await adminApi.get<SiteLead[]>("/crm/leads", {
      params: filter !== "ALL" ? { status: filter } : undefined,
    });
    setLeads(data);
  }, [filter]);

  useEffect(() => {
    void load();
    void adminApi
      .get<ServiceType[]>("/crm/settings/service-types")
      .then(({ data }) => setServiceTypes(data.filter((t) => t.active)));
  }, [load]);

  const updateStatus = async (id: number, status: SiteLeadStatus) => {
    await adminApi.patch(`/crm/leads/${id}`, { status });
    toast.success("Статус обновлён");
    await load();
  };

  const saveNote = async (id: number, adminNote: string) => {
    await adminApi.patch(`/crm/leads/${id}`, { adminNote });
    toast.success("Заметка сохранена");
    await load();
  };

  const openSchedule = (lead: SiteLead) => {
    setScheduleLead(lead);
    setDialogOpen(true);
  };

  const openComplete = (lead: SiteLead) => {
    setCompleteLead(lead);
    setCompleteLink(lead.diskLink ?? "");
  };

  const submitComplete = async () => {
    if (!completeLead) return;
    const link = completeLink.trim();
    if (!link) {
      toast.error("Укажите ссылку на Яндекс.Диск");
      return;
    }
    setCompleting(true);
    try {
      await adminApi.patch(`/crm/leads/${completeLead.id}`, {
        status: "COMPLETED",
        diskLink: link,
      });
      toast.success("Заявка выполнена");
      setCompleteLead(null);
      setCompleteLink("");
      await load();
    } catch {
      toast.error("Не удалось закрыть заявку");
    } finally {
      setCompleting(false);
    }
  };

  const filtered =
    filter === "ALL" ? leads : leads.filter((l) => l.status === filter);

  const canSchedule = (status: SiteLeadStatus) =>
    status !== "SCHEDULED" && status !== "REJECTED" && status !== "COMPLETED";

  const canComplete = (status: SiteLeadStatus) =>
    status !== "REJECTED" && status !== "COMPLETED";

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTER_STATUSES.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filter === s ? "default" : "outline"}
            className={filter !== s ? "border-white/20" : ""}
            onClick={() => setFilter(s)}
          >
            {s === "ALL" ? "Все" : STATUS_LABELS[s]}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400">Заявок пока нет</p>
        )}
        {filtered.map((lead) => (
          <article
            key={lead.id}
            className="rounded-xl border border-white/10 bg-slate-900/50 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">{lead.name}</h3>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      STATUS_CLASS[lead.status],
                    )}
                  >
                    {STATUS_LABELS[lead.status]}
                  </span>
                  <span className="text-xs text-slate-500">
                    {KIND_LABELS[lead.kind]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  {formatPhoneRuDisplay(lead.phone)}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(lead.createdAt).toLocaleString("ru-RU")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20"
                  onClick={() => setEditLead(lead)}
                >
                  Редактировать
                </Button>
                {canSchedule(lead.status) && (
                  <Button size="sm" onClick={() => openSchedule(lead)}>
                    В календарь
                  </Button>
                )}
                {canComplete(lead.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-teal-500/40 text-teal-300"
                    onClick={() => openComplete(lead)}
                  >
                    Выполнена
                  </Button>
                )}
                {lead.visitId && (
                  <Button size="sm" variant="outline" className="border-white/20" asChild>
                    <Link href="/admin/calendar">Открыть календарь</Link>
                  </Button>
                )}
                {lead.status === "NEW" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20"
                    onClick={() => void updateStatus(lead.id, "IN_PROGRESS")}
                  >
                    В работу
                  </Button>
                )}
                {lead.status !== "REJECTED" &&
                  lead.status !== "SCHEDULED" &&
                  lead.status !== "COMPLETED" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400"
                      onClick={() => void updateStatus(lead.id, "REJECTED")}
                    >
                      Отклонить
                    </Button>
                  )}
              </div>
            </div>

            {(lead.message || lead.carDescription || lead.pageUrl) && (
              <div className="mt-3 space-y-1 text-sm text-slate-300">
                {lead.carDescription && (
                  <p>
                    <span className="text-slate-500">Авто: </span>
                    {lead.carDescription}
                  </p>
                )}
                {lead.message && (
                  <p>
                    <span className="text-slate-500">Сообщение: </span>
                    {lead.message}
                  </p>
                )}
                {lead.pageUrl && (
                  <p className="text-xs text-slate-500">Страница: {lead.pageUrl}</p>
                )}
              </div>
            )}

            {lead.status === "COMPLETED" && lead.diskLink && (
              <p className="mt-3 text-sm">
                <span className="text-slate-500">Яндекс.Диск: </span>
                <a
                  href={lead.diskLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:underline break-all"
                >
                  {lead.diskLink}
                </a>
              </p>
            )}

            <div className="mt-3">
              <Textarea
                rows={2}
                className="border-white/15 bg-slate-800 text-sm text-white"
                placeholder="Заметка администратора"
                defaultValue={lead.adminNote ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (lead.adminNote ?? "")) {
                    void saveNote(lead.id, e.target.value);
                  }
                }}
              />
            </div>
          </article>
        ))}
      </div>

      <LeadEditDialog
        lead={editLead}
        open={editLead !== null}
        onOpenChange={(open) => {
          if (!open) setEditLead(null);
        }}
        onSaved={load}
      />

      <Dialog
        open={completeLead !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCompleteLead(null);
            setCompleteLink("");
          }
        }}
      >
        <DialogContent className="border-white/10 bg-slate-950 text-white">
          <DialogHeader>
            <DialogTitle>Закрыть заявку</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            Укажите ссылку на материалы в Яндекс.Диске — клиент увидит её в личном
            кабинете.
          </p>
          <div className="space-y-2">
            <Label htmlFor="lead-disk-link">Ссылка на Яндекс.Диск</Label>
            <Input
              id="lead-disk-link"
              value={completeLink}
              onChange={(e) => setCompleteLink(e.target.value)}
              placeholder="https://disk.yandex.ru/..."
              className="border-white/15 bg-slate-900"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/20"
              onClick={() => {
                setCompleteLead(null);
                setCompleteLink("");
              }}
            >
              Отмена
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-500"
              disabled={completing}
              onClick={() => void submitComplete()}
            >
              {completing ? "Сохранение…" : "Выполнена"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setScheduleLead(null);
        }}
        appointment={null}
        slot={null}
        serviceTypes={serviceTypes}
        leadId={scheduleLead?.id ?? null}
        initialClientQuery={
          scheduleLead ? scheduleLead.phone : undefined
        }
        onSaved={async () => {
          await load();
          setScheduleLead(null);
        }}
      />
    </>
  );
}
