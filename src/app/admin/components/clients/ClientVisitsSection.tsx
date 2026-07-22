"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { adminApi } from "../../_lib/api";
import type { CrmClientVisit, ServiceType } from "../../_lib/crmTypes";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/card";
import { toast } from "sonner";

type Props = {
  clientId: number;
  visits: CrmClientVisit[];
  onVisitsChange: () => void | Promise<void>;
};

const fieldClass = "border-white/20 bg-slate-800 text-white";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function visitStartIso(v: CrmClientVisit): string {
  if (v.startsAt) return v.startsAt;
  const d = new Date(v.visitDate);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

function visitEndIso(v: CrmClientVisit): string {
  if (v.endsAt) return v.endsAt;
  return new Date(new Date(visitStartIso(v)).getTime() + 60 * 60 * 1000).toISOString();
}

function formatVisitWhen(v: CrmClientVisit): string {
  const start = visitStartIso(v);
  return new Date(start).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function visitToForm(v: CrmClientVisit) {
  return {
    startsAt: toLocalInput(visitStartIso(v)),
    endsAt: toLocalInput(visitEndIso(v)),
    serviceType: v.serviceType,
    serviceTypeId: v.serviceTypeId ? String(v.serviceTypeId) : "",
    priceRub: String(v.priceRub ?? 0),
    managerName: v.managerName ?? "",
    diskLink: v.diskLink ?? "",
  };
}

export function ClientVisitsSection({ clientId, visits, onVisitsChange }: Props) {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [editing, setEditing] = useState<CrmClientVisit | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    startsAt: "",
    endsAt: "",
    serviceType: "",
    serviceTypeId: "",
    priceRub: "0",
    managerName: "",
    diskLink: "",
  });

  useEffect(() => {
    void adminApi
      .get<ServiceType[]>("/crm/settings/service-types")
      .then(({ data }) => setServiceTypes(data))
      .catch(() => setServiceTypes([]));
  }, []);

  useEffect(() => {
    if (editing) {
      setForm(visitToForm(editing));
    }
  }, [editing]);

  const save = async () => {
    if (!editing) return;
    if (!form.serviceType.trim()) {
      toast.error("Укажите услугу");
      return;
    }
    const start = new Date(form.startsAt);
    const end = new Date(form.endsAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error("Некорректная дата");
      return;
    }
    if (end <= start) {
      toast.error("Окончание должно быть позже начала");
      return;
    }

    setSaving(true);
    try {
      await adminApi.patch(`/crm/appointments/${editing.id}`, {
        clientId,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        serviceType: form.serviceType.trim(),
        serviceTypeId: form.serviceTypeId ? Number(form.serviceTypeId) : null,
        priceRub: Number(form.priceRub) || 0,
        managerName: form.managerName.trim() || null,
        diskLink: form.diskLink.trim() || null,
      });
      toast.success("Визит обновлён");
      setEditing(null);
      await onVisitsChange();
    } catch {
      toast.error("Не удалось сохранить визит");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (v: CrmClientVisit) => {
    if (!window.confirm("Удалить визит?")) return;
    try {
      await adminApi.delete(`/crm/appointments/${v.id}`);
      toast.success("Визит удалён");
      if (editing?.id === v.id) setEditing(null);
      await onVisitsChange();
    } catch {
      toast.error("Не удалось удалить визит");
    }
  };

  return (
    <>
      <Card className="border-white/10 bg-slate-950/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base text-white">Визиты</CardTitle>
          <Button type="button" variant="outline" size="sm" className="border-white/20" asChild>
            <Link href="/admin/calendar">Календарь</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <p className="text-sm text-slate-500">Пока нет записей</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {visits.map((v) => (
                <li
                  key={v.id}
                  className="flex flex-col gap-2 rounded border border-white/10 p-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 text-slate-300">
                    <span className="text-white">{formatVisitWhen(v)}</span>
                    {" — "}
                    {v.serviceType}
                    {v.priceRub != null && v.priceRub > 0 && (
                      <span className="ml-2 text-slate-400">{v.priceRub} ₽</span>
                    )}
                    {v.managerName && (
                      <span className="ml-2 text-xs text-slate-500">· {v.managerName}</span>
                    )}
                    {v.diskLink && (
                      <a
                        className="mt-1 block truncate text-emerald-400"
                        href={v.diskLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {v.diskLink}
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-white/20"
                      onClick={() => setEditing(v)}
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Изменить
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => void remove(v)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Удалить
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg border border-white/10 bg-slate-900 text-white [&_label]:text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-white">Редактирование визита</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Начало</Label>
                <Input
                  type="datetime-local"
                  className={fieldClass}
                  value={form.startsAt}
                  onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Окончание</Label>
                <Input
                  type="datetime-local"
                  className={fieldClass}
                  value={form.endsAt}
                  onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Услуга</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select
                  value={form.serviceTypeId}
                  onValueChange={(v) => {
                    const t = serviceTypes.find((s) => String(s.id) === v);
                    setForm((f) => ({
                      ...f,
                      serviceTypeId: v,
                      serviceType: t?.name ?? f.serviceType,
                    }));
                  }}
                >
                  <SelectTrigger className="w-full border-white/20 bg-slate-800 sm:w-48">
                    <SelectValue placeholder="Список" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className={`flex-1 ${fieldClass}`}
                  value={form.serviceType}
                  onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Стоимость (руб.)</Label>
                <Input
                  type="number"
                  min={0}
                  className={fieldClass}
                  value={form.priceRub}
                  onChange={(e) => setForm((f) => ({ ...f, priceRub: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Менеджер</Label>
                <Input
                  className={fieldClass}
                  value={form.managerName}
                  onChange={(e) => setForm((f) => ({ ...f, managerName: e.target.value }))}
                  placeholder="Только для админки"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ссылка на диск / фотоотчёт</Label>
              <Input
                type="url"
                className={fieldClass}
                value={form.diskLink}
                onChange={(e) => setForm((f) => ({ ...f, diskLink: e.target.value }))}
                placeholder="https://disk.yandex.ru/..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-white/20"
              onClick={() => setEditing(null)}
            >
              Отмена
            </Button>
            <Button type="button" onClick={() => void save()} disabled={saving}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
