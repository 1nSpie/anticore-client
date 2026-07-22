/**
 * Валидация VIN (ISO 3779). Логика совпадает с `anticore-server/src/common/vin.util.ts`.
 */

export const VIN_FORMAT_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

const CHAR_VALUES: Record<string, number> = {
  "0": 0,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
};

const POSITION_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export function normalizeVin(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

function isNorthAmericanVin(vin: string): boolean {
  const c = vin[0];
  return c >= "1" && c <= "5";
}

function calculateVinCheckDigit(vin: string): string {
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    if (i === 8) continue;
    sum += CHAR_VALUES[vin[i]!]! * POSITION_WEIGHTS[i]!;
  }
  const remainder = sum % 11;
  return remainder === 10 ? "X" : String(remainder);
}

export function getVinValidationError(input: string): string | null {
  const vin = normalizeVin(input);

  if (!vin) return null;

  if (vin.length !== 17) {
    return "VIN — ровно 17 символов";
  }

  if (/[IOQ]/.test(vin)) {
    return "В VIN нельзя использовать буквы I, O и Q";
  }

  if (!VIN_FORMAT_REGEX.test(vin)) {
    return "Только латиница (кроме I, O, Q) и цифры";
  }

  if (!/^\d{6}$/.test(vin.slice(11))) {
    return "Последние 6 символов VIN должны быть цифрами";
  }

  if (/^(.)\1{16}$/.test(vin)) {
    return "Некорректный VIN";
  }

  if (isNorthAmericanVin(vin)) {
    const expected = calculateVinCheckDigit(vin);
    if (vin[8] !== expected) {
      return `Неверная контрольная цифра (9-й символ). Ожидается «${expected}»`;
    }
  }

  return null;
}

export function isValidVin(input: string): boolean {
  return getVinValidationError(input) === null;
}
