"use client";

import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Ban, CheckCircle, KeyRound, Loader2, Plus, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { Checkbox } from "@/shadcn/checkbox";
import { cn } from "src/lib/utils";
import { adminApi } from "../../_lib/api";
import { CRM_LOCATIONS, CRM_LOCATION_LABELS, type CrmLocationCode } from "../../_lib/crmLocations";
import {
  STAFF_AUDIT_LABELS,
  STAFF_ROLE_LABELS,
  type StaffAuditEntry,
  type StaffMember,
  type StaffRole,
} from "../../_lib/staffTypes";

const errorText = (e: unknown, fallback: string) => {
  const m = e instanceof AxiosError ? e.response?.data?.message : undefined;
  return Array.isArray(m) ? m.join("; ") : typeof m === "string" ? m : fallback;
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" }) : "—";

function LocationPicker({ value, onChange }: { value: CrmLocationCode[]; onChange: (v: CrmLocationCode[]) => void }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {CRM_LOCATIONS.map((code) => (
        <label key={code} className="flex min-h-9 items-center gap-2 text-sm">
          <Checkbox
            checked={value.includes(code)}
            onCheckedChange={(on) => onChange(on ? [...value, code] : value.filter((c) => c !== code))}
          />
          {CRM_LOCATION_LABELS[code]}
        </label>
      ))}
    </div>
  );
}

function CreateForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [login, setLogin] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("MASTER");
  const [locations, setLocations] = useState<CrmLocationCode[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminApi.post("/crm/staff", { login, fullName, password, role, locations });
      toast.success("Сотрудник создан");
      onCreated();
    } catch (err) {
      toast.error(errorText(err, "Не удалось создать сотрудника"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="st-name">ФИО</Label>
        <Input id="st-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="st-login">Логин</Label>
        <Input id="st-login" value={login} onChange={(e) => setLogin(e.target.value)} autoCapitalize="none"
          placeholder="латиница, цифры, . _ -" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="st-pass">Пароль (от 8 символов)</Label>
        <Input id="st-pass" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
      </div>
      <div className="space-y-2">
        <Label>Роль</Label>
        <div className="flex gap-2">
          {(Object.keys(STAFF_ROLE_LABELS) as StaffRole[]).map((r) => (
            <Button key={r} type="button" size="sm" variant={role === r ? "default" : "outline"} onClick={() => setRole(r)}>
              {STAFF_ROLE_LABELS[r]}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label>Филиалы</Label>
        <LocationPicker value={locations} onChange={setLocations} />
      </div>
      <div className="flex gap-2 md:col-span-2">
        <Button type="submit" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Отмена</Button>
      </div>
    </form>
  );
}

function StaffRow({ member, onChanged }: { member: StaffMember; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [locations, setLocations] = useState<CrmLocationCode[]>(member.locations);
  const blocked = !!member.blockedAt;

  const act = async (fn: () => Promise<void>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      onChanged();
    } catch (err) {
      toast.error(errorText(err, "Не удалось выполнить действие"));
    }
  };

  const resetPassword = () => {
    if (!confirm(`Сбросить пароль сотрудника «${member.fullName}»? Старый пароль перестанет работать.`)) return;
    void act(async () => {
      const { data } = await adminApi.post<{ password: string }>(`/crm/staff/${member.id}/reset-password`, {});
      // Пароль показывается один раз — в БД остаётся только хэш
      window.prompt(`Новый пароль для ${member.login} (скопируйте, повторно он не покажется):`, data.password);
    }, "Пароль сброшен");
  };

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-4", blocked && "opacity-70")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{member.fullName}</p>
          <p className="text-sm text-slate-400">
            {member.login} · {STAFF_ROLE_LABELS[member.role]}
            {blocked && <span className="ml-2 text-red-400">Заблокирован</span>}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {member.locations.length ? member.locations.map((l) => CRM_LOCATION_LABELS[l]).join(", ") : "Филиалы не назначены"}
            {" · "}последний вход: {fmt(member.lastLoginAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing((v) => !v)}>Филиалы</Button>
          <Button size="sm" variant="outline" onClick={resetPassword}><KeyRound className="h-4 w-4" />Пароль</Button>
          {blocked ? (
            <Button size="sm" variant="outline"
              onClick={() => act(() => adminApi.post(`/crm/staff/${member.id}/unblock`).then(() => undefined), "Разблокирован")}>
              <CheckCircle className="h-4 w-4" />Разблокировать
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="text-red-400"
              onClick={() => act(() => adminApi.post(`/crm/staff/${member.id}/block`).then(() => undefined), "Заблокирован")}>
              <Ban className="h-4 w-4" />Заблокировать
            </Button>
          )}
        </div>
      </div>
      {editing && (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <LocationPicker value={locations} onChange={setLocations} />
          <Button size="sm"
            onClick={() => act(async () => {
              await adminApi.patch(`/crm/staff/${member.id}`, { locations });
              setEditing(false);
            }, "Сохранено")}>
            Сохранить
          </Button>
        </div>
      )}
    </div>
  );
}

function AuditTable() {
  const [rows, setRows] = useState<StaffAuditEntry[]>([]);
  const [onlyFailed, setOnlyFailed] = useState(false);

  useEffect(() => {
    adminApi
      .get<StaffAuditEntry[]>("/crm/staff/audit-log", { params: { limit: 100, action: onlyFailed ? "LOGIN_FAILED" : undefined } })
      .then((r) => setRows(r.data))
      .catch(() => toast.error("Не удалось загрузить журнал"));
  }, [onlyFailed]);

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={onlyFailed} onCheckedChange={(v) => setOnlyFailed(!!v)} />
        Только неудачные входы
      </label>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="p-3">Время</th><th className="p-3">Кто</th><th className="p-3">Действие</th><th className="p-3">IP</th><th className="p-3">Детали</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="p-3 whitespace-nowrap text-slate-400">{fmt(r.createdAt)}</td>
                <td className="p-3">{r.actor}</td>
                <td className={cn("p-3", r.action === "LOGIN_FAILED" && "text-red-400")}>{STAFF_AUDIT_LABELS[r.action] ?? r.action}</td>
                <td className="p-3 text-slate-400">{r.ip ?? "—"}</td>
                <td className="p-3 text-xs text-slate-500">{r.meta ? JSON.stringify(r.meta) : ""}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="p-6 text-center text-slate-500">Записей нет</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function StaffManager() {
  const [tab, setTab] = useState<"list" | "audit">("list");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStaff((await adminApi.get<StaffMember[]>("/crm/staff")).data);
    } catch {
      toast.error("Не удалось загрузить сотрудников");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button variant={tab === "list" ? "default" : "outline"} size="sm" onClick={() => setTab("list")}>
            <UserCog className="h-4 w-4" />Сотрудники
          </Button>
          <Button variant={tab === "audit" ? "default" : "outline"} size="sm" onClick={() => setTab("audit")}>Журнал входов</Button>
        </div>
        {tab === "list" && !creating && (
          <Button size="sm" onClick={() => setCreating(true)}><Plus className="h-4 w-4" />Добавить</Button>
        )}
      </div>

      {tab === "audit" ? (
        <AuditTable />
      ) : (
        <>
          {creating && <CreateForm onCancel={() => setCreating(false)} onCreated={() => { setCreating(false); void load(); }} />}
          {loading ? (
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" />
          ) : staff.length ? (
            <div className="space-y-3">{staff.map((m) => <StaffRow key={m.id} member={m} onChanged={load} />)}</div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">Сотрудников пока нет. Добавьте первого мастера.</p>
          )}
        </>
      )}
    </div>
  );
}
