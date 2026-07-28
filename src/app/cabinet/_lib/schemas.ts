import { z } from "zod";
import { phoneInputSchema } from "@/lib/phoneSchema";

export const phoneSchema = phoneInputSchema;

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "Введите пароль"),
});

const legalAcceptMessage = "Необходимо подтвердить для продолжения регистрации";

export const registerSchema = z
  .object({
    phone: phoneSchema,
    password: z.string().min(8, "Не менее 8 символов"),
    passwordConfirm: z.string().min(8, "Подтвердите пароль"),
    acceptPrivacyPolicy: z
      .boolean()
      .refine((v) => v === true, { message: legalAcceptMessage }),
    acceptPersonalDataConsent: z
      .boolean()
      .refine((v) => v === true, { message: legalAcceptMessage }),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, { message: legalAcceptMessage }),
    captchaToken: z
      .string()
      .min(1, "Пройдите проверку «Я не робот»"),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Пароли не совпадают",
    path: ["passwordConfirm"],
  });

export const verifyRegSchema = z.object({
  phone: phoneSchema,
  code: z.string().min(4).max(8),
});

export const forgotSchema = z.object({
  phone: phoneSchema,
  captchaToken: z.string().min(1, "Пройдите проверку «Я не робот»"),
});

export const resetPasswordSchema = z
  .object({
    phone: phoneSchema,
    code: z.string().min(4).max(8),
    password: z.string().min(8, "Не менее 8 символов"),
    passwordConfirm: z.string().min(8),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Пароли не совпадают",
    path: ["passwordConfirm"],
  });

export const profileSchema = z.object({
  firstName: z.string().max(100).optional().or(z.literal("")),
  lastName: z.string().max(100).optional().or(z.literal("")),
  patronymic: z.string().max(100).optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
});

/** Форма профиля на клиенте: ФИО + авто (марка/модель как в AutoPrice) */
export const cabinetProfileFormSchema = profileSchema.extend({
  brand: z.string().optional(),
  model: z.string().optional(),
  customCar: z.string().max(200).optional().or(z.literal("")),
  isNotAuto: z.boolean(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Текущий пароль"),
    newPassword: z.string().min(8, "Не менее 8 символов"),
    newPasswordConfirm: z.string().min(8),
  })
  .refine((d) => d.newPassword === d.newPasswordConfirm, {
    message: "Пароли не совпадают",
    path: ["newPasswordConfirm"],
  });

export const notificationsSchema = z.object({
  smsEnabled: z.boolean(),
  notifyReminder: z.boolean(),
});
