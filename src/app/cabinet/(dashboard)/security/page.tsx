"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { cabinetAxios } from "../../_lib/api";
import { changePasswordSchema } from "../../_lib/schemas";
import type { z } from "zod";
import {
  cabinetCard,
  cabinetMuted,
  cabinetInput,
  cabinetBtnPrimary,
  cabinetH2,
  cabinetLabel,
  cabinetError,
} from "../../_lib/cabinetUi";
import { Shield } from "lucide-react";

type Form = z.infer<typeof changePasswordSchema>;

export default function CabinetSecurityPage() {
  const form = useForm<Form>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (v: Form) => {
    try {
      await cabinetAxios.post("/user/profile/change-password", {
        currentPassword: v.currentPassword,
        newPassword: v.newPassword,
        newPasswordConfirm: v.newPasswordConfirm,
      });
      form.reset();
      toast.success("Пароль успешно изменён");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      toast.error(typeof msg === "string" ? msg : "Ошибка");
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={`${cabinetCard} max-w-lg space-y-5`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20">
          <Shield className="h-5 w-5 text-teal-400" />
        </span>
        <div>
          <h2 className={cabinetH2}>Смена пароля</h2>
          <p className={`${cabinetMuted} mt-0.5`}>
            После смены другие устройства выйдут из аккаунта
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Label className={cabinetLabel}>Текущий пароль</Label>
        <Input
          type="password"
          autoComplete="current-password"
          className={cabinetInput}
          {...form.register("currentPassword")}
        />
        {form.formState.errors.currentPassword && (
          <p className={cabinetError}>
            {form.formState.errors.currentPassword.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label className={cabinetLabel}>Новый пароль</Label>
        <Input
          type="password"
          autoComplete="new-password"
          className={cabinetInput}
          {...form.register("newPassword")}
        />
      </div>
      <div className="space-y-2">
        <Label className={cabinetLabel}>Повтор нового пароля</Label>
        <Input
          type="password"
          className={cabinetInput}
          {...form.register("newPasswordConfirm")}
        />
      </div>
      {form.formState.errors.newPasswordConfirm && (
        <p className={cabinetError}>
          {form.formState.errors.newPasswordConfirm.message}
        </p>
      )}
      <button type="submit" className={cabinetBtnPrimary}>
        Обновить пароль
      </button>
    </form>
  );
}
