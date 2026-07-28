"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Label } from "@/shadcn/label";
import { Switch } from "@/shadcn/switch";
import { cabinetAxios } from "../../_lib/api";
import { notificationsSchema } from "../../_lib/schemas";
import type { z } from "zod";
import { Bell } from "lucide-react";
import { cabinetCard, cabinetMuted, cabinetBtnPrimary, cabinetH2, cabinetLabel } from "../../_lib/cabinetUi";

type Form = z.infer<typeof notificationsSchema>;

export default function CabinetNotificationsPage() {
  const form = useForm<Form>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      smsEnabled: true,
      notifyReminder: true,
    },
  });

  useEffect(() => {
    void (async () => {
      try {
        const { data } = await cabinetAxios.get<Form>("/user/notifications");
        form.reset(data);
      } catch {
        toast.error("Не удалось загрузить настройки");
      }
    })();
  }, [form]);

  const onSubmit = async (v: Form) => {
    try {
      const { data } = await cabinetAxios.put<Form>("/user/notifications", v);
      form.reset(data);
      toast.success("Сохранено");
    } catch {
      toast.error("Ошибка сохранения");
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={`${cabinetCard} max-w-lg space-y-6`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20">
          <Bell className="h-5 w-5 text-teal-400" />
        </span>
        <div>
          <h2 className={cabinetH2}>Уведомления</h2>
          <p className={`${cabinetMuted} mt-0.5`}>SMS и сервисные напоминания</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label className={cabinetLabel}>SMS-уведомления</Label>
          <p className={`text-xs ${cabinetMuted} mt-1`}>Общий переключатель</p>
        </div>
        <Controller
          name="smsEnabled"
          control={form.control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              className="data-[state=checked]:bg-[#007478]"
            />
          )}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label className={cabinetLabel}>Напоминания</Label>
          <p className={`text-xs ${cabinetMuted} mt-1`}>Сервисные напоминания</p>
        </div>
        <Controller
          name="notifyReminder"
          control={form.control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              className="data-[state=checked]:bg-[#007478]"
            />
          )}
        />
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting || !form.formState.isDirty}
        className={cabinetBtnPrimary}
      >
        Сохранить
      </button>
    </form>
  );
}
