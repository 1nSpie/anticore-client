"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../../_lib/api";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { Checkbox } from "@/shadcn/checkbox";
import { toast } from "sonner";
import { Loader2, Users, Ban, CheckCircle, Trash2 } from "lucide-react";
import type { CabinetUserRow } from "../../_lib/cabinetTypes";
import CabinetBroadcastPanel from "./CabinetBroadcastPanel";
import CabinetUserDialog from "./CabinetUserDialog";

const isDev = process.env.NODE_ENV === "development";

export default function CabinetUsersManager() {
  const [list, setList] = useState<CabinetUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<CabinetUserRow | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get<{
        items: CabinetUserRow[];
        total: number;
      }>("/admin/users", { params: { q: q || undefined, limit: 50 } });
      setList(data.items);
      setTotal(data.total);
      setSelected(new Set());
    } catch {
      toast.error("Не удалось загрузить клиентов");
    } finally {
      setLoading(false);
    }
  }, [q]);

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
    if (selected.size === list.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(list.map((u) => u.id)));
    }
  };

  const openUser = (u: CabinetUserRow) => {
    setActive(u);
    setOpen(true);
  };

  const toggleBlock = async (u: CabinetUserRow) => {
    try {
      await adminApi.patch(`/admin/users/${u.id}/block`, {
        blocked: !u.blocked,
      });
      toast.success(u.blocked ? "Разблокирован" : "Заблокирован");
      void load();
    } catch {
      toast.error("Ошибка");
    }
  };

  const removeUser = async (u: CabinetUserRow) => {
    if (
      !window.confirm(
        `Удалить пользователя ${u.phone} (id ${u.id})? Действие необратимо.`,
      )
    ) {
      return;
    }
    try {
      await adminApi.delete(`/admin/users/${u.id}`);
      toast.success("Пользователь удалён");
      if (active?.id === u.id) {
        setOpen(false);
        setActive(null);
      }
      void load();
    } catch {
      toast.error("Не удалось удалить (доступно только в dev и на dev-сервере)");
    }
  };

  return (
    <div className="space-y-6">
      <CabinetBroadcastPanel
        searchQuery={q}
        selectedIds={[...selected]}
        onClearSelection={() => setSelected(new Set())}
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1 space-y-2">
          <Label>Поиск по телефону</Label>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Цифры номера"
            className="bg-slate-950/80 border-white/10"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Обновить"}
        </Button>
      </div>

      <p className="text-sm text-slate-400">
        <Users className="inline h-4 w-4 mr-1" />
        Всего: {total}
        {selected.size > 0 && (
          <span className="ml-2 text-emerald-400">· выбрано: {selected.size}</span>
        )}
        {isDev && (
          <span className="block mt-1 text-amber-400/90 text-xs">
            Режим разработки: доступно удаление пользователей.
          </span>
        )}
      </p>

      <div className="rounded-xl border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="p-3 w-10">
                <Checkbox
                  checked={list.length > 0 && selected.size === list.length}
                  onCheckedChange={() => toggleSelectAll()}
                  className="border-white/20 data-[state=checked]:bg-emerald-600"
                  aria-label="Выбрать всех"
                />
              </th>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Телефон</th>
              <th className="text-left p-3">Имя</th>
              <th className="text-left p-3">Авто</th>
              <th className="text-left p-3">Статус</th>
              <th className="text-right p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="p-3">
                  <Checkbox
                    checked={selected.has(u.id)}
                    onCheckedChange={() => toggleSelect(u.id)}
                    className="border-white/20 data-[state=checked]:bg-emerald-600"
                    aria-label={`Выбрать ${u.phone}`}
                  />
                </td>
                <td className="p-3">{u.id}</td>
                <td className="p-3">{u.phone}</td>
                <td className="p-3">
                  {[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="p-3 text-xs max-w-[180px]">
                  {u.customCar
                    ? u.customCar
                    : u.car
                      ? `${u.car.brand?.name ?? ""} ${u.car.model}`.trim()
                      : "—"}
                </td>
                <td className="p-3">
                  {u.blocked ? (
                    <span className="text-red-400">заблокирован</span>
                  ) : (
                    <span className="text-emerald-400">активен</span>
                  )}
                </td>
                <td className="p-3 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openUser(u)}>
                    Карточка
                  </Button>
                  <Button
                    size="sm"
                    variant={u.blocked ? "secondary" : "destructive"}
                    onClick={() => void toggleBlock(u)}
                  >
                    {u.blocked ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Разблок.
                      </>
                    ) : (
                      <>
                        <Ban className="h-3 w-3 mr-1" />
                        Блок
                      </>
                    )}
                  </Button>
                  {isDev && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-950/40"
                      onClick={() => void removeUser(u)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Удалить
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CabinetUserDialog
        user={active}
        open={open}
        onOpenChange={setOpen}
        onSaved={() => void load()}
      />
    </div>
  );
}
