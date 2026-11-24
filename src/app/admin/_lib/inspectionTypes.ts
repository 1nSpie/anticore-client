/** Приёмка автомобиля (ТЗ «Документооборот», §10): типы ответа API и подписи. Значения зеркалят сервер. */

export type DamageType = "SCRATCH" | "DENT" | "CORROSION" | "CHIP" | "OTHER";

export const DAMAGE_TYPES: DamageType[] = ["SCRATCH", "DENT", "CORROSION", "CHIP", "OTHER"];
/** Обозначения на схеме: X / O / K / S / D. */
export const DAMAGE_SYMBOL: Record<DamageType, string> = {
  SCRATCH: "X",
  DENT: "O",
  CORROSION: "K",
  CHIP: "S",
  OTHER: "D",
};
export const DAMAGE_LABEL: Record<DamageType, string> = {
  SCRATCH: "царапина",
  DENT: "вмятина",
  CORROSION: "коррозия",
  CHIP: "скол",
  OTHER: "иное повреждение",
};

export type SystemStatus = "OK" | "FAULTY" | "NOT_CHECKED";
export const SYSTEM_KEYS = [
  "lights",
  "turnSignals",
  "brakeLights",
  "wipers",
  "horn",
  "climate",
  "fan",
  "dashboard",
] as const;
export type SystemKey = (typeof SYSTEM_KEYS)[number];

export const SYSTEM_LABEL: Record<SystemKey, string> = {
  lights: "Световые приборы",
  turnSignals: "Поворотники",
  brakeLights: "Стоп-сигналы",
  wipers: "Стеклоочистители",
  horn: "Звуковой сигнал",
  climate: "Климатическая система",
  fan: "Скорости вентилятора печки",
  dashboard: "Приборная панель (ошибки)",
};

/** Слова для статуса с учётом рода: «исправны / неисправны», «исправен / неисправен», «ошибок нет / ошибки имеются». */
export const SYSTEM_WORDS: Record<SystemKey, { OK: string; FAULTY: string }> = {
  lights: { OK: "исправны", FAULTY: "неисправны" },
  turnSignals: { OK: "исправны", FAULTY: "неисправны" },
  brakeLights: { OK: "исправны", FAULTY: "неисправны" },
  wipers: { OK: "исправны", FAULTY: "неисправны" },
  horn: { OK: "исправен", FAULTY: "неисправен" },
  climate: { OK: "исправна", FAULTY: "неисправна" },
  fan: { OK: "исправны", FAULTY: "неисправны" },
  dashboard: { OK: "ошибок нет", FAULTY: "ошибки имеются" },
};
export const NOT_CHECKED_WORD = "не проверялось";

export const INTERIOR_KEYS = ["dirt", "damage", "upholstery", "smell"] as const;
export type InteriorKey = (typeof INTERIOR_KEYS)[number];
export type InteriorFlag = "NONE" | "PRESENT";
export const INTERIOR_LABEL: Record<InteriorKey, string> = {
  dirt: "Загрязнения салона",
  damage: "Повреждения элементов интерьера",
  upholstery: "Повреждения обивки",
  smell: "Посторонние запахи",
};

/** Подсказки для поля «кузовной элемент» (можно ввести и свой вариант). */
export const BODY_ELEMENTS = [
  "Капот",
  "Крыша",
  "Крышка багажника",
  "Бампер передний",
  "Бампер задний",
  "Крыло переднее левое",
  "Крыло переднее правое",
  "Крыло заднее левое",
  "Крыло заднее правое",
  "Дверь передняя левая",
  "Дверь передняя правая",
  "Дверь задняя левая",
  "Дверь задняя правая",
  "Порог левый",
  "Порог правый",
  "Стекло лобовое",
  "Стекло заднее",
  "Зеркало левое",
  "Зеркало правое",
  "Фара / фонарь",
  "Колёсный диск",
];

export type InspectionPhoto = {
  id: number;
  url: string | null;
  section: "GENERAL" | "EXTERIOR" | "INTERIOR";
  markId: number | null;
  by: string;
  createdAt: string;
};

export type InspectionMark = {
  id: number;
  type: DamageType;
  x: number;
  y: number;
  element: string;
  note: string | null;
  photos: InspectionPhoto[];
};

export type MissingField = { code: string; field: string; label: string };

export type InspectionData = {
  id: number;
  receivedAt: string;
  receivedBy: { id: number; fullName: string } | null;
  mileageKm: number | null;
  fuelPercent: number | null;
  keysCount: number | null;
  noDefectsConfirmed: boolean;
  exteriorNote: string | null;
  interior: Partial<Record<InteriorKey, InteriorFlag>>;
  interiorNote: string | null;
  systems: Partial<Record<SystemKey, { status: SystemStatus; note?: string }>>;
  systemsNote: string | null;
  specialTerms: string | null;
  note: string | null;
  dataVerifiedAt: string | null;
  dataVerifiedBy: string | null;
};

export type InspectionView = {
  visitId: number;
  started: boolean;
  inspection: InspectionData | null;
  marks: InspectionMark[];
  photos: InspectionPhoto[];
  client: {
    id: number;
    lastName: string | null;
    firstName: string | null;
    patronymic: string | null;
    phone: string;
    birthDate: string | null;
  };
  vehicle: {
    id: number;
    label: string;
    year: number | null;
    vin: string | null;
    plate: string | null;
  } | null;
  assignees: { id: number; fullName: string }[];
  readiness: { complete: boolean; missing: MissingField[] };
};
