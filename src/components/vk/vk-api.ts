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

// Validation utilities (те же самые)
const validateName = (name: string) => {
    if (!name || name.trim().length < 2) {
        throw new Error("Invalid name");
    }
};

const validatePhone = (phone: string) => {
    if (!phone || phone.trim().length < 10) {
        throw new Error("Invalid phone");
    }
};

const validateMessage = (message: string) => {
    if (message && message.length > 1000) {
        throw new Error("Message is too long");
    }
};

const sanitizeInput = (input: string): string => {
    return input.replace(/[<>"'&]/g, "").trim();
};

export const vkApiClient = {
    async sendCallbackForm(data: CallbackFormData): Promise<VkApiResponse> {
        try {
            // Client-side validation
            validateName(data.name);
            validatePhone(data.phone);
            validateMessage(data.message || "");

            // Sanitize input data
            const sanitizedData = {
                name: sanitizeInput(data.name),
                phone: sanitizeInput(data.phone),
                message: sanitizeInput(data.message || "Хочу получить консультацию"),
            };

            const response: AxiosResponse<VkApiResponse> =
                await vkApi.post("/send", sanitizedData);  // <-- /send, а не /send-message

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
            // Client-side validation
            validateName(data.name);
            validatePhone(data.phone);

            if (
                !data.contactMethod ||
                !["telegram", "whatsapp", "phone"].includes(data.contactMethod)
            ) {
                throw new Error("Invalid contact method");
            }

            if (!data.isNotAuto && (!data.brand || !data.model)) {
                throw new Error("Brand and model are required");
            }

            if (data.isNotAuto && !data.customBrand) {
                throw new Error("Custom brand is required");
            }

            // Sanitize input data
            const sanitizedData = {
                name: sanitizeInput(data.name),
                phone: sanitizeInput(data.phone),
                brand: data.brand ? sanitizeInput(data.brand) : "",
                model: data.model ? sanitizeInput(data.model) : "",
                customBrand: data.customBrand ? sanitizeInput(data.customBrand) : "",
                carDescription: data.isNotAuto
                    ? sanitizeInput(data.customBrand || "")
                    : `${sanitizeInput(data.brand || "")} ${sanitizeInput(data.model || "")}`.trim(),
                href: typeof window !== "undefined" ? window.location.href : "",
                communicationMethod: data.contactMethod,
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