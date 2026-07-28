"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../../_lib/api";
import { API_BASE_URL } from "../../_lib/constants";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { Checkbox } from "@/shadcn/checkbox";
import { Switch } from "@/shadcn/switch";
import { Autocomplete } from "@/shadcn/autocomplete";
import { toast } from "sonner";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/dialog";
import { Loader2 } from "lucide-react";
import {
  DatePicker,
  BIRTH_DATE_FROM,
  BIRTH_DATE_TO,
} from "@/components/DatePicker";
import type { Brand, Car } from "@/app/glav/type";
import type {
  CabinetUserDetail,
  CabinetUserRow,
  CabinetVisit,
} from "../../_lib/cabinetTypes";

type Props = {
  user: CabinetUserRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

type EditForm = {
  firstName: string;
  lastName: string;
  patronymic: string;
  birthDate: string;
  brand: string;
  model: string;
  customCar: string;
  isNotAuto: boolean;
  blocked: boolean;
  smsEnabled: boolean;
  notifyReminder: boolean;
};

const emptyForm: EditForm = {
  firstName: "",
  lastName: "",
  patronymic: "",
  birthDate: "",
  brand: "",
  model: "",
  customCar: "",
  isNotAuto: false,
  blocked: false,
  smsEnabled: true,
  notifyReminder: true,
};

export default function CabinetUserDialog({
  user,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const [detail, setDetail] = useState<CabinetUserDetail | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [visits, setVisits] = useState<CabinetVisit[]>([]);
  const [visitForm, setVisitForm] = useState({
    visitDate: "",
    serviceType: "",
    diskLink: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [cars, setCars] = useState<Car[]>([]);

  const loadBrands = useCallback(async () => {
    try {
      const { data } = await axios.get<Brand[]>(`${API_BASE_URL}/cars/brands`);
      setBrands(data);
    } catch {
      setBrands([]);
    }
  }, []);

  useEffect(() => {
    void loadBrands();
  }, [loadBrands]);

  useEffect(() => {
    if (!form.brand || form.isNotAuto) {
      setCars([]);
      return;
    }
    const b = brands.find((x) => x.name === form.brand);
    if (b?.id) {
      axios
        .get<Car[]>(`${API_BASE_URL}/brands/${b.id}`)
        .then((r) => setCars(r.data))
        .catch(() => setCars([]));
    }
  }, [form.brand, form.isNotAuto, brands]);

  useEffect(() => {
    if (!open || !user) {
      setDetail(null);
      setForm(emptyForm);
      setVisits([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const [userRes, visitsRes] = await Promise.all([
          adminApi.get<CabinetUserDetail>(`/admin/users/${user.id}`),
          adminApi.get<CabinetVisit[]>(`/admin/users/${user.id}/visits`),
        ]);
        if (cancelled) return;
        const d = userRes.data;
        setDetail(d);
        setVisits(visitsRes.data);
        setForm({
          firstName: d.firstName ?? "",
          lastName: d.lastName ?? "",
          patronymic: d.patronymic ?? "",
          birthDate: d.birthDate ? String(d.birthDate).slice(0, 10) : "",
          brand: d.car?.brand?.name ?? "",
          model: d.car?.model ?? "",
          customCar: d.customCar ?? "",
          isNotAuto: Boolean(d.customCar),
          blocked: d.blocked,
          smsEnabled: d.notificationSettings?.smsEnabled ?? true,
          notifyReminder: d.notificationSettings?.notifyReminder ?? true,
        });
        if (d.car?.brand?.id) {
          axios
            .get<Car[]>(`${API_BASE_URL}/brands/${d.car.brand.id}`)
            .then((r) => setCars(r.data))
            .catch(() => undefined);
        }
      } catch {
        if (!cancelled) toast.error("Ошибка загрузки карточки клиента");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, user]);

  const patchField = <K extends keyof EditForm>(key: K, value: EditForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const saveProfile = async () => {
    if (!user) return;

    let carId: number | null = null;
    let customCar: string | null = null;

    if (form.isNotAuto) {
      const text = form.customCar.trim();
      if (!text) {
        toast.error("Укажите автомобиль или выберите из каталога");
        return;
      }
      customCar = text;
    } else if (form.brand && form.model) {
      const found = cars.find((c) => c.model === form.model);
      if (!found) {
        toast.error("Выберите модель из списка");
        return;
      }
      carId = found.id;
    }

    setSaving(true);
    try {
      const { data } = await adminApi.patch<CabinetUserDetail>(
        `/admin/users/${user.id}`,
        {
          firstName: form.firstName || undefined,
          lastName: form.lastName || undefined,
          patronymic: form.patronymic || undefined,
          birthDate: form.birthDate || undefined,
          carId: form.isNotAuto ? null : carId,
          customCar: form.isNotAuto ? customCar : null,
          blocked: form.blocked,
          smsEnabled: form.smsEnabled,
          notifyReminder: form.notifyReminder,
        },
      );
      setDetail(data);
      toast.success("Данные клиента сохранены");
      onSaved();
    } catch {
      toast.error("Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  const addVisit = async () => {
    if (!user) return;
    try {
      await adminApi.post(`/admin/users/${user.id}/visits`, {
        visitDate: visitForm.visitDate,
        serviceType: visitForm.serviceType,
        diskLink: visitForm.diskLink || undefined,
      });
      toast.success("Визит добавлен");
      setVisitForm({ visitDate: "", serviceType: "", diskLink: "" });
      const { data } = await adminApi.get<CabinetVisit[]>(
        `/admin/users/${user.id}/visits`,
      );
      setVisits(data);
    } catch {
      toast.error("Не удалось сохранить визит");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-white/10 text-slate-100">
        <DialogHeader>
          <DialogTitle>
            Клиент {user?.phone ?? ""}
            {detail && (
              <span className="block text-xs font-normal text-slate-400 mt-1">
                ID {detail.id} · регистрация{" "}
                {new Date(detail.createdAt).toLocaleDateString("ru-RU")}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          </div>
        ) : detail ? (
          <div className="space-y-6 text-sm">
            <Card className="bg-slate-950/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-base">Профиль</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Телефон</Label>
                  <Input
                    value={detail.phone}
                    readOnly
                    disabled
                    className="bg-slate-900/50 border-white/10 opacity-70"
                  />
                </div>

                {(
                  [
                    ["firstName", "Имя"],
                    ["lastName", "Фамилия"],
                    ["patronymic", "Отчество"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      value={form[key]}
                      onChange={(e) => patchField(key, e.target.value)}
                      className="bg-slate-900 border-white/10"
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <Label>Дата рождения</Label>
                  <DatePicker
                    theme="cabinet"
                    value={form.birthDate}
                    onChange={(birthDate) => patchField("birthDate", birthDate)}
                    fromDate={BIRTH_DATE_FROM}
                    toDate={BIRTH_DATE_TO}
                    placeholder="Выберите дату"
                    triggerClassName="bg-slate-900 border-white/10 text-slate-100 hover:bg-slate-800"
                    className="bg-slate-900 border-white/10 text-slate-100"
                  />
                </div>

                <div className="pt-2 border-t border-white/10 space-y-3">
                  <p className="font-medium">Автомобиль</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={form.isNotAuto}
                      onCheckedChange={(v) => {
                        const on = v === true;
                        patchField("isNotAuto", on);
                        if (on) {
                          patchField("brand", "");
                          patchField("model", "");
                        } else {
                          patchField("customCar", "");
                        }
                      }}
                      className="border-white/20 data-[state=checked]:bg-emerald-600"
                    />
                    <span>Нет в каталоге</span>
                  </label>

                  {form.isNotAuto ? (
                    <Input
                      placeholder="Марка и модель"
                      value={form.customCar}
                      onChange={(e) => patchField("customCar", e.target.value)}
                      className="bg-slate-900 border-white/10"
                    />
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="mb-2 block">Марка</Label>
                        <Autocomplete
                          options={brands.map((b) => ({
                            value: b.name,
                            label: b.name,
                          }))}
                          value={form.brand}
                          onChange={(v) => {
                            patchField("brand", v);
                            patchField("model", "");
                          }}
                          placeholder="Марка"
                          emptyMessage="Не найдено"
                          inputClassName="bg-slate-900 border-white/10 text-slate-100"
                        />
                      </div>
                      {form.brand && (
                        <div>
                          <Label className="mb-2 block">Модель</Label>
                          <Autocomplete
                            options={cars.map((c) => ({
                              value: c.model,
                              label: c.model,
                            }))}
                            value={form.model}
                            onChange={(v) => patchField("model", v)}
                            placeholder="Модель"
                            emptyMessage="Не найдено"
                            inputClassName="bg-slate-900 border-white/10 text-slate-100"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-white/10 space-y-3">
                  <p className="font-medium">Уведомления</p>
                  {(
                    [
                      ["smsEnabled", "SMS-уведомления"],
                      ["notifyReminder", "Напоминания"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label>{label}</Label>
                      <Switch
                        checked={form[key]}
                        onCheckedChange={(v) => patchField(key, v)}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <Label>Заблокирован</Label>
                  <Switch
                    checked={form.blocked}
                    onCheckedChange={(v) => patchField("blocked", v)}
                    className="data-[state=checked]:bg-red-600"
                  />
                </div>

                <Button
                  type="button"
                  onClick={() => void saveProfile()}
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Сохранить профиль
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-950/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-base">Новый визит</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <Label>Дата визита</Label>
                  <DatePicker
                    theme="cabinet"
                    value={visitForm.visitDate}
                    onChange={(visitDate) =>
                      setVisitForm((f) => ({ ...f, visitDate }))
                    }
                    placeholder="Выберите дату визита"
                    triggerClassName="bg-slate-900 border-white/10 text-slate-100 hover:bg-slate-800"
                    className="bg-slate-900 border-white/10 text-slate-100"
                  />
                </div>
                <Input
                  placeholder="Услуга (напр. Мойка дна)"
                  className="bg-slate-900 border-white/10"
                  value={visitForm.serviceType}
                  onChange={(e) =>
                    setVisitForm((f) => ({ ...f, serviceType: e.target.value }))
                  }
                />
                <Input
                  placeholder="Ссылка на диск"
                  className="bg-slate-900 border-white/10"
                  value={visitForm.diskLink}
                  onChange={(e) =>
                    setVisitForm((f) => ({ ...f, diskLink: e.target.value }))
                  }
                />
                <Button type="button" onClick={() => void addVisit()}>
                  Добавить визит
                </Button>
              </CardContent>
            </Card>

            <div>
              <p className="font-medium mb-2">История визитов</p>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {visits.length === 0 ? (
                  <li className="text-xs text-slate-500">Пока нет записей</li>
                ) : (
                  visits.map((v) => (
                    <li
                      key={v.id}
                      className="rounded border border-white/10 p-2 text-xs"
                    >
                      {v.visitDate.slice(0, 10)} — {v.serviceType}
                      {v.diskLink && (
                        <a
                          className="block text-emerald-400 truncate"
                          href={v.diskLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {v.diskLink}
                        </a>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
