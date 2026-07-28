const ONES = [
  "",
  "один",
  "два",
  "три",
  "четыре",
  "пять",
  "шесть",
  "семь",
  "восемь",
  "девять",
];
const ONES_FEM = [
  "",
  "одна",
  "две",
  "три",
  "четыре",
  "пять",
  "шесть",
  "семь",
  "восемь",
  "девять",
];
const TEENS = [
  "десять",
  "одиннадцать",
  "двенадцать",
  "тринадцать",
  "четырнадцать",
  "пятнадцать",
  "шестнадцать",
  "семнадцать",
  "восемнадцать",
  "девятнадцать",
];
const TENS = [
  "",
  "",
  "двадцать",
  "тридцать",
  "сорок",
  "пятьдесят",
  "шестьдесят",
  "семьдесят",
  "восемьдесят",
  "девяносто",
];
const HUNDREDS = [
  "",
  "сто",
  "двести",
  "триста",
  "четыреста",
  "пятьсот",
  "шестьсот",
  "семьсот",
  "восемьсот",
  "девятьсот",
];

function triadToWords(n: number, feminine: boolean): string {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  const parts: string[] = [];
  if (h) parts.push(HUNDREDS[h]!);
  if (t === 1) {
    parts.push(TEENS[o]!);
  } else {
    if (t) parts.push(TENS[t]!);
    if (o) parts.push((feminine ? ONES_FEM : ONES)[o]!);
  }
  return parts.join(" ");
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** «Сорок одна тысяча пятьсот рублей 00 копеек» (с заглавной). */
export function rublesInWordsRu(amount: number): string {
  const rub = Math.max(0, Math.floor(Math.abs(amount)));
  const kop = Math.round((Math.abs(amount) - rub) * 100) % 100;

  if (rub === 0) {
    return `Ноль рублей ${String(kop).padStart(2, "0")} копеек`;
  }

  const millions = Math.floor(rub / 1_000_000);
  const thousands = Math.floor((rub % 1_000_000) / 1000);
  const rest = rub % 1000;

  const parts: string[] = [];
  if (millions) {
    parts.push(
      triadToWords(millions, false),
      plural(millions, "миллион", "миллиона", "миллионов"),
    );
  }
  if (thousands) {
    parts.push(
      triadToWords(thousands, true),
      plural(thousands, "тысяча", "тысячи", "тысяч"),
    );
  }
  if (rest || (!millions && !thousands)) {
    parts.push(triadToWords(rest, false));
  }
  parts.push(plural(rub, "рубль", "рубля", "рублей"));

  const words = parts.filter(Boolean).join(" ");
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);
  return `${capitalized} ${String(kop).padStart(2, "0")} копеек`;
}
