export type MasterVisitStatus = "PLANNED" | "IN_PROGRESS" | "DONE";

/** Запись глазами мастера: без данных клиента (ТЗ 4.3). */
export interface MasterVisit {
  id: number;
  startsAt: string;
  endsAt: string;
  location: "ZHUKOVSKY" | "RAMENSKOYE" | "KOLOMNA";
  serviceType: string;
  priceRub: number;
  status: MasterVisitStatus;
  vehicle: { label: string | null; vin: string | null } | null;
  comment: string | null;
}

export const VISIT_STATUS_LABEL: Record<MasterVisitStatus, string> = {
  PLANNED: "Запланировано",
  IN_PROGRESS: "В работе",
  DONE: "Выполнено",
};

export const VISIT_STATUS_STYLE: Record<MasterVisitStatus, string> = {
  PLANNED: "bg-sky-400/15 text-sky-300",
  IN_PROGRESS: "bg-amber-400/15 text-amber-300",
  DONE: "bg-emerald-400/15 text-emerald-300",
};
