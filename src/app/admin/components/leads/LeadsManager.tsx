"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  formatDurationRu,
  leadOverdueMs,
  leadSlaRemainingMs,
} from "../../_lib/leadSla";
import { LeadDayLimitsPanel } from "./LeadDayLimitsPanel";
import { LeadEditDialog } from "./LeadEditDialog";
import { LeadScheduleDialog } from "./LeadScheduleDialog";
import { Button } from "@/shadcn/button";
import { Search, X } from "lucide-react";
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
import { CRM_LOCATION_LABELS } from "../../_lib/crmLocations";

const KIND_LABELS = {
  CALLBACK: "Обратный звонок",
  PRICE_REQUEST: "Расчёт цены",
} as const;

function phoneTelHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("7")) return `tel:+${digits}`;
  if (digits.length === 11 && digits.startsWith("8")) {
    return `tel:+7${digits.slice(1)}`;
  }
  return `tel:${phone}`;
}

export default function LeadsManager() {
  const [leads, setLeads] = useState<SiteLead[]>([]);
  const [filter, setFilter] = useState<LeadFilterStatus>("ALL");
  const [phoneQuery, setPhoneQuery] = useState("");
  /** Цифры запроса после паузы ввода — уходят на сервер. */
  const [phoneSearch, setPhoneSearch] = useState("");

  useEffect(() => {
    const t = window.setTimeout(
      () => setPhoneSearch(phoneQuery.replace(/\D/g, "")),
      300,
    );
    return () => window.clearTimeout(t);
  }, [phoneQuery]);
  const [scheduleLead, setScheduleLead] = useState<SiteLead | null>(null);
  const [scheduleMode, setScheduleMode] = useState<"take" | "edit">("take");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [completeLead, setCompleteLead] = useState<SiteLead | null>(null);
  const [completeLink, setCompleteLink] = useState("");
  const [completing, setCompleting] = useState(false);
  const [workLead, setWorkLead] = useState<SiteLead | null>(null);
  /** Тикает раз в 30 с — пересчёт просрочки без перезагрузки. */
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const load = useCallback(async () => {
    const { data } = await adminApi.get<SiteLead[]>("/crm/leads", {
      params: {
        ...(filter !== "ALL" && { status: filter }),
        ...(phoneSearch && { q: phoneSearch }),
      },
    });
    setLeads(data);
  }, [filter, phoneSearch]);

  // Статусы меняются и на сервере (возврат из «На уточнении», «В работе» по дню записи)
  useEffect(() => {
    const t = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(t);
  }, [load]);

  useEffect(() => {
    void load();
    void adminApi
      .get<ServiceType[]>("/crm/settings/service-types")
      .then(({ data }) => setServiceTypes(data.filter((t) => t.active)));
  }, [load]);

  /** Ещё можно записать в календарь — открываем единое окно заявки+клиента+записи. */
  const canBookLead = (lead: SiteLead) =>
    !lead.visitId &&
    lead.status !== "SCHEDULED" &&
    lead.status !== "REJECTED" &&
    lead.status !== "COMPLETED";

  const openWork = (lead: SiteLead, mode: "edit" | "take") => {
    if (canBookLead(lead)) {
      setScheduleMode(mode === "take" ? "take" : "edit");
      setScheduleLead(lead);
      setDialogOpen(true);
      return;
    }
    setWorkLead(lead);
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

  const filtered = useMemo(() => {
    const list =
      filter === "ALL" ? leads : leads.filter((l) => l.status === filter);
    // Просроченные «Новые» — наверх, самые старые первыми
    return [...list].sort((a, b) => {
      const oa = leadOverdueMs(a, now);
      const ob = leadOverdueMs(b, now);
      if (oa > 0 || ob > 0) return ob - oa;
      return 0;
    });
  }, [leads, filter, now]);

  const overdueCount = useMemo(
    () => leads.filter((l) => leadOverdueMs(l, now) > 0).length,
    [leads, now],
  );

  const canTake = (lead: SiteLead) =>
    lead.status === "NEW" ||
    lead.status === "NEEDS_CLARIFICATION" ||
    lead.status === "PROCESSING";

  const canComplete = (status: SiteLeadStatus) =>
    status !== "REJECTED" && status !== "COMPLETED";

  return (
    <>
      <LeadDayLimitsPanel />

      <div className="relative mb-3 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <Input
          type="search"
          inputMode="tel"
          value={phoneQuery}
          onChange={(e) => setPhoneQuery(e.target.value)}
          placeholder="Поиск по номеру телефона"
          aria-label="Поиск заявок по номеру телефона"
          className="border-white/20 bg-slate-900 pl-9 pr-9 text-white"
        />
        {phoneQuery ? (
          <button
            type="button"
            onClick={() => setPhoneQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-white"
            aria-label="Очистить поиск"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="-mx-1 mb-4 overflow-x-auto pb-1">
        <div className="flex w-max gap-2 px-1">
          {FILTER_STATUSES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? "default" : "outline"}
              className={cn(
                "shrink-0",
                filter !== s ? "border-white/20" : "",
              )}
              onClick={() => setFilter(s)}
            >
              {s === "ALL" ? "Все" : STATUS_LABELS[s]}
              {s === "NEW" && overdueCount > 0 ? (
                <span className="ml-1.5 rounded-full bg-red-600 px-1.5 text-[11px] font-semibold leading-4 text-white">
                  {overdueCount}
                </span>
              ) : null}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400">
            {phoneSearch ? "По этому номеру заявок нет" : "Заявок пока нет"}
          </p>
        )}
        {filtered.map((lead) => {
          const primaryLabel =
            lead.status === "NEW" || lead.status === "NEEDS_CLARIFICATION"
              ? "Взять в работу"
              : canTake(lead)
                ? "Продолжить"
                : "Открыть";
          const canReject =
            lead.status !== "REJECTED" &&
            lead.status !== "SCHEDULED" &&
            lead.status !== "IN_PROGRESS" &&
            lead.status !== "COMPLETED";
          const overdueMs = leadOverdueMs(lead, now);
          const remainingMs = overdueMs ? 0 : leadSlaRemainingMs(lead, now);

          return (
            <article
              key={lead.id}
              className={cn(
                "overflow-hidden rounded-xl border bg-slate-900/50",
                overdueMs > 0
                  ? "border-red-500/70 bg-red-950/30 ring-1 ring-red-500/40"
                  : "border-white/10",
              )}
            >
              {overdueMs > 0 ? (
                <div className="flex items-center gap-2 bg-red-600/90 px-3 py-1.5 text-sm font-medium text-white sm:px-4">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
                  Просрочена на {formatDurationRu(overdueMs)}
                  {lead.surfacedAt ? (
                    <span className="font-normal text-red-100">
                      · вернулась с уточнения
                    </span>
                  ) : null}
                </div>
              ) : lead.status === "NEW" && remainingMs > 0 ? (
                <div className="bg-blue-500/15 px-3 py-1 text-xs text-blue-200 sm:px-4">
                  Обработать в течение {formatDurationRu(remainingMs)}
                </div>
              ) : null}
              <div className="space-y-3 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-base font-semibold leading-snug break-words text-white">
                    {lead.name}
                  </h3>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs leading-5",
                      STATUS_CLASS[lead.status],
                    )}
                  >
                    {STATUS_LABELS[lead.status]}
                  </span>
                </div>

                <a
                  href={phoneTelHref(lead.phone)}
                  className="block text-base font-medium text-emerald-300"
                >
                  {formatPhoneRuDisplay(lead.phone)}
                </a>

                <p className="text-xs leading-5 text-slate-400">
                  {KIND_LABELS[lead.kind]}
                  {lead.location
                    ? ` · ${CRM_LOCATION_LABELS[lead.location]}`
                    : ""}
                  {" · "}
                  {new Date(lead.createdAt).toLocaleString("ru-RU", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

                {lead.followUpAt ? (
                  <p className="text-xs text-orange-400">
                    Вернётся в «Новые»:{" "}
                    {new Date(lead.followUpAt).toLocaleString("ru-RU", {
                      timeZone: "Europe/Moscow",
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                ) : null}
                {lead.status === "IN_PROGRESS" && lead.visit?.startsAt ? (
                  <p className="text-xs text-amber-300">
                    На подъёмнике с{" "}
                    {new Date(lead.visit.startsAt).toLocaleString("ru-RU", {
                      timeZone: "Europe/Moscow",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                ) : null}
                {lead.status === "SCHEDULED" && lead.visit?.startsAt ? (
                  <p className="text-xs text-emerald-300">
                    Запись:{" "}
                    {new Date(lead.visit.startsAt).toLocaleString("ru-RU", {
                      timeZone: "Europe/Moscow",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                ) : null}

                {lead.carDescription ? (
                  <p className="text-sm leading-5 break-words text-slate-200">
                    <span className="text-slate-500">Авто: </span>
                    {lead.carDescription}
                  </p>
                ) : null}
                {lead.message ? (
                  <p className="text-sm leading-5 break-words text-slate-200">
                    <span className="text-slate-500">Сообщение: </span>
                    {lead.message}
                  </p>
                ) : null}
                {lead.adminNote ? (
                  <p className="text-sm leading-5 break-words text-slate-400">
                    <span className="text-slate-500">Комментарий: </span>
                    {lead.adminNote}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-white/10 bg-slate-950/40 p-3 sm:flex sm:flex-wrap sm:justify-end">
                <Button
                  size="sm"
                  className="col-span-2 h-10 sm:col-auto sm:min-w-36"
                  variant={canTake(lead) ? "default" : "outline"}
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
                  {primaryLabel}
                </Button>
                {lead.visitId ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 border-white/20"
                    asChild
                  >
                    <Link href="/admin/calendar">Календарь</Link>
                  </Button>
                ) : null}
                {canComplete(lead.status) ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 border-teal-500/40 text-teal-300"
                    onClick={() => openComplete(lead)}
                  >
                    Выполнена
                  </Button>
                ) : null}
                {canReject ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "h-10 text-slate-400 hover:bg-red-600/20 hover:text-red-400",
                      !canComplete(lead.status) &&
                        !lead.visitId &&
                        "col-span-2 sm:col-auto",
                    )}
                    onClick={() => void rejectLead(lead)}
                  >
                    Отклонить
                  </Button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <LeadEditDialog
        lead={workLead}
        open={workLead !== null}
        mode="edit"
        onOpenChange={(open) => {
          if (!open) setWorkLead(null);
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

      <LeadScheduleDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setScheduleLead(null);
        }}
        lead={scheduleLead}
        mode={scheduleMode}
        serviceTypes={serviceTypes}
        onSaved={async () => {
          await load();
          setScheduleLead(null);
        }}
      />
    </>
  );
}
