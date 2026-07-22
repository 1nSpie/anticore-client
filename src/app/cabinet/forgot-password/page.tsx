"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/shadcn/input";
import { PhoneRuInput } from "@/components/PhoneRuInput";
import { Loader2, Phone, MessageSquare, Lock, KeyRound } from "lucide-react";
import { cabinetAxios } from "../_lib/api";
import { forgotSchema, resetPasswordSchema } from "../_lib/schemas";
import type { z } from "zod";
import {
  cabinetInputWithIcon,
  cabinetBtnPrimary,
  cabinetBtnSecondary,
  cabinetLink,
  cabinetMuted,
} from "../_lib/cabinetUi";
import { AuthShell } from "../_components/AuthShell";
import { CabinetStepper } from "../_components/CabinetStepper";
import { CabinetField } from "../_components/CabinetField";
import { YandexSmartCaptcha } from "../_components/YandexSmartCaptcha";
import { normalizePhoneRu, PHONE_RU_INPUT_PREFIX } from "@/lib/phoneRu";

type Forgot = z.infer<typeof forgotSchema>;
type Reset = z.infer<typeof resetPasswordSchema>;

const STEPS = [
  { id: 1, label: "Телефон" },
  { id: 2, label: "Новый пароль" },
];

const COOLDOWN_SEC = 3 * 60;
const COOLDOWN_STORAGE_PREFIX = "cabinet_forgot_cooldown:";

const SMARTCAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY?.trim() ?? "";

function cooldownKey(phone: string): string {
  try {
    return COOLDOWN_STORAGE_PREFIX + normalizePhoneRu(phone);
  } catch {
    return COOLDOWN_STORAGE_PREFIX + phone.replace(/\D/g, "");
  }
}

function readCooldownLeft(phone: string): number {
  if (typeof window === "undefined" || !phone.trim()) return 0;
  const raw = sessionStorage.getItem(cooldownKey(phone));
  if (!raw) return 0;
  const until = Number(raw);
  if (!Number.isFinite(until)) return 0;
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

function startCooldown(phone: string, sec = COOLDOWN_SEC) {
  sessionStorage.setItem(cooldownKey(phone), String(Date.now() + sec * 1000));
}

function formatCooldown(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m <= 0) return `${s} сек.`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function apiErrorMessage(e: unknown, fallback: string): string {
  const raw = (e as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(raw)) return raw.join(", ");
  if (typeof raw === "string") return raw;
  return fallback;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [cooldownSec, setCooldownSec] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [resendCaptchaToken, setResendCaptchaToken] = useState("");
  const captchaResetRef = useRef<(() => void) | null>(null);
  const resendCaptchaResetRef = useRef<(() => void) | null>(null);

  const forgot = useForm<Forgot>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { phone: PHONE_RU_INPUT_PREFIX, captchaToken: "" },
  });
  const reset = useForm<Reset>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      phone: PHONE_RU_INPUT_PREFIX,
      code: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const watchedPhone = forgot.watch("phone");
  const captchaToken = forgot.watch("captchaToken");

  const syncCooldown = useCallback(() => {
    const phone = step === 2 ? reset.getValues("phone") : watchedPhone;
    setCooldownSec(readCooldownLeft(phone));
  }, [step, watchedPhone, reset]);

  useEffect(() => {
    syncCooldown();
    const id = window.setInterval(syncCooldown, 1000);
    return () => window.clearInterval(id);
  }, [syncCooldown]);

  useEffect(() => {
    if (step === 2) {
      reset.setValue("phone", forgot.getValues("phone"));
    }
  }, [step, forgot, reset]);

  const resetStep1Captcha = () => {
    forgot.setValue("captchaToken", "");
    captchaResetRef.current?.();
  };

  const resetResendCaptcha = () => {
    setResendCaptchaToken("");
    resendCaptchaResetRef.current?.();
  };

  const requestCode = async (phone: string, token: string) => {
    if (!SMARTCAPTCHA_SITE_KEY) {
      toast.error("Капча не настроена (NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY)");
      return false;
    }
    if (!token.trim()) {
      toast.error("Пройдите проверку «Я не робот»");
      return false;
    }
    setSendingCode(true);
    try {
      const { data } = await cabinetAxios.post<{
        message?: string;
        retryAfterSec?: number;
      }>("/auth/forgot-password", { phone, captchaToken: token });
      const retry =
        typeof data?.retryAfterSec === "number" && data.retryAfterSec > 0
          ? data.retryAfterSec
          : COOLDOWN_SEC;
      startCooldown(phone, retry);
      setCooldownSec(retry);
      toast.success("Если номер зарегистрирован, код отправлен");
      return true;
    } catch (e: unknown) {
      toast.error(apiErrorMessage(e, "Не удалось отправить код"));
      syncCooldown();
      return false;
    } finally {
      setSendingCode(false);
    }
  };

  const onForgot = async (data: Forgot) => {
    if (readCooldownLeft(data.phone) > 0) {
      toast.error(
        `Повторный код можно запросить через ${formatCooldown(readCooldownLeft(data.phone))}`,
      );
      return;
    }
    const ok = await requestCode(data.phone, data.captchaToken);
    if (ok) {
      reset.setValue("phone", data.phone);
      setStep(2);
      resetStep1Captcha();
    } else {
      resetStep1Captcha();
    }
  };

  const onResend = async () => {
    const phone = reset.getValues("phone") || forgot.getValues("phone");
    if (readCooldownLeft(phone) > 0) return;
    const ok = await requestCode(phone, resendCaptchaToken);
    resetResendCaptcha();
    if (!ok) return;
  };

  const onReset = async (data: Reset) => {
    try {
      await cabinetAxios.post("/auth/reset-password", data);
      sessionStorage.setItem(
        "cabinet_password_changed",
        "Пароль успешно изменён. Войдите с новым паролем.",
      );
      window.location.href = "/cabinet/login";
    } catch (e: unknown) {
      toast.error(apiErrorMessage(e, "Ошибка сброса"));
    }
  };

  const canRequestCode = cooldownSec <= 0 && !sendingCode;

  return (
    <AuthShell
      title="Восстановление пароля"
      subtitle={
        step === 1
          ? "Укажите телефон — отправим код для сброса"
          : "Код из SMS и новый пароль"
      }
      footer={
        <p className="text-sm text-center">
          <Link href="/cabinet/login" className={cabinetLink}>
            ← Вернуться ко входу
          </Link>
        </p>
      }
    >
      <CabinetStepper steps={STEPS} current={step} />

      {step === 1 ? (
        <form onSubmit={forgot.handleSubmit(onForgot)} className="space-y-5">
          <CabinetField
            label="Телефон"
            id="forgot-phone"
            icon={Phone}
            error={forgot.formState.errors.phone?.message}
          >
            <PhoneRuInput
              id="forgot-phone"
              autoComplete="tel"
              className={cabinetInputWithIcon}
              {...forgot.register("phone")}
            />
          </CabinetField>

          <div className="space-y-2">
            {SMARTCAPTCHA_SITE_KEY ? (
              <YandexSmartCaptcha
                sitekey={SMARTCAPTCHA_SITE_KEY}
                resetRef={captchaResetRef}
                onSuccess={(token) => {
                  forgot.setValue("captchaToken", token, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                onExpire={resetStep1Captcha}
                onError={() => {
                  resetStep1Captcha();
                  toast.error("Ошибка капчи. Обновите страницу.");
                }}
              />
            ) : (
              <p className="text-xs text-amber-400/90">
                Капча не настроена: задайте NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY
              </p>
            )}
            {forgot.formState.errors.captchaToken?.message ? (
              <p className="text-xs text-red-400">
                {forgot.formState.errors.captchaToken.message}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className={cabinetBtnPrimary}
            disabled={
              !canRequestCode || !SMARTCAPTCHA_SITE_KEY || !captchaToken
            }
          >
            {sendingCode ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Отправка…
              </>
            ) : cooldownSec > 0 ? (
              `Повтор через ${formatCooldown(cooldownSec)}`
            ) : (
              "Получить код"
            )}
          </button>
          {cooldownSec > 0 && (
            <p className={`${cabinetMuted} text-center text-xs`}>
              Новый код можно запросить не чаще одного раза в 3 минуты
            </p>
          )}
        </form>
      ) : (
        <form onSubmit={reset.handleSubmit(onReset)} className="space-y-5">
          <input type="hidden" {...reset.register("phone")} />
          <CabinetField label="Код из SMS" id="reset-code" icon={MessageSquare}>
            <Input
              id="reset-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              className={cabinetInputWithIcon}
              {...reset.register("code")}
            />
          </CabinetField>
          <CabinetField
            label="Новый пароль"
            id="reset-password"
            icon={Lock}
            hint="Не менее 8 символов"
          >
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              className={cabinetInputWithIcon}
              {...reset.register("password")}
            />
          </CabinetField>
          <CabinetField
            label="Повтор пароля"
            id="reset-password-confirm"
            icon={KeyRound}
            error={reset.formState.errors.passwordConfirm?.message}
          >
            <Input
              id="reset-password-confirm"
              type="password"
              className={cabinetInputWithIcon}
              {...reset.register("passwordConfirm")}
            />
          </CabinetField>
          <button
            type="submit"
            className={cabinetBtnPrimary}
            disabled={reset.formState.isSubmitting}
          >
            {reset.formState.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Сохранение…
              </>
            ) : (
              "Сохранить пароль"
            )}
          </button>

          {canRequestCode && (
            <div className="space-y-2">
              {SMARTCAPTCHA_SITE_KEY ? (
                <YandexSmartCaptcha
                  sitekey={SMARTCAPTCHA_SITE_KEY}
                  resetRef={resendCaptchaResetRef}
                  onSuccess={setResendCaptchaToken}
                  onExpire={resetResendCaptcha}
                  onError={() => {
                    resetResendCaptcha();
                    toast.error("Ошибка капчи. Обновите страницу.");
                  }}
                />
              ) : null}
              <button
                type="button"
                className={cabinetBtnSecondary}
                disabled={
                  !canRequestCode ||
                  !SMARTCAPTCHA_SITE_KEY ||
                  !resendCaptchaToken
                }
                onClick={() => void onResend()}
              >
                {sendingCode ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Отправка…
                  </>
                ) : (
                  "Отправить код снова"
                )}
              </button>
            </div>
          )}
          {cooldownSec > 0 && (
            <button type="button" className={cabinetBtnSecondary} disabled>
              Отправить код снова через {formatCooldown(cooldownSec)}
            </button>
          )}
          <button
            type="button"
            className={cabinetBtnSecondary}
            onClick={() => {
              setStep(1);
              resetStep1Captcha();
              resetResendCaptcha();
            }}
          >
            Назад
          </button>
        </form>
      )}
    </AuthShell>
  );
}
