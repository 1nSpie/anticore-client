export type CabinetUserDetail = {
  id: number;
  phone: string;
  firstName?: string | null;
  lastName?: string | null;
  patronymic?: string | null;
  birthDate?: string | null;
  customCar?: string | null;
  blocked: boolean;
  phoneVerified: boolean;
  createdAt: string;
  car?: {
    id: number;
    model: string;
    brand: { id: number; name: string } | null;
  } | null;
  notificationSettings?: {
    smsEnabled: boolean;
    notifyReminder: boolean;
  } | null;
};

export type CabinetUserRow = {
  id: number;
  phone: string;
  firstName?: string | null;
  lastName?: string | null;
  customCar?: string | null;
  blocked: boolean;
  car?: {
    id: number;
    model: string;
    brand: { name: string } | null;
  } | null;
};

export type CabinetVisit = {
  id: number;
  visitDate: string;
  serviceType: string;
  diskLink?: string | null;
};

export type BroadcastResult = {
  total: number;
  sent: number;
  failed: number;
  skippedOptOut: number;
  errors: string[];
};
