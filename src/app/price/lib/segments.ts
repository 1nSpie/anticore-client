/** Короткие названия сегментов для калькулятора */
export const SEGMENT_NAMES: Record<number, string> = {
  1: "До 4 м (класс A, B)",
  2: "От 4 до 5 м (класс C, D, E)",
  3: "Минивэны, кроссоверы",
  4: "Внедорожники",
  5: "Микроавтобусы и пикапы",
  6: "Премиум класс",
};

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
