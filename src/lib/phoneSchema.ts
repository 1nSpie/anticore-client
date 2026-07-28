import { z } from "zod";
import { normalizePhoneRu } from "@/lib/phoneRu";

const PHONE_ERROR =
  "Укажите мобильный номер России: +79 и ещё 9 цифр";

/** Ввод телефона → нормализация в `79XXXXXXXXX` (как в БД). */
export const phoneInputSchema = z
  .string()
  .min(10, "Введите номер телефона")
  .transform((val, ctx) => {
    try {
      return normalizePhoneRu(val);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: PHONE_ERROR,
      });
      return z.NEVER;
    }
  });

export { phoneInputSchema as phoneSchema };
