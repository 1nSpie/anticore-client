import { z } from 'zod';

// Russian phone: 10 digits (9XX mobile, 3/4/5/8 XX regional) or 11 digits (7/8 + 10)
function isValidRussianPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) {
    const first = digits[0];
    return ['3', '4', '5', '8', '9'].includes(first);
  }
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) return true;
  return false;
}


// Base schemas
export const nameSchema = z
  .string()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .max(100, 'Имя не должно превышать 100 символов')
  .regex(/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/, 'Имя может содержать только буквы, пробелы и дефисы');

export const phoneSchema = z
  .string()
  .min(10, 'Введите номер телефона')
  .refine(
    (val) => val.replace(/\D/g, '').length >= 10,
    'Номер должен содержать минимум 10 цифр'
  )
  .refine(
    isValidRussianPhone,
    'Введите корректный номер'
  );

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
  if (data.isNotAuto) {
    return data.customBrand && data.customBrand.trim().length > 0;
  }
  return data.brand && data.model && data.brand.trim().length > 0 && data.model.trim().length > 0;
}, {
  message: 'Заполните все обязательные поля',
  path: ['root'],
});

// Type exports
export type CallbackFormData = z.infer<typeof callbackFormSchema>;
export type AutoPriceFormData = z.infer<typeof autoPriceFormSchema>;
