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
import { LeadEditDialog } from "./LeadEditDialog";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { Textarea } from "@/shadcn/textarea";
import { Checkbox } from "@/shadcn/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/dialog";
import { toast } from "sonner";
import { cn } from "src/lib/utils";

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
  const [editLead, setEditLead] = useState<SiteLead | null>(null);
  const [followUpDates, setFollowUpDates] = useState<Record<number, string>>({});
  const [followUpEnabled, setFollowUpEnabled] = useState<Record<number, boolean>>(
    {},
  );

  const load = useCallback(async () => {
    const { data } = await adminApi.get<SiteLead[]>("/crm/leads", {
      params: filter !== "ALL" ? { status: filter } : undefined,
    });
    setLeads(data);
    const dates: Record<number, string> = {};
    const enabled: Record<number, boolean> = {};
    for (const lead of data) {
      if (lead.followUpAt) {
        enabled[lead.id] = true;
        dates[lead.id] = lead.followUpAt.slice(0, 10);
      }
    }
    setFollowUpDates(dates);
    setFollowUpEnabled(enabled);
  }, [filter]);

  useEffect(() => {
    void load();
    void adminApi
      .get<ServiceType[]>("/crm/settings/service-types")
      .then(({ data }) => setServiceTypes(data.filter((t) => t.active)));
  }, [load]);

  const updateStatus = async (
    lead: SiteLead,
    status: SiteLeadStatus,
    adminNote?: string,
  ) => {
    if (
      requiresAdminNoteOnStatusChange(lead.status, status) &&
      !hasAdminNote(adminNote ?? lead.adminNote)
    ) {
      toast.error("Укажите комментарий администратора перед сменой статуса");
      return;
    }
    try {
      await adminApi.patch(`/crm/leads/${lead.id}`, { status });
      toast.success("Статус обновлён");
      await load();
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null;
      toast.error(msg || "Не удалось обновить статус");
    }
  };

  const saveNote = async (id: number, adminNote: string) => {
    await adminApi.patch(`/crm/leads/${id}`, { adminNote });
    toast.success("Заметка сохранена");
    await load();
  };

  const saveFollowUp = async (lead: SiteLead) => {
    const enabled = followUpEnabled[lead.id];
    const date = followUpDates[lead.id];
    if (enabled && !date) {
      toast.error("Укажите дату повторной связи");
      return;
    }
    try {
      await adminApi.patch(`/crm/leads/${lead.id}`, {
        followUpAt: enabled && date ? `${date}T09:00:00.000Z` : null,
      });
      toast.success(
        enabled ? "Повторная связь запланирована" : "Повторная связь отменена",
      );
      await load();
    } catch {
      toast.error("Не удалось сохранить дату повторной связи");
    }
  };

  const openSchedule = (lead: SiteLead) => {
    if (
      requiresAdminNoteOnStatusChange(lead.status, "SCHEDULED") &&
      !hasAdminNote(lead.adminNote)
    ) {
      toast.error("Укажите комментарий администратора перед записью в календарь");
      return;
    }
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

  const canSchedule = (status: SiteLeadStatus) =>
    status !== "SCHEDULED" &&
    status !== "REJECTED" &&
    status !== "COMPLETED";

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
                    onClick={() => void updateStatus(lead, "IN_PROGRESS")}
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
                      className="text-slate-400 hover:bg-red-600/20 hover:text-red-400"
                      onClick={() => void updateStatus(lead, "REJECTED")}
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
                placeholder="Комментарий администратора"
                defaultValue={lead.adminNote ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (lead.adminNote ?? "")) {
                    void saveNote(lead.id, e.target.value);
                  }
                }}
              />
            </div>

            {lead.status !== "REJECTED" && lead.status !== "COMPLETED" && (
              <div className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-white/5 bg-slate-800/40 p-3">
                <label className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={followUpEnabled[lead.id] ?? false}
                    onCheckedChange={(v) =>
                      setFollowUpEnabled((prev) => ({
                        ...prev,
                        [lead.id]: v === true,
                      }))
                    }
                    className="border-white/20 data-[state=checked]:bg-orange-600"
                  />
                  <span className="text-sm text-slate-200">Повторная связь</span>
                </label>
                {(followUpEnabled[lead.id] ?? false) && (
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400">Дата</Label>
                    <Input
                      type="date"
                      className="border-white/15 bg-slate-900 text-sm text-white"
                      value={followUpDates[lead.id] ?? ""}
                      onChange={(e) =>
                        setFollowUpDates((prev) => ({
                          ...prev,
                          [lead.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/20"
                  onClick={() => void saveFollowUp(lead)}
                >
                  Сохранить дату
                </Button>
              </div>
            )}
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
