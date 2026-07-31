export type CrmClient = {
  id: number;
  phone: string;
  fio: string;
  firstName: string | null;
  lastName: string | null;
  patronymic: string | null;
  birthDate: string | null;
  carId: number | null;
  carBrand: string | null;
  carModelName: string | null;
  carModel: string;
  customCar: string | null;
  vin: string | null;
  adminComment: string | null;
  blocked: boolean;
  phoneVerified: boolean;
  createdAt: string;
  visitCount: number;
  notificationSettings?: {
    smsEnabled: boolean;
    notifyReminder: boolean;
  } | null;
  visits?: CrmClientVisit[];
};

export type CrmClientVisit = {
  id: number;
  visitDate: string;
  startsAt: string | null;
  endsAt: string | null;
  serviceType: string;
  serviceTypeId: number | null;
  diskLink: string | null;
  managerName: string | null;
  priceRub: number | null;
};

export type CrmClientListResponse = {
  items: CrmClient[];
  total: number;
  page: number;
  limit: number;
};

export type ClientListFilter =
  | "all"
  | "lk"
  | "no_lk"
  | "blocked"
  | "has_visits";

export type CrmAppointment = {
  id: number;
  clientId: number;
  startsAt: string;
  endsAt: string;
  serviceType: string;
  serviceTypeId: number | null;
  priceRub: number;
  managerName: string | null;
  location: "ZHUKOVSKY" | "RAMENSKOYE" | "KOLOMNA";
  title: string;
  /** Когда отправлено SMS с запросом отзыва (один раз на запись). */
  reviewSmsSentAt: string | null;
  client: {
    id: number;
    phone: string;
    firstName: string | null;
    lastName: string | null;
    patronymic: string | null;
    customCar: string | null;
    vin: string | null;
  };
};

export type ServiceType = {
  id: number;
  name: string;
  sortOrder: number;
  active: boolean;
};

export type SiteLeadStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "NEEDS_CLARIFICATION"
  | "SCHEDULED"
  | "REJECTED"
  | "COMPLETED";
export type SiteLeadKind = "CALLBACK" | "PRICE_REQUEST";

export type SiteLead = {
  id: number;
  kind: SiteLeadKind;
  name: string;
  phone: string;
  message: string | null;
  carDescription: string | null;
  communicationMethod: string | null;
  pageUrl: string | null;
  status: SiteLeadStatus;
  adminNote: string | null;
  diskLink: string | null;
  followUpAt: string | null;
  location: "ZHUKOVSKY" | "RAMENSKOYE" | "KOLOMNA" | null;
  visitId: number | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
  visit?: {
    id: number;
    startsAt: string | null;
    endsAt: string | null;
    serviceType: string;
  } | null;
};
