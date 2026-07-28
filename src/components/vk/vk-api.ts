import { type AutoPriceFormData, type CallbackFormData } from "@/lib/validations";
import axios, { AxiosResponse } from "axios";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4444/api";

const vkApi = axios.create({
    baseURL: `${API_BASE_URL}/vk`,
    headers: {
        "Content-Type": "application/json",
    },
});

export interface VkApiResponse {
    success: boolean;
    messageId?: number;
    message?: string;
}

const sanitizeText = (input: string): string => {
    return input.replace(/[<>"'&]/g, "").trim();
};

export const vkApiClient = {
    async sendCallbackForm(data: CallbackFormData): Promise<VkApiResponse> {
        try {
            const sanitizedData = {
                name: sanitizeText(data.name),
                phone: data.phone,
                message: sanitizeText(data.message || "Хочу получить консультацию"),
                href: data.href,
            };

            const response: AxiosResponse<VkApiResponse> =
                await vkApi.post("/send", sanitizedData);

            return response.data;

        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Ошибка отправки заявки";

            throw new Error(errorMessage);
        }
    },

    async sendFullForm(data: AutoPriceFormData): Promise<VkApiResponse> {
        try {
            const sanitizedData = {
                name: sanitizeText(data.name),
                phone: data.phone,
                brand: data.brand ? sanitizeText(data.brand) : "",
                model: data.model ? sanitizeText(data.model) : "",
                customBrand: data.customBrand ? sanitizeText(data.customBrand) : "",
                isNotAuto: data.isNotAuto,
                carDescription: data.isNotAuto
                    ? sanitizeText(data.customBrand || "")
                    : `${sanitizeText(data.brand || "")} ${sanitizeText(data.model || "")}`.trim(),
                href: typeof window !== "undefined" ? window.location.href : "",
                contactMethod: data.contactMethod,
            };

            const response: AxiosResponse<VkApiResponse> =
                await vkApi.post("/send", sanitizedData);

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