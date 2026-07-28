/** Названия типов автомобиля — как в калькуляторе на /price/[id] */
export const SEGMENT_NAMES: Record<number, string> = {
  1: "До 4 м (класс A, B)",
  2: "От 4 до 5 м (класс C, D, E)",
  3: "Минивэны, кроссоверы",
  4: "Внедорожники",
  5: "Микроавтобусы и пикапы",
  6: "Премиум класс",
};

export const SEGMENT_IDS = [1, 2, 3, 4, 5, 6] as const;

/** Поля API по индексу пакета: 0=Стандарт ML, 1=Стандарт ML/Body, 2=Комплекс ML, 3=Комплекс ML/Body */
export const SERVICE_PRICE_KEYS: (
  | "standartML"
  | "standartMLBody"
  | "complexML"
  | "complexMLBody"
)[] = [
  "standartML",
  "standartMLBody",
  "complexML",
  "complexMLBody",
];

export function segmentName(segment: number): string {
  return SEGMENT_NAMES[segment] ?? `Сегмент ${segment}`;
}
