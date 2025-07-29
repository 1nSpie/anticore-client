
import { AutoPriceFormData } from "@/app/glav/type";
import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4444/api";

const telegramApi = axios.create({
  baseURL: `${API_BASE_URL}/telegram`,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface CallbackFormData {
  name: string;
  phone: string;
  message: string;
}

export interface TelegramApiResponse {
  success: boolean;
  message?: string;
}


export const telegramApiClient = {
  async sendCallbackForm(data: CallbackFormData): Promise<TelegramApiResponse> {
    try {
      const response: AxiosResponse<TelegramApiResponse> =
        await telegramApi.post(
          "/send-message",
          data // Axios автоматически сериализует JSON
        );

      return response.data;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const response: AxiosResponse<TelegramApiResponse> =
        await telegramApi.post("/send-full", data);

      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Ошибка отправки обратной связи";

      throw new Error(errorMessage);
    }
  },
};
