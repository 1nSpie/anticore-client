"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Ban, CheckCircle, Loader2, Trash2, Users } from "lucide-react";
import { formatPhoneRuDisplay } from "@/lib/phoneRu";
import { adminApi } from "../../_lib/api";
import type { ClientListFilter, CrmClient, CrmClientListResponse } from "../../_lib/crmTypes";
import CabinetBroadcastPanel from "../cabinet/CabinetBroadcastPanel";
import { Input } from "@/shadcn/input";
import { Button } from "@/shadcn/button";
import { Label } from "@/shadcn/label";
import { Checkbox } from "@/shadcn/checkbox";
import { toast } from "sonner";
import { cn } from "src/lib/utils";

const FILTERS: { value: ClientListFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "lk", label: "С ЛК" },
  { value: "no_lk", label: "Без ЛК" },
  { value: "has_visits", label: "С визитами" },
  { value: "blocked", label: "Заблокированные" },
];

const isDev = process.env.NODE_ENV === "development";

function statusLabel(c: CrmClient): { text: string; className: string } {
  if (c.blocked) return { text: "Заблокирован", className: "text-red-400" };
  if (c.phoneVerified) return { text: "ЛК активен", className: "text-emerald-400" };
  return { text: "Без ЛК", className: "text-slate-400" };
}

export default function ClientsManager() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<ClientListFilter>("all");
  const [clients, setClients] = useState<CrmClient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get<CrmClientListResponse>("/crm/clients", {
        params: {
          q: q.trim() || undefined,
          filter: filter === "all" ? undefined : filter,
          limit: 100,
        },
      });
      setClients(data.items);
      setTotal(data.total);
      setSelected(new Set());
    } catch {
      toast.error("Не удалось загрузить клиентов");
    } finally {
      setLoading(false);
    }
  }, [filter, q]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === clients.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(clients.map((c) => c.id)));
    }
  };

  const toggleBlock = async (c: CrmClient) => {
    try {
      await adminApi.patch(`/crm/clients/${c.id}`, { blocked: !c.blocked });
      toast.success(c.blocked ? "Разблокирован" : "Заблокирован");
      void load();
    } catch {
      toast.error("Ошибка");
    }
  };

  const removeClient = async (c: CrmClient) => {
    if (
      !window.confirm(
        `Удалить клиента ${formatPhoneRuDisplay(c.phone)} (id ${c.id})? Действие необратимо.`,
      )
    ) {
      return;
    }
    try {
      await adminApi.delete(`/admin/users/${c.id}`);
      toast.success("Клиент удалён");
      void load();
    } catch {
      toast.error("Не удалось удалить (доступно только в dev)");
    }
  };

  return (
    <div className="space-y-6">
      <CabinetBroadcastPanel
        searchQuery={q}
        selectedIds={[...selected]}
        onClearSelection={() => setSelected(new Set())}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                filter === f.value
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button asChild>
          <Link href="/admin/clients/new">Новый клиент</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label className="text-slate-300">Поиск по ФИО или телефону</Label>
          <Input
            placeholder="Имя, фамилия или цифры номера"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void load()}
            className="border-white/20 bg-slate-800 text-white"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-white/20"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Найти"}
        </Button>
      </div>

      <p className="text-sm text-slate-400">
        <Users className="mr-1 inline h-4 w-4" />
        Показано: {clients.length} из {total}
        {selected.size > 0 && (
          <span className="ml-2 text-emerald-400">· выбрано: {selected.size}</span>
        )}
      </p>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[900px] text-sm text-slate-200">
          <thead className="bg-slate-900/80 text-left">
            <tr>
              <th className="w-10 px-3 py-3">
                <Checkbox
                  checked={clients.length > 0 && selected.size === clients.length}
                  onCheckedChange={() => toggleSelectAll()}
                  className="border-white/20 data-[state=checked]:bg-emerald-600"
                  aria-label="Выбрать всех"
                />
              </th>
              <th className="px-4 py-3">ФИО</th>
              <th className="px-4 py-3">Телефон</th>
              <th className="px-4 py-3">Авто</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Визиты</th>
              <th className="px-4 py-3">VIN</th>
              <th className="px-4 py-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  {loading ? "Загрузка…" : "Клиенты не найдены"}
                </td>
              </tr>
            ) : (
              clients.map((c) => {
                const status = statusLabel(c);
                return (
                  <tr key={c.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-3 py-3">
                      <Checkbox
                        checked={selected.has(c.id)}
                        onCheckedChange={() => toggleSelect(c.id)}
                        className="border-white/20 data-[state=checked]:bg-emerald-600"
                        aria-label={`Выбрать ${c.phone}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="text-emerald-300 hover:underline"
                      >
                        {c.fio}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatPhoneRuDisplay(c.phone)}</td>
                    <td className="max-w-[180px] truncate px-4 py-3">{c.carModel || "—"}</td>
                    <td className={`px-4 py-3 ${status.className}`}>{status.text}</td>
                    <td className="px-4 py-3">{c.visitCount || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{c.vin || "—"}</td>
                    <td className="space-x-2 px-4 py-3 text-right">
                      <Button size="sm" variant="outline" className="border-white/20" asChild>
                        <Link href={`/admin/clients/${c.id}`}>Карточка</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant={c.blocked ? "secondary" : "destructive"}
                        onClick={() => void toggleBlock(c)}
                      >
                        {c.blocked ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Разблок.
                          </>
                        ) : (
                          <>
                            <Ban className="mr-1 h-3 w-3" />
                            Блок
                          </>
                        )}
                      </Button>
                      {isDev && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-950/40"
                          onClick={() => void removeClient(c)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Удалить
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
