import { type AutoPriceFormData, type CallbackFormData } from "@/lib/validations";
import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4444/api";

const telegramApi = axios.create({
  baseURL: `${API_BASE_URL}/telegram`,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface TelegramApiResponse {
  success: boolean;
  message?: string;
}

const sanitizeText = (input: string): string => {
  return input.replace(/[<>"'&]/g, "").trim();
};

export const telegramApiClient = {
  async sendCallbackForm(data: CallbackFormData): Promise<TelegramApiResponse> {
    try {
      const sanitizedData = {
        name: sanitizeText(data.name),
        phone: data.phone,
        message: sanitizeText(data.message || "Хочу получить консультацию"),
      };

      const response: AxiosResponse<TelegramApiResponse> =
        await telegramApi.post("/send-message", sanitizedData);

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Ошибка отправки заявки";

      throw new Error(errorMessage);
    }
  },

  async sendFullForm(data: AutoPriceFormData): Promise<TelegramApiResponse> {
    try {
      const sanitizedData = {
        name: sanitizeText(data.name),
        phone: data.phone,
        brand: data.brand ? sanitizeText(data.brand) : "",
        model: data.model ? sanitizeText(data.model) : "",
        customBrand: data.customBrand ? sanitizeText(data.customBrand) : "",
        isNotAuto: data.isNotAuto,
        contactMethod: data.contactMethod,
      };

      const response: AxiosResponse<TelegramApiResponse> =
        await telegramApi.post("/send-full", sanitizedData);

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Ошибка отправки обратной связи";

      throw new Error(errorMessage);
    }
  },
};
