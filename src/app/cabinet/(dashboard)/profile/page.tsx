"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { cabinetAxios } from "../../_lib/api";
import { z } from "zod";
import {
  DatePicker,
  BIRTH_DATE_FROM,
  BIRTH_DATE_TO,
} from "@/components/DatePicker";
import {
  cabinetCard,
  cabinetMuted,
  cabinetInput,
  cabinetBtnPrimary,
  cabinetLabel,
  cabinetWarning,
  cabinetDatePickerTrigger,
  cabinetSkeleton,
  cabinetH2,
} from "../../_lib/cabinetUi";
import { User } from "lucide-react";
import {
  CabinetVehiclesSection,
  type CabinetVehicle,
} from "./CabinetVehiclesSection";

const personalSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  patronymic: z.string().optional(),
  birthDate: z.string().optional(),
});

type PersonalForm = z.infer<typeof personalSchema>;

type Profile = {
  id: number;
  phone: string;
  firstName?: string | null;
  lastName?: string | null;
  patronymic?: string | null;
  birthDate?: string | null;
  vehicles?: CabinetVehicle[];
  canChangeBirthDate?: boolean;
  nextBirthDateChangeAt?: string | null;
};

export default function CabinetProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<PersonalForm>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      patronymic: "",
      birthDate: "",
    },
  });

  const { control, handleSubmit, register, formState, reset } = form;

  const loadProfile = useCallback(async () => {
    try {
      const { data } = await cabinetAxios.get<Profile>("/user/profile");
      setProfile(data);
      reset({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        patronymic: data.patronymic ?? "",
        birthDate: data.birthDate ? String(data.birthDate).slice(0, 10) : "",
      });
    } catch {
      toast.error("Не удалось загрузить профиль");
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const onSave = handleSubmit(async (v) => {
    try {
      const { data } = await cabinetAxios.put<Profile>("/user/profile", {
        firstName: v.firstName || undefined,
        lastName: v.lastName || undefined,
        patronymic: v.patronymic || undefined,
        birthDate: v.birthDate || undefined,
      });
      setProfile(data);
      reset({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        patronymic: data.patronymic ?? "",
        birthDate: data.birthDate ? String(data.birthDate).slice(0, 10) : "",
      });
      toast.success("Профиль сохранён");
    } catch (e) {
      const msg =
        axios.isAxiosError(e) && e.response?.data?.message
          ? Array.isArray(e.response.data.message)
            ? e.response.data.message[0]
            : String(e.response.data.message)
          : "Ошибка сохранения";
      toast.error(msg);
    }
  });

  if (loading || !profile) {
    return (
      <div className={`animate-pulse ${cabinetCard}`}>
        <div className={`h-36 ${cabinetSkeleton} rounded-xl`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className={cabinetCard}>
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10">
            <User className="h-5 w-5 text-teal-400" />
          </span>
          <div>
            <h2 className={cabinetH2}>Личные данные</h2>
            <p className={cabinetMuted}>Телефон: {profile.phone}</p>
          </div>
        </div>

        <form onSubmit={onSave} className="max-w-lg space-y-5">
          {(["firstName", "lastName", "patronymic"] as const).map((name) => (
            <div key={name} className="space-y-2">
              <Label className={cabinetLabel}>
                {name === "firstName"
                  ? "Имя"
                  : name === "lastName"
                    ? "Фамилия"
                    : "Отчество"}
              </Label>
              <Input className={cabinetInput} {...register(name)} />
            </div>
          ))}
          <div className="space-y-2">
            <Label className={cabinetLabel}>Дата рождения</Label>
            <Controller
              name="birthDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  theme="cabinet"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  fromDate={BIRTH_DATE_FROM}
                  toDate={BIRTH_DATE_TO}
                  disabled={profile.canChangeBirthDate === false}
                  triggerClassName={cabinetDatePickerTrigger}
                  placeholder="Дата рождения"
                />
              )}
            />
            {profile.canChangeBirthDate === false &&
              profile.nextBirthDateChangeAt && (
                <p className={cabinetWarning}>
                  Дату рождения можно менять не чаще одного раза в сутки.
                  Следующая смена доступна{" "}
                  {new Date(profile.nextBirthDateChangeAt).toLocaleString(
                    "ru-RU",
                    {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                  .
                </p>
              )}
          </div>

          <button
            type="submit"
            className={cabinetBtnPrimary}
            disabled={formState.isSubmitting}
          >
            Сохранить профиль
          </button>
        </form>
      </section>

      <CabinetVehiclesSection
        vehicles={profile.vehicles ?? []}
        onChange={loadProfile}
      />
    </div>
  );
}
