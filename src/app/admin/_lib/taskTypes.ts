export type TaskPriority = "LOW" | "NORMAL" | "HIGH";
export type TaskDisplayStatus = "NEW" | "IN_PROGRESS" | "DONE" | "CONFIRMED" | "OVERDUE" | "CANCELLED";

import type { TaskPhotoItem } from "@/components/tasks/TaskPhotos";

export interface StaffTask {
  id: number;
  title: string;
  description: string | null;
  priority: TaskPriority;
  displayStatus: TaskDisplayStatus;
  dueAt: string | null;
  masterComment: string | null;
  adminComment: string | null;
  doneAt: string | null;
  confirmedAt: string | null;
  createdAt: string;
  staff: { id: number; fullName: string };
  photos: TaskPhotoItem[];
}

export const TASK_STATUS_LABEL: Record<TaskDisplayStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  DONE: "Выполнена, ждёт подтверждения",
  CONFIRMED: "Выполнена и подтверждена",
  OVERDUE: "Просрочена",
  CANCELLED: "Отменена",
};

export const TASK_STATUS_STYLE: Record<TaskDisplayStatus, string> = {
  NEW: "bg-sky-400/15 text-sky-300",
  IN_PROGRESS: "bg-amber-400/15 text-amber-300",
  DONE: "bg-violet-400/15 text-violet-300",
  CONFIRMED: "bg-emerald-400/15 text-emerald-300",
  OVERDUE: "bg-red-400/15 text-red-300",
  CANCELLED: "bg-slate-400/15 text-slate-400",
};

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = { LOW: "Низкий", NORMAL: "Обычный", HIGH: "Высокий" };

export const TASK_PRIORITY_STYLE: Record<TaskPriority, string> = {
  LOW: "text-slate-400",
  NORMAL: "text-slate-300",
  HIGH: "text-red-300",
};

export const fmtTaskDue = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("ru-RU", { timeZone: "Europe/Moscow", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : null;
