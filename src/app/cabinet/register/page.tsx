"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/shadcn/input";
import { PhoneRuInput } from "@/components/PhoneRuInput";
import { Loader2, Phone, Lock, KeyRound, MessageSquare } from "lucide-react";
import { cabinetAxios, setCabinetAccessToken } from "../_lib/api";
import { registerSchema, verifyRegSchema } from "../_lib/schemas";
import type { z } from "zod";
import {
  cabinetInput,
  cabinetInputWithIcon,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetLink,
} from "../_lib/cabinetUi";
import { useCabinetGuestOnly } from "../_lib/useCabinetGuestOnly";
import { PageSkeleton } from "../_components/PageSkeleton";
import { RegisterLegalCheckboxes } from "../_components/RegisterLegalCheckboxes";
import { AuthShell } from "../_components/AuthShell";
import { CabinetStepper } from "../_components/CabinetStepper";
import { CabinetField } from "../_components/CabinetField";
import { YandexSmartCaptcha } from "../_components/YandexSmartCaptcha";
import { PHONE_RU_INPUT_PREFIX } from "@/lib/phoneRu";

type RegForm = z.infer<typeof registerSchema>;
type VerifyForm = z.infer<typeof verifyRegSchema>;

const STEPS = [
  { id: 1, label: "Аккаунт" },
  { id: 2, label: "SMS-код" },
];

const SMARTCAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY?.trim() ?? "";

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  const tail = digits.slice(-2);
  return `+7 ••• ••• •• ${tail}`;
}

function apiErrorMessage(e: unknown, fallback: string): string {
  const raw = (e as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(raw)) return raw.join(", ");
  if (typeof raw === "string") return raw;
  return fallback;
}

export default function CabinetRegisterPage() {
  const router = useRouter();
  const guestAllowed = useCabinetGuestOnly();
  const [step, setStep] = useState<1 | 2>(1);
  const captchaResetRef = useRef<(() => void) | null>(null);

  const reg = useForm<RegForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: PHONE_RU_INPUT_PREFIX,
      password: "",
      passwordConfirm: "",
      acceptPrivacyPolicy: false,
      acceptPersonalDataConsent: false,
      acceptTerms: false,
      captchaToken: "",
    },
  });

  const verify = useForm<VerifyForm>({
    resolver: zodResolver(verifyRegSchema),
    defaultValues: { phone: PHONE_RU_INPUT_PREFIX, code: "" },
  });

  const phoneValue = reg.watch("phone");
  const captchaToken = reg.watch("captchaToken");

  useEffect(() => {
    if (step === 2) {
      verify.setValue("phone", reg.getValues("phone"));
    }
  }, [step, reg, verify]);

  const resetCaptcha = () => {
    reg.setValue("captchaToken", "");
    captchaResetRef.current?.();
  };

  const onRegister = async (data: RegForm) => {
    if (!SMARTCAPTCHA_SITE_KEY) {
      toast.error("Капча не настроена (NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY)");
      return;
    }
    try {
      await cabinetAxios.post("/auth/register", data);
      verify.setValue("phone", data.phone);
      toast.success("Код отправлен по SMS");
      setStep(2);
    } catch (e: unknown) {
      toast.error(apiErrorMessage(e, "Не удалось отправить код"));
      resetCaptcha();
    }
  };

  const onVerify = async (data: VerifyForm) => {
    try {
      const { data: res } = await cabinetAxios.post<{
        accessToken: string;
      }>("/auth/verify-registration", data);
      setCabinetAccessToken(res.accessToken);
      toast.success("Регистрация завершена");
      router.replace("/cabinet/profile");
    } catch (e: unknown) {
      toast.error(apiErrorMessage(e, "Неверный код"));
    }
  };

  if (!guestAllowed) {
    return <PageSkeleton />;
  }

  return (
    <AuthShell
      title="Регистрация"
      subtitle={
        step === 1
          ? "Создайте аккаунт — понадобится телефон и пароль от 8 символов"
          : "Введите код из SMS, чтобы завершить регистрацию"
      }
      footer={
        step === 1 ? (
          <p className="text-sm text-slate-400 text-center">
            Уже есть аккаунт?{" "}
            <Link href="/cabinet/login" className={cabinetLink}>
              Войти
            </Link>
          </p>
        ) : undefined
      }
    >
      <CabinetStepper steps={STEPS} current={step} />

      {step === 1 ? (
        <form onSubmit={reg.handleSubmit(onRegister)} className="space-y-5">
          <CabinetField
            label="Телефон"
            id="reg-phone"
            icon={Phone}
            hint="Формат: +7 и 10 цифр. На этот номер придёт код"
            error={reg.formState.errors.phone?.message}
          >
            <PhoneRuInput
              id="reg-phone"
              autoComplete="tel"
              className={cabinetInputWithIcon}
              {...reg.register("phone")}
            />
          </CabinetField>

          <CabinetField
            label="Пароль"
            id="reg-password"
            icon={Lock}
            hint="Не менее 8 символов"
            error={reg.formState.errors.password?.message}
          >
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              className={cabinetInputWithIcon}
              {...reg.register("password")}
            />
          </CabinetField>

          <CabinetField
            label="Подтверждение пароля"
            id="reg-password-confirm"
            icon={KeyRound}
            error={reg.formState.errors.passwordConfirm?.message}
          >
            <Input
              id="reg-password-confirm"
              type="password"
              autoComplete="new-password"
              className={cabinetInputWithIcon}
              {...reg.register("passwordConfirm")}
            />
          </CabinetField>

          <RegisterLegalCheckboxes control={reg.control} errors={reg.formState.errors} />

          <div className="space-y-2">
            {SMARTCAPTCHA_SITE_KEY ? (
              <YandexSmartCaptcha
                sitekey={SMARTCAPTCHA_SITE_KEY}
                resetRef={captchaResetRef}
                onSuccess={(token) => {
                  reg.setValue("captchaToken", token, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                onExpire={resetCaptcha}
                onError={() => {
                  resetCaptcha();
                  toast.error("Ошибка капчи. Обновите страницу.");
                }}
              />
            ) : (
              <p className="text-xs text-amber-400/90">
                Капча не настроена: задайте NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY
              </p>
            )}
            {reg.formState.errors.captchaToken?.message ? (
              <p className="text-xs text-red-400">
                {reg.formState.errors.captchaToken.message}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className={cabinetBtnPrimary}
            disabled={
              reg.formState.isSubmitting ||
              !SMARTCAPTCHA_SITE_KEY ||
              !captchaToken
            }
          >
            {reg.formState.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Отправка…
              </>
            ) : (
              "Получить код по SMS"
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={verify.handleSubmit(onVerify)} className="space-y-5">
          <p className="text-sm text-slate-400 rounded-xl bg-teal-500/5 border border-teal-500/20 px-4 py-3">
            Код отправлен на{" "}
            <span className="text-teal-300 font-medium">
              {maskPhone(phoneValue || verify.getValues("phone"))}
            </span>
          </p>

          <CabinetField
            label="Код из SMS"
            id="verify-code"
            icon={MessageSquare}
            hint="Обычно 6 цифр. Код действует 10 минут"
            error={verify.formState.errors.code?.message}
          >
            <Input
              id="verify-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              className={`${cabinetInputWithIcon} text-lg tracking-[0.3em] font-mono`}
              {...verify.register("code")}
            />
          </CabinetField>
          <input type="hidden" {...verify.register("phone")} />

          <button
            type="submit"
            className={cabinetBtnPrimary}
            disabled={verify.formState.isSubmitting}
          >
            {verify.formState.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Проверка…
              </>
            ) : (
              "Завершить регистрацию"
            )}
          </button>
          <button
            type="button"
            className={cabinetBtnSecondary}
            onClick={() => {
              setStep(1);
              resetCaptcha();
            }}
          >
            Изменить телефон
          </button>
        </form>
      )}
    </AuthShell>
  );
}
