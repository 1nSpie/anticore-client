import { z } from 'zod';
import { phoneInputSchema } from './phoneSchema';

export const nameSchema = z
  .string()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(100, 'Имя не должно превышать 100 символов')
  .regex(/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/, 'Имя может содержать только буквы, пробелы и дефисы');

export const phoneSchema = phoneInputSchema;

export const messageSchema = z
  .string()
  .max(1000, 'Сообщение не должно превышать 1000 символов')
  .optional();

export const callbackFormSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  message: messageSchema,
  href: z.string().optional(),
});

export const contactMethodSchema = z.enum(['telegram', 'whatsapp', 'phone'], {
  message: 'Выберите способ связи',
});

export const autoPriceFormSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  customBrand: z.string().optional(),
  isNotAuto: z.boolean(),
  name: nameSchema,
  phone: phoneSchema,
  contactMethod: contactMethodSchema,
}).refine((data) => {
  if (data.isNotAuto) {
    return data.customBrand && data.customBrand.trim().length > 0;
  }
  return data.brand && data.model && data.brand.trim().length > 0 && data.model.trim().length > 0;
}, {
  message: 'Заполните все обязательные поля',
  path: ['root'],
});

export type CallbackFormData = z.infer<typeof callbackFormSchema>;
export type AutoPriceFormData = z.infer<typeof autoPriceFormSchema>;
