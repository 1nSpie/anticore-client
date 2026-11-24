import { CalendarDays, Car, CircleDollarSign, Inbox, MessageSquare, Users, FileText, Images, UserCog, MapPinCheck, ListChecks, BookOpenText, Banknote, Wallet, Boxes } from "lucide-react";

export const adminSections = [
  { label: "Работа с клиентами", items: [
    { href: "/admin/calendar", label: "Календарь", description: "Записи, загрузка сервиса и планы на день.", icon: CalendarDays },
    { href: "/admin/leads", label: "Заявки", description: "Новые обращения и следующие шаги по каждому клиенту.", icon: Inbox },
    { href: "/admin/clients", label: "Клиенты", description: "Контакты, автомобили и история обслуживания.", icon: Users },
    { href: "/admin/sms", label: "Сообщения", description: "SMS-рассылки и связь с клиентами.", icon: MessageSquare },
  ] },
  { label: "Команда", items: [
    { href: "/admin/staff", label: "Сотрудники", description: "Учётные записи мастеров, филиалы, блокировка и журнал входов.", icon: UserCog },
    { href: "/admin/checkins", label: "Чекины", description: "Кто отметился на смену, подтверждение и пометки «вне радиуса».", icon: MapPinCheck },
    { href: "/admin/tasks", label: "Задачи", description: "Задачи мастерам: срок, приоритет, подтверждение выполнения.", icon: ListChecks },
    { href: "/admin/regulation", label: "Регламент", description: "Разделы, статьи и PDF для мастеров; публикация с обязательным ознакомлением.", icon: BookOpenText },
  ] },
  { label: "Деньги и склад", items: [
    { href: "/admin/payroll", label: "Зарплата", description: "Ставки мастеров и приёмщиков, ведомость, доп. выплаты.", icon: Banknote },
    { href: "/admin/cash", label: "Касса", description: "Приход и расход наличных по филиалам.", icon: Wallet },
    { href: "/admin/stock", label: "Склад", description: "Материалы и расходники: остатки, приход и расход.", icon: Boxes },
  ] },
  { label: "Контент сайта", items: [
    { href: "/admin/blog", label: "Блог", description: "Статьи, полезные советы и новости для посетителей сайта.", icon: FileText },
    { href: "/admin/works", label: "Примеры работ", description: "Покажите результат: фотографии до и после, описание и галерея.", icon: Images },
  ] },
  { label: "Справочники", items: [
    { href: "/admin/prices", label: "Цены и услуги", description: "Стоимость услуг и актуальные предложения сервиса.", icon: CircleDollarSign },
    { href: "/admin/auto", label: "Автомобили", description: "Марки, модели и классы автомобилей для расчёта стоимости.", icon: Car },
  ] },
];

export function adminSection(path: string) {
  return adminSections.flatMap(section => section.items.map(item => ({ ...item, group: section.label })))
    .find(item => path === item.href || path.startsWith(`${item.href}/`));
}
