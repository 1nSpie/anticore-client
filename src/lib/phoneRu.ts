/** Формат хранения: `79XXXXXXXXX` (11 цифр, мобильный РФ). */

export const PHONE_STORAGE_REGEX = /^79\d{9}$/;

/** Неснимаемый префикс в полях ввода. */
export const PHONE_RU_INPUT_PREFIX = "+79";

const PHONE_SUFFIX_MAX = 9;

const PHONE_ERROR =
  "Укажите мобильный номер России: +79 и ещё 9 цифр";

export function normalizePhoneRu(input: string): string {
  const digits = input.replace(/\D/g, "");
  let normalized: string;
  if (digits.length === 10) {
    normalized = `7${digits}`;
  } else if (digits.length === 11 && digits.startsWith("8")) {
    normalized = `7${digits.slice(1)}`;
  } else if (digits.length === 11 && digits.startsWith("7")) {
    normalized = digits;
  } else {
    throw new Error(PHONE_ERROR);
  }
  if (!PHONE_STORAGE_REGEX.test(normalized)) {
    throw new Error(PHONE_ERROR);
  }
  return normalized;
}

export function isValidPhoneRuInput(input: string): boolean {
  try {
    normalizePhoneRu(input);
    return true;
  } catch {
    return false;
  }
}

function extractPhoneSuffixDigits(digits: string): string {
  if (digits.startsWith("79")) return digits.slice(2);
  if (digits.startsWith("89")) return digits.slice(2);
  if (digits.startsWith("7") && digits[1] === "9") return digits.slice(2);
  if (digits.startsWith("8") && digits[1] === "9") return digits.slice(2);
  if (digits.startsWith("9")) return digits.slice(1);
  return digits;
}

/** Маска ввода: фиксированный `+79` + до 9 цифр абонента. */
export function formatPhoneRuInput(raw: string): string {
  if (!raw || raw === "+" || raw === "+7") {
    return PHONE_RU_INPUT_PREFIX;
  }

  if (raw.startsWith(PHONE_RU_INPUT_PREFIX)) {
    const suffixDigits = raw
      .slice(PHONE_RU_INPUT_PREFIX.length)
      .replace(/\D/g, "")
      .slice(0, PHONE_SUFFIX_MAX);
    return PHONE_RU_INPUT_PREFIX + suffixDigits;
  }

  const digits = raw.replace(/\D/g, "");
  const suffixDigits = extractPhoneSuffixDigits(digits).slice(0, PHONE_SUFFIX_MAX);
  return PHONE_RU_INPUT_PREFIX + suffixDigits;
}

/** Для отображения: 79001234567 → +79001234567 */
export function formatPhoneRuDisplay(stored: string): string {
  try {
    const normalized = normalizePhoneRu(stored);
    return PHONE_RU_INPUT_PREFIX + normalized.slice(2);
  } catch {
    const digits = stored.replace(/\D/g, "");
    if (digits.startsWith("79") && digits.length > 2) {
      return PHONE_RU_INPUT_PREFIX + digits.slice(2);
    }
    return formatPhoneRuInput(stored);
  }
}

export function formatPhoneRuDisplaySafe(input: string): string {
  return formatPhoneRuDisplay(input);
}

/** Цифры для поиска клиента по телефону */
export function phoneDigitsForSearch(input: string): string {
  try {
    return normalizePhoneRu(input);
  } catch {
    const digits = input.replace(/\D/g, "");
    if (digits.length === 10) return `7${digits}`;
    if (digits.length === 11 && digits.startsWith("8")) return `7${digits.slice(1)}`;
    if (digits.length >= 11) return digits.slice(0, 11);
    return digits;
  }
}

export function phonesMatchRu(a: string, b: string): boolean {
  try {
    return normalizePhoneRu(a) === normalizePhoneRu(b);
  } catch {
    return false;
  }
}
