/** Год выпуска: целое от 1900 до следующего года. Возвращает текст ошибки или null. */
export function getVehicleYearError(value: string, now = new Date()): string | null {
  const t = value.trim();
  if (!t) return "Укажите год выпуска";
  const max = now.getFullYear() + 1;
  if (!/^\d{4}$/.test(t) || Number(t) < 1900 || Number(t) > max) {
    return `Год выпуска: от 1900 до ${max}`;
  }
  return null;
}

const LATIN_TO_CYRILLIC: Record<string, string> = {
  A: "А", B: "В", E: "Е", K: "К", M: "М", H: "Н", O: "О", P: "Р", C: "С", T: "Т", Y: "У", X: "Х",
};
const RUSSIAN_PLATE = /^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/;

/** Как на сервере: заглавные, без пробелов и дефисов; латиница в российском номере → кириллица. */
export function normalizePlateInput(value: string): string {
  const base = value.replace(/[\s-]+/g, "").toUpperCase();
  const cyrillic = [...base].map((ch) => LATIN_TO_CYRILLIC[ch] ?? ch).join("");
  return RUSSIAN_PLATE.test(cyrillic) ? cyrillic : base;
}

/** null, если поле пустое (необязательное); иначе текст ошибки или null. */
export function getPlateError(value: string): string | null {
  const t = normalizePlateInput(value);
  if (!t) return null;
  return /^[A-ZА-ЯЁ0-9]{3,15}$/.test(t)
    ? null
    : "Госномер: 3–15 букв и цифр, без спецсимволов";
}
