"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { Checkbox } from "@/shadcn/checkbox";
import { Autocomplete } from "@/shadcn/autocomplete";
import { cabinetAxios } from "../../_lib/api";
import { cabinetProfileFormSchema } from "../../_lib/schemas";
import type { z } from "zod";
import { getAllBrand, getAllCarWithBrand } from "@/app/glav/api";
import type { Brand, Car as CatalogCar } from "@/app/glav/type";
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
  cabinetDivider,
  cabinetWarning,
  cabinetAutocompleteInput,
  cabinetAutocompleteDropdown,
  cabinetDatePickerTrigger,
  cabinetSkeleton,
  cabinetH2,
} from "../../_lib/cabinetUi";
import { User, Car as CarIcon } from "lucide-react";

type ProfileForm = z.infer<typeof cabinetProfileFormSchema>;

type ProfileCar = {
  id: number;
  model: string;
  brand: { id: number; name: string } | null;
};

type Profile = {
  id: number;
  phone: string;
  firstName?: string | null;
  lastName?: string | null;
  patronymic?: string | null;
  birthDate?: string | null;
  customCar?: string | null;
  car?: ProfileCar | null;
  canChangeBirthDate?: boolean;
  nextBirthDateChangeAt?: string | null;
};

const autoCompleteInputClass = cabinetAutocompleteInput;
const autoCompleteDropdownClass = cabinetAutocompleteDropdown;

export default function CabinetProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [cars, setCars] = useState<CatalogCar[]>([]);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(cabinetProfileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      patronymic: "",
      birthDate: "",
      brand: "",
      model: "",
      customCar: "",
      isNotAuto: false,
    },
  });

  const { watch, setValue, control, handleSubmit, register, formState } = form;
  const brandName = watch("brand");
  const isNotAuto = watch("isNotAuto");

  useEffect(() => {
    getAllBrand().then(setBrands).catch(() => toast.error("Не удалось загрузить марки"));
  }, []);

  useEffect(() => {
    if (!brandName || isNotAuto) {
      setCars([]);
      return;
    }
    const b = brands.find((x) => x.name === brandName);
    if (b?.id) {
      getAllCarWithBrand(b.id).then(setCars).catch(() => setCars([]));
    }
  }, [brandName, brands, isNotAuto]);

  const loadProfile = async () => {
    try {
      const { data } = await cabinetAxios.get<Profile>("/user/profile");
      setProfile(data);
      form.reset({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        patronymic: data.patronymic ?? "",
        birthDate: data.birthDate ? String(data.birthDate).slice(0, 10) : "",
        brand: data.car?.brand?.name ?? "",
        model: data.car?.model ?? "",
        customCar: data.customCar ?? "",
        isNotAuto: Boolean(data.customCar),
      });
      if (data.car?.brand?.id) {
        getAllCarWithBrand(data.car.brand.id).then(setCars).catch(() => undefined);
      }
    } catch {
      toast.error("Не удалось загрузить профиль");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const onSave = handleSubmit(async (v) => {
    let carId: number | null = null;
    let customCar: string | null = null;

    if (v.isNotAuto) {
      const text = v.customCar?.trim();
      if (!text) {
        toast.error("Укажите марку и модель вашего автомобиля");
        return;
      }
      customCar = text;
    } else {
      if (!v.brand || !v.model) {
        toast.error("Выберите марку и модель из списка или отметьте «нет в списке»");
        return;
      }
      const found = cars.find((c) => c.model === v.model);
      if (!found) {
        toast.error("Выберите модель из выпадающего списка");
        return;
      }
      carId = found.id;
    }

    try {
      const { data } = await cabinetAxios.put<Profile>("/user/profile", {
        firstName: v.firstName || undefined,
        lastName: v.lastName || undefined,
        patronymic: v.patronymic || undefined,
        birthDate: v.birthDate || undefined,
        carId: v.isNotAuto ? null : carId,
        customCar: v.isNotAuto ? customCar : null,
      });
      setProfile(data);
      form.reset({
        ...form.getValues(),
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        patronymic: data.patronymic ?? "",
        birthDate: data.birthDate ? String(data.birthDate).slice(0, 10) : "",
        brand: data.car?.brand?.name ?? "",
        model: data.car?.model ?? "",
        customCar: data.customCar ?? "",
        isNotAuto: Boolean(data.customCar),
      });
      if (data.car?.brand?.id) {
        getAllCarWithBrand(data.car.brand.id).then(setCars).catch(() => undefined);
      }
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
        <div className="flex items-center gap-3 mb-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20">
            <User className="h-5 w-5 text-teal-400" />
          </span>
          <div>
            <h2 className={cabinetH2}>Личные данные</h2>
            <p className={cabinetMuted}>Телефон: {profile.phone}</p>
          </div>
        </div>

        <form onSubmit={onSave} className="space-y-5 max-w-lg">
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
            {profile.canChangeBirthDate === false && profile.nextBirthDateChangeAt && (
              <p className={cabinetWarning}>
                Дату рождения можно менять не чаще одного раза в сутки. Следующая
                смена доступна{" "}
                {new Date(profile.nextBirthDateChangeAt).toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .
              </p>
            )}
          </div>

          <div className={`pt-4 mt-2 border-t ${cabinetDivider}`}>
            <div className="flex items-center gap-2 mb-4">
              <CarIcon className="h-4 w-4 text-teal-400" />
              <p className="text-slate-200 font-medium">Автомобиль</p>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Controller
                name="isNotAuto"
                control={control}
                render={({ field }) => (
                  <>
                    <Checkbox
                      id="notAuto"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        const on = checked === true;
                        field.onChange(on);
                        if (on) {
                          setValue("brand", "");
                          setValue("model", "");
                        } else {
                          setValue("customCar", "");
                        }
                      }}
                      className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-500 border-white/25"
                    />
                    <label
                      htmlFor="notAuto"
                      className={`text-sm ${cabinetLabel} cursor-pointer`}
                    >
                      Моего автомобиля нет в списке
                    </label>
                  </>
                )}
              />
            </div>

            {isNotAuto ? (
              <div className="space-y-2">
                <Label htmlFor="customCar" className={cabinetLabel}>
                  Ваш автомобиль
                </Label>
                <Input
                  id="customCar"
                  className={cabinetInput}
                  placeholder="Например: Toyota Camry 2020"
                  {...register("customCar")}
                />
                <p className={`text-xs ${cabinetMuted}`}>
                  Укажите марку и модель — мы добавим авто в каталог позже
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                <div>
                  <Label className={`${cabinetLabel} mb-2 block`}>Марка</Label>
                  <Controller
                    name="brand"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                      className={autoCompleteInputClass}
                        options={brands.map((b) => ({ value: b.name, label: b.name }))}
                        value={field.value ?? ""}
                        onChange={(v) => {
                          field.onChange(v);
                          setValue("model", "");
                        }}
                        placeholder="Введите марку для поиска"
                        emptyMessage="Марка не найдена"
                        inputClassName={autoCompleteInputClass}
                        dropdownClassName={autoCompleteDropdownClass}
                      />
                    )}
                  />
                </div>
                {brandName && (
                  <div>
                    <Label className={`${cabinetLabel} mb-2 block`}>Модель</Label>
                    <Controller
                      name="model"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          options={cars.map((c) => ({
                            value: c.model,
                            label: c.model,
                          }))}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="Введите модель для поиска"
                          emptyMessage="Модель не найдена"
                          inputClassName={autoCompleteInputClass}
                        dropdownClassName={autoCompleteDropdownClass}
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <button type="submit" className={cabinetBtnPrimary} disabled={formState.isSubmitting}>
            Сохранить профиль
          </button>
        </form>
      </section>
    </div>
  );
}
