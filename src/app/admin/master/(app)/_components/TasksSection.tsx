"use client";

import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { TaskPhotos } from "@/components/tasks/TaskPhotos";
import {
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_STYLE,
  TASK_STATUS_LABEL,
  TASK_STATUS_STYLE,
  fmtTaskDue,
  type StaffTask,
} from "@/app/admin/_lib/taskTypes";
import { useStaffNotificationEvents } from "../../_lib/StaffRealtime";
import { staffApi } from "../../_lib/staffSession";

function TaskCard({ task, onChanged }: { task: StaffTask; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [comment, setComment] = useState("");
  const s = task.displayStatus;
  const open = s === "NEW" || s === "IN_PROGRESS" || s === "OVERDUE";

  const call = async (path: string, body?: object) => {
    setBusy(true);
    try {
      await staffApi.post(`/staff/tasks/${task.id}/${path}`, body ?? {});
      setFinishing(false);
      onChanged();
    } catch (e) {
      const m = e instanceof AxiosError ? e.response?.data?.message : undefined;
      toast.error(typeof m === "string" ? m : "Не удалось выполнить действие");
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium leading-snug">{task.title}</p>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${TASK_STATUS_STYLE[s]}`}>{TASK_STATUS_LABEL[s]}</span>
      </div>
      {task.description && <p className="mt-2 text-sm text-slate-300">{task.description}</p>}
      <p className="mt-2 text-xs text-slate-400">
        {task.dueAt ? `Срок: ${fmtTaskDue(task.dueAt)}` : "Без срока"} ·{" "}
        <span className={TASK_PRIORITY_STYLE[task.priority]}>{TASK_PRIORITY_LABEL[task.priority]} приоритет</span>
      </p>
      <div className="mt-3">
        <TaskPhotos
          photos={task.photos}
          touch
          // мастер добавляет и снимает свои фото, пока админ не подтвердил выполнение
          canAdd={s !== "CONFIRMED"}
          canDelete={(p) => p.by === "MASTER" && s !== "CONFIRMED"}
          upload={(file) => {
            const form = new FormData();
            form.append("file", file);
            return staffApi.post(`/staff/tasks/${task.id}/photos`, form, { timeout: 60_000 });
          }}
          remove={(photoId) => staffApi.delete(`/staff/tasks/${task.id}/photos/${photoId}`)}
          onChanged={onChanged}
        />
      </div>
      {task.adminComment && open && (
        <p className="mt-3 rounded-lg bg-amber-400/10 p-2 text-sm text-amber-200">Вернули в работу: {task.adminComment}</p>
      )}

      {open && !finishing && (
        <div className="mt-3 flex gap-2">
          {task.displayStatus === "NEW" && (
            <Button variant="outline" className="h-11 flex-1" disabled={busy} onClick={() => call("start")}>Взять в работу</Button>
          )}
          <Button className="h-11 flex-1" disabled={busy} onClick={() => setFinishing(true)}>Выполнена</Button>
        </div>
      )}
      {open && finishing && (
        <div className="mt-3 space-y-2">
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} rows={3} placeholder="Комментарий (необязательно)"
            className="w-full rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-base" />
          <div className="flex gap-2">
            <Button className="h-11 flex-1" disabled={busy} onClick={() => call("complete", { comment: comment.trim() || undefined })}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Отправить"}
            </Button>
            <Button variant="ghost" className="h-11" onClick={() => setFinishing(false)}>Отмена</Button>
          </div>
        </div>
      )}
      {s === "DONE" && <p className="mt-3 text-sm text-slate-400">Администратор проверит и подтвердит выполнение</p>}
    </li>
  );
}

export function TasksSection() {
  const [tasks, setTasks] = useState<StaffTask[] | null>(null);

  const load = useCallback(async () => {
    try {
      setTasks((await staffApi.get<StaffTask[]>("/staff/tasks")).data);
    } catch {
      toast.error("Не удалось загрузить задачи");
      setTasks((t) => t ?? []);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  // Новая задача или возврат в работу пришли по WebSocket — обновляем список без перезагрузки
  useStaffNotificationEvents(
    useCallback((n) => {
      if (n.type.startsWith("TASK_")) void load();
    }, [load]),
  );

  if (!tasks?.length) return null;
  const active = tasks.filter((t) => ["NEW", "IN_PROGRESS", "OVERDUE"].includes(t.displayStatus)).length;

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">
        Задачи {active > 0 && <span className="ml-1 rounded-full bg-emerald-400/15 px-2 py-0.5 text-sm text-emerald-300">{active}</span>}
      </h2>
      <ul className="space-y-3">{tasks.map((t) => <TaskCard key={t.id} task={t} onChanged={load} />)}</ul>
    </section>
  );
}
