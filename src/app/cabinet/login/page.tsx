"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/shadcn/input";
import { PhoneRuInput } from "@/components/PhoneRuInput";
import { Loader2, Phone, Lock } from "lucide-react";
import { cabinetAxios, setCabinetAccessToken } from "../_lib/api";
import { loginSchema } from "../_lib/schemas";
import type { z } from "zod";
import {
  cabinetInputWithIcon,
  cabinetBtnPrimary,
  cabinetLink,
} from "../_lib/cabinetUi";
import { AuthShell } from "../_components/AuthShell";
import { CabinetField } from "../_components/CabinetField";
import { PHONE_RU_INPUT_PREFIX } from "@/lib/phoneRu";

type Form = z.infer<typeof loginSchema>;

export default function CabinetLoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: PHONE_RU_INPUT_PREFIX, password: "" },
  });

  useEffect(() => {
    const msg = sessionStorage.getItem("cabinet_password_changed");
    if (!msg) return;
    sessionStorage.removeItem("cabinet_password_changed");
    toast.success(msg);
  }, []);

  const onSubmit = async (data: Form) => {
    try {
      const { data: res } = await cabinetAxios.post<{
        accessToken: string;
      }>("/auth/login", data);
      setCabinetAccessToken(res.accessToken);
      toast.success("Добро пожаловать!");
      router.replace("/cabinet/profile");
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Ошибка входа";
      toast.error(typeof msg === "string" ? msg : "Ошибка входа");
    }
  };

  return (
    <AuthShell
      title="Вход"
      subtitle="Введите телефон и пароль от личного кабинета"
      footer={
        <div className="text-sm text-slate-400 space-y-3 text-center">
          <p>
            Нет аккаунта?{" "}
            <Link href="/cabinet/register" className={cabinetLink}>
              Зарегистрироваться
            </Link>
          </p>
          <p>
            <Link href="/cabinet/forgot-password" className={cabinetLink}>
              Забыли пароль?
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <CabinetField
          label="Телефон"
          id="login-phone"
          icon={Phone}
          error={errors.phone?.message}
        >
          <PhoneRuInput
            id="login-phone"
            autoComplete="tel"
            className={cabinetInputWithIcon}
            {...register("phone")}
          />
        </CabinetField>

        <CabinetField
          label="Пароль"
          id="login-password"
          icon={Lock}
          error={errors.password?.message}
        >
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className={cabinetInputWithIcon}
            {...register("password")}
          />
        </CabinetField>

        <button type="submit" className={cabinetBtnPrimary} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Вход…
            </>
          ) : (
            "Войти в кабинет"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
