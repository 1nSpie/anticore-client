import { z } from 'zod';

// Phone number validation regex
const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,20}$/;


// Base schemas
export const nameSchema = z
  .string()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(100, 'Имя не должно превышать 100 символов')
  .regex(/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/, 'Имя может содержать только буквы, пробелы и дефисы');

export const phoneSchema = z
  .string()
  .min(10, 'Номер телефона должен содержать минимум 10 цифр')
  .max(20, 'Номер телефона не должен превышать 20 символов')
  .regex(phoneRegex, 'Неверный формат номера телефона');

export const messageSchema = z
  .string()
  .max(1000, 'Сообщение не должно превышать 1000 символов')
  .optional();

// Callback form validation schema
export const callbackFormSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  message: messageSchema,
  href: z.string().optional(),
});

// Contact method schema
export const contactMethodSchema = z.enum(['telegram', 'whatsapp', 'phone'], {
  message: 'Выберите способ связи',
});

// Auto price form validation schema
export const autoPriceFormSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  customBrand: z.string().optional(),
  isNotAuto: z.boolean(),
  name: nameSchema,
  phone: phoneSchema,
  contactMethod: contactMethodSchema,
}).refine((data) => {
  // If not auto, custom brand is required
  if (data.isNotAuto) {
    return data.customBrand && data.customBrand.trim().length > 0;
  }
  // If auto, brand and model are required
  return data.brand && data.model && data.brand.trim().length > 0 && data.model.trim().length > 0;
}, {
  message: 'Заполните все обязательные поля',
  path: ['root'],
});

// Type exports
export type CallbackFormData = z.infer<typeof callbackFormSchema>;
export type AutoPriceFormData = z.infer<typeof autoPriceFormSchema>;
