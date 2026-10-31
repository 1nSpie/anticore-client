export type CheckinStatus = "PENDING" | "CONFIRMED" | "REJECTED";

export interface MyCheckin {
  id: number;
  location: "ZHUKOVSKY" | "RAMENSKOYE" | "KOLOMNA";
  distanceM: number;
  outOfRadius: boolean;
  status: CheckinStatus;
  createdAt: string;
}

export interface CheckinToday {
  geoConsent: boolean;
  checkin: MyCheckin | null;
}

export const CHECKIN_STATUS_LABEL: Record<CheckinStatus, string> = {
  PENDING: "Ждёт подтверждения администратором",
  CONFIRMED: "Подтверждён — вы на смене",
  REJECTED: "Отклонён администратором",
};
