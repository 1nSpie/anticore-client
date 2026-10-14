"use client";

import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Check, Loader2, Plus, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { TaskPhotos } from "@/components/tasks/TaskPhotos";
import { cn } from "src/lib/utils";
import { adminApi } from "../../_lib/api";
import type { StaffMember } from "../../_lib/staffTypes";
import {
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_STYLE,
  TASK_STATUS_LABEL,
  TASK_STATUS_STYLE,
  fmtTaskDue,
  type StaffTask,
  type TaskDisplayStatus,
  type TaskPriority,
} from "../../_lib/taskTypes";

const errText = (e: unknown, fb: string) => {
  const m = e instanceof AxiosError ? e.response?.data?.message : undefined;
  return Array.isArray(m) ? m.join("; ") : typeof m === "string" ? m : fb;
};

const FILTERS: { value: TaskDisplayStatus | ""; label: string }[] = [
  { value: "", label: "Все" },
  { value: "DONE", label: "Ждут подтверждения" },
  { value: "OVERDUE", label: "Просрочены" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "NEW", label: "Новые" },
  { value: "CONFIRMED", label: "Подтверждены" },
  { value: "CANCELLED", label: "Отменены" },
];

function CreateForm({ masters, onCreated, onCancel }: { masters: StaffMember[]; onCreated: () => void; onCancel: () => void }) {
  const [staffId, setStaffId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("NORMAL");
  const [dueAt, setDueAt] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (staffId === "") return toast.error("Выберите мастера");
    setBusy(true);
    try {
      await adminApi.post("/crm/tasks", {
        staffId,
        title,
        description: description.trim() || undefined,
        priority,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      });
      toast.success("Задача создана");
      onCreated();
    } catch (err) {
      toast.error(errText(err, "Не удалось создать задачу"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="tk-staff">Мастер</Label>
        <select id="tk-staff" value={staffId} onChange={(e) => setStaffId(e.target.value ? Number(e.target.value) : "")} required
          className="h-9 w-full rounded-md border border-white/20 bg-slate-800 px-2 text-sm">
          <option value="">Выберите…</option>
          {masters.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tk-due">Срок (необязательно)</Label>
        <Input id="tk-due" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="tk-title">Что сделать</Label>
        <Input id="tk-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="tk-desc">Подробности</Label>
        <textarea id="tk-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={3}
          className="w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2">
        <Label>Приоритет</Label>
        <div className="flex gap-2">
          {(Object.keys(TASK_PRIORITY_LABEL) as TaskPriority[]).map((p) => (
            <Button key={p} type="button" size="sm" variant={priority === p ? "default" : "outline"} onClick={() => setPriority(p)}>
              {TASK_PRIORITY_LABEL[p]}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Отмена</Button>
      </div>
    </form>
  );
}

function TaskRow({ task, onChanged }: { task: StaffTask; onChanged: () => void }) {
  const act = async (path: string, ok: string, body?: object) => {
    try {
      await adminApi.post(`/crm/tasks/${task.id}/${path}`, body ?? {});
      toast.success(ok);
      onChanged();
    } catch (e) {
      toast.error(errText(e, "Не удалось выполнить действие"));
    }
  };
  const returnToWork = () => {
    const comment = window.prompt("Что не так? Комментарий увидит мастер (можно оставить пустым):", "");
    if (comment === null) return;
    void act("return", "Возвращена в работу", { comment: comment.trim() || undefined });
  };
  const s = task.displayStatus;

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-4", s === "CANCELLED" && "opacity-60")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-medium">{task.title}</p>
          <p className="text-sm text-slate-400">
            {task.staff.fullName}
            {task.dueAt && <> · срок {fmtTaskDue(task.dueAt)}</>}
            <span className={cn("ml-2", TASK_PRIORITY_STYLE[task.priority])}>{TASK_PRIORITY_LABEL[task.priority]} приоритет</span>
          </p>
          {task.description && <p className="text-sm text-slate-300">{task.description}</p>}
          {task.masterComment && <p className="text-sm text-violet-200">Мастер: {task.masterComment}</p>}
          {task.adminComment && <p className="text-xs text-slate-500">Ваш комментарий при возврате: {task.adminComment}</p>}
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-medium", TASK_STATUS_STYLE[s])}>{TASK_STATUS_LABEL[s]}</span>
      </div>
      <div className="mt-3 max-w-md">
        <TaskPhotos
          photos={task.photos}
          canAdd={s !== "CANCELLED"}
          canDelete={() => true}
          upload={(file) => {
            const form = new FormData();
            form.append("file", file);
            return adminApi.post(`/crm/tasks/${task.id}/photos`, form, { timeout: 60_000 });
          }}
          remove={(photoId) => adminApi.delete(`/crm/tasks/${task.id}/photos/${photoId}`)}
          onChanged={onChanged}
        />
      </div>
      {(s === "DONE" || s === "NEW" || s === "IN_PROGRESS" || s === "OVERDUE") && (
        <div className="mt-3 flex flex-wrap gap-2">
          {s === "DONE" && (
            <>
              <Button size="sm" onClick={() => act("confirm", "Выполнение подтверждено")}><Check className="h-4 w-4" />Подтвердить</Button>
              <Button size="sm" variant="outline" onClick={returnToWork}><RotateCcw className="h-4 w-4" />Вернуть в работу</Button>
            </>
          )}
          <Button size="sm" variant="outline" className="text-red-400"
            onClick={() => window.confirm("Отменить задачу?") && void act("cancel", "Задача отменена")}>
            <X className="h-4 w-4" />Отменить
          </Button>
        </div>
      )}
    </div>
  );
}

export default function TasksManager() {
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [masters, setMasters] = useState<StaffMember[]>([]);
  const [filter, setFilter] = useState<TaskDisplayStatus | "">("");
  const [staffId, setStaffId] = useState<number | "">("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get<StaffTask[]>("/crm/tasks", {
        params: { status: filter || undefined, staffId: staffId || undefined },
      });
      setTasks(data);
    } catch {
      toast.error("Не удалось загрузить задачи");
    } finally {
      setLoading(false);
    }
  }, [filter, staffId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    adminApi.get<StaffMember[]>("/crm/staff")
      .then((r) => setMasters(r.data.filter((s) => s.role === "MASTER" && !s.blockedAt)))
      .catch(() => toast.error("Не удалось загрузить мастеров"));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button key={f.value || "all"} size="sm" variant={filter === f.value ? "default" : "outline"} onClick={() => setFilter(f.value)}>
              {f.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <select aria-label="Мастер" value={staffId} onChange={(e) => setStaffId(e.target.value ? Number(e.target.value) : "")}
            className="h-9 rounded-md border border-white/20 bg-slate-800 px-2 text-sm">
            <option value="">Все мастера</option>
            {masters.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
          </select>
          {!creating && <Button size="sm" onClick={() => setCreating(true)}><Plus className="h-4 w-4" />Новая задача</Button>}
        </div>
      </div>

      {creating && <CreateForm masters={masters} onCancel={() => setCreating(false)} onCreated={() => { setCreating(false); void load(); }} />}

      {loading ? (
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-500" />
      ) : tasks.length ? (
        <div className="space-y-3">{tasks.map((t) => <TaskRow key={t.id} task={t} onChanged={load} />)}</div>
      ) : (
        <p className="py-10 text-center text-sm text-slate-500">Задач нет</p>
      )}
    </div>
  );
}
