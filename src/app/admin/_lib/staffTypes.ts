import type { CrmLocationCode } from "./crmLocations";

export type StaffRole = "ADMIN" | "MASTER";

export interface StaffMember {
  id: number;
  login: string;
  fullName: string;
  role: StaffRole;
  locations: CrmLocationCode[];
  blockedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface StaffAuditEntry {
  id: number;
  staffId: number | null;
  actor: string;
  action: string;
  ip: string | null;
  userAgent: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = { ADMIN: "Администратор", MASTER: "Мастер" };

export const STAFF_AUDIT_LABELS: Record<string, string> = {
  LOGIN: "Вход",
  LOGIN_FAILED: "Неудачный вход",
  LOGOUT: "Выход",
  STAFF_CREATED: "Создана учётная запись",
  STAFF_UPDATED: "Изменены данные",
  STAFF_BLOCKED: "Блокировка",
  STAFF_UNBLOCKED: "Разблокировка",
  PASSWORD_RESET: "Сброс пароля",
  ASSIGNMENT_CHANGED: "Назначение мастеров",
  GEO_CONSENT: "Согласие на геолокацию",
  CHECKIN: "Чекин",
  CHECKIN_CONFIRMED: "Чекин подтверждён",
  CHECKIN_REJECTED: "Чекин отклонён",
  TASK_CREATED: "Задача создана",
  TASK_UPDATED: "Задача изменена",
  TASK_DONE: "Задача выполнена",
  TASK_CONFIRMED: "Выполнение подтверждено",
  TASK_RETURNED: "Задача возвращена в работу",
  TASK_CANCELLED: "Задача отменена",
  TASK_PHOTO_ADDED: "Фото добавлено к задаче",
  TASK_PHOTO_DELETED: "Фото удалено из задачи",
  REGULATION_CHANGED: "Правка регламента",
  REGULATION_PUBLISHED: "Регламент опубликован",
  REGULATION_ACKED: "Ознакомление с регламентом",
};
