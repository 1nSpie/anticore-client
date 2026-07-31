"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatPhoneRuDisplay } from "@/lib/phoneRu";
import { adminApi } from "../../_lib/api";
import type { SiteLead, SiteLeadStatus, ServiceType } from "../../_lib/crmTypes";
import {
  FILTER_STATUSES,
  STATUS_CLASS,
  STATUS_LABELS,
  hasAdminNote,
  requiresAdminNoteOnStatusChange,
  type LeadFilterStatus,
} from "../../_lib/leadStatus";
import { AppointmentDialog } from "../crm/AppointmentDialog";
import { LeadDayLimitsPanel } from "./LeadDayLimitsPanel";
import { LeadEditDialog } from "./LeadEditDialog";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/dialog";
import { toast } from "sonner";
import { cn } from "src/lib/utils";
import { CRM_LOCATION_LABELS, DEFAULT_CRM_LOCATION } from "../../_lib/crmLocations";

const KIND_LABELS = {
  CALLBACK: "Обратный звонок",
  PRICE_REQUEST: "Расчёт цены",
} as const;

export default function LeadsManager() {
  const [leads, setLeads] = useState<SiteLead[]>([]);
  const [filter, setFilter] = useState<LeadFilterStatus>("ALL");
  const [scheduleLead, setScheduleLead] = useState<SiteLead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [completeLead, setCompleteLead] = useState<SiteLead | null>(null);
  const [completeLink, setCompleteLink] = useState("");
  const [completing, setCompleting] = useState(false);
  const [workLead, setWorkLead] = useState<SiteLead | null>(null);
  const [workMode, setWorkMode] = useState<"edit" | "take">("edit");

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

  const openWork = (lead: SiteLead, mode: "edit" | "take") => {
    setWorkMode(mode);
    setWorkLead(lead);
  };

  const openSchedule = (lead: SiteLead) => {
    if (lead.visitId || lead.status === "SCHEDULED") {
      toast.error("Эта заявка уже записана в календарь");
      return;
    }
    if (
      requiresAdminNoteOnStatusChange(lead.status, "SCHEDULED") &&
      !hasAdminNote(lead.adminNote)
    ) {
      toast.error(
        "Укажите комментарий администратора перед записью в календарь",
      );
      return;
    }
    setScheduleLead(lead);
    setDialogOpen(true);
  };

  const rejectLead = async (lead: SiteLead) => {
    if (
      requiresAdminNoteOnStatusChange(lead.status, "REJECTED") &&
      !hasAdminNote(lead.adminNote)
    ) {
      toast.error("Откройте заявку и укажите комментарий перед отклонением");
      openWork(lead, "take");
      return;
    }
    try {
      await adminApi.patch(`/crm/leads/${lead.id}`, { status: "REJECTED" });
      toast.success("Заявка отклонена");
      await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      toast.error(msg || "Не удалось отклонить заявку");
    }
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
    if (
      requiresAdminNoteOnStatusChange(completeLead.status, "COMPLETED") &&
      !hasAdminNote(completeLead.adminNote)
    ) {
      toast.error("Укажите комментарий администратора перед закрытием заявки");
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

  const canTake = (lead: SiteLead) =>
    lead.status === "NEW" ||
    lead.status === "NEEDS_CLARIFICATION" ||
    lead.status === "IN_PROGRESS";

  const canComplete = (status: SiteLeadStatus) =>
    status !== "REJECTED" && status !== "COMPLETED";

  return (
    <>
      <LeadDayLimitsPanel />

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
              <div className="min-w-0 flex-1">
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
                  {lead.location && (
                    <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-xs text-sky-300">
                      {CRM_LOCATION_LABELS[lead.location]}
                    </span>
                  )}
                  {lead.followUpAt && (
                    <span className="text-xs text-orange-400">
                      Повторная связь:{" "}
                      {new Date(lead.followUpAt).toLocaleDateString("ru-RU")}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  {formatPhoneRuDisplay(lead.phone)}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(lead.createdAt).toLocaleString("ru-RU")}
                </p>
                {(lead.carDescription || lead.message) && (
                  <div className="mt-2 space-y-1 text-sm text-slate-300">
                    {lead.carDescription && (
                      <p>
                        <span className="text-slate-500">Авто: </span>
                        {lead.carDescription}
                      </p>
                    )}
                    {lead.message && (
                      <p className="line-clamp-2">
                        <span className="text-slate-500">Сообщение: </span>
                        {lead.message}
                      </p>
                    )}
                  </div>
                )}
                {lead.adminNote && (
                  <p className="mt-2 text-xs text-slate-400">
                    <span className="text-slate-500">Комментарий: </span>
                    {lead.adminNote}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {canTake(lead) && (
                  <Button
                    size="sm"
                    onClick={() =>
                      openWork(
                        lead,
                        lead.status === "NEW" ||
                          lead.status === "NEEDS_CLARIFICATION"
                          ? "take"
                          : "edit",
                      )
                    }
                  >
                    {lead.status === "NEW" ||
                    lead.status === "NEEDS_CLARIFICATION"
                      ? "Взять в работу"
                      : "Продолжить"}
                  </Button>
                )}
                {!canTake(lead) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20"
                    onClick={() => openWork(lead, "edit")}
                  >
                    Открыть
                  </Button>
                )}
                {lead.visitId && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20"
                    asChild
                  >
                    <Link href="/admin/calendar">Календарь</Link>
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
                {lead.status !== "REJECTED" &&
                  lead.status !== "SCHEDULED" &&
                  lead.status !== "COMPLETED" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:bg-red-600/20 hover:text-red-400"
                      onClick={() => void rejectLead(lead)}
                    >
                      Отклонить
                    </Button>
                  )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <LeadEditDialog
        lead={workLead}
        open={workLead !== null}
        mode={workMode}
        onOpenChange={(open) => {
          if (!open) setWorkLead(null);
        }}
        onSaved={load}
        onSchedule={(lead) => {
          setWorkLead(null);
          openSchedule(lead);
        }}
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
            Укажите ссылку на материалы в Яндекс.Диске — клиент увидит её в
            личном кабинете.
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
        initialClientQuery={scheduleLead ? scheduleLead.phone : undefined}
        defaultLocation={scheduleLead?.location ?? DEFAULT_CRM_LOCATION}
        onSaved={async () => {
          await load();
          setScheduleLead(null);
        }}
      />
    </>
  );
}
