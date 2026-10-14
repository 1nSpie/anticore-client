export interface StaffNotification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationList {
  items: StaffNotification[];
  unread: number;
}

/** Событие, которое провайдер рассылает по окну: страницы подписываются и перезагружают свои данные. */
export const STAFF_NOTIFICATION_EVENT = "staff:notification";

export const fmtNotificationTime = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", { timeZone: "Europe/Moscow", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Внутренний путь кабинета мастера или null — защита от внешних/подставных ссылок. */
export const safeStaffLink = (link: string | null): string | null => (link && /^\/staff(\/|$)/.test(link) ? link : null);
