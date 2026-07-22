"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { adminApi } from "../../_lib/api";
import type { ServiceType } from "../../_lib/crmTypes";
import { Button } from "@/shadcn/button";
import { Label } from "@/shadcn/label";
import { Textarea } from "@/shadcn/textarea";
import { Input } from "@/shadcn/input";
import { toast } from "sonner";

type TemplateKey = "appointment" | "review" | "birthday";

const TEMPLATE_FIELDS: { key: TemplateKey; label: string }[] = [
  { key: "appointment", label: "Запись создана" },
  { key: "review", label: "Запрос отзыва" },
  { key: "birthday", label: "День рождения" },
];

const PLACEHOLDERS = [
  { token: "{NAME}", label: "Имя клиента", hint: "ФИО из карточки" },
  { token: "{DATE}", label: "Дата", hint: "Дата визита" },
  { token: "{TIME}", label: "Время", hint: "Время начала" },
  { token: "{SERVICE}", label: "Услуга", hint: "Название услуги" },
  { token: "{PRICE}", label: "Цена", hint: "Стоимость в рублях" },
  { token: "{COMPANY}", label: "Компания", hint: "Название из поля ниже" },
] as const;

export default function AdminSmsPage() {
  const [companyName, setCompanyName] = useState("АванКор");
  const [templates, setTemplates] = useState({
    appointment: "",
    review: "",
    birthday: "",
  });
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [broadcast, setBroadcast] = useState("");
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>("appointment");
  const textareaRefs = useRef<Partial<Record<TemplateKey, HTMLTextAreaElement | null>>>({});

  useEffect(() => {
    void Promise.all([
      adminApi.get<{
        companyName: string;
        templates: { appointment: string; review: string; birthday: string };
      }>("/crm/settings/sms-templates"),
      adminApi.get<ServiceType[]>("/crm/settings/service-types"),
    ]).then(([smsRes, typesRes]) => {
      setCompanyName(smsRes.data.companyName || "АванКор");
      setTemplates(smsRes.data.templates);
      setServiceTypes(typesRes.data);
    });
  }, []);

  const insertPlaceholder = (token: string) => {
    const key = activeTemplate;
    const el = textareaRefs.current[key];
    const current = templates[key];

    if (!el) {
      setTemplates((t) => ({ ...t, [key]: t[key] + token }));
      return;
    }

    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const next = current.slice(0, start) + token + current.slice(end);
    setTemplates((t) => ({ ...t, [key]: next }));

    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const saveTemplates = async () => {
    await adminApi.put("/crm/settings/sms-templates", {
      ...templates,
      companyName,
    });
    toast.success("Шаблоны SMS сохранены");
  };

  const saveServiceTypes = async () => {
    const { data } = await adminApi.put<ServiceType[]>(
      "/crm/settings/service-types",
      { items: serviceTypes },
    );
    setServiceTypes(data);
    toast.success("Справочник услуг сохранён");
  };

  const removeServiceType = async (index: number) => {
    const item = serviceTypes[index];
    if (item.id > 0) {
      if (!window.confirm(`Удалить услугу «${item.name}»?`)) return;
      try {
        await adminApi.delete(`/crm/settings/service-types/${item.id}`);
        setServiceTypes((s) => s.filter((_, i) => i !== index));
        toast.success("Услуга удалена");
      } catch {
        toast.error("Не удалось удалить услугу");
      }
      return;
    }
    setServiceTypes((s) => s.filter((_, i) => i !== index));
  };

  const sendBroadcast = async () => {
    const { data } = await adminApi.post<{ sent: number; failed: number }>(
      "/crm/clients/broadcast",
      { message: broadcast },
    );
    toast.success(`Отправлено: ${data.sent}, ошибок: ${data.failed}`);
  };

  const fieldClass = "border-white/20 bg-slate-800 text-white";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-xl border border-white/10 bg-slate-900/40 p-5">
        <h2 className="text-lg font-semibold text-white">Шаблоны SMS</h2>

        <div className="space-y-2">
          <Label className="text-slate-200">Название компании ({`{COMPANY}`})</Label>
          <Input
            className={fieldClass}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="АванКор"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">Подстановки в текст</Label>
          <p className="text-xs text-slate-500">
            Кликните, чтобы вставить в активный шаблон (последнее поле, в котором был курсор)
          </p>
          <div className="flex flex-wrap gap-2">
            {PLACEHOLDERS.map(({ token, label, hint }) => (
              <button
                key={token}
                type="button"
                title={hint}
                onClick={() => insertPlaceholder(token)}
                className="rounded-lg border border-white/15 bg-slate-800 px-2.5 py-1.5 text-xs text-emerald-300 transition-colors hover:bg-slate-700"
              >
                <span className="font-mono">{token}</span>
                <span className="ml-1.5 text-slate-400">— {label}</span>
              </button>
            ))}
          </div>
        </div>

        {TEMPLATE_FIELDS.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label className="text-slate-200">{label}</Label>
            <Textarea
              ref={(el) => {
                textareaRefs.current[key] = el;
              }}
              rows={3}
              className={fieldClass}
              value={templates[key]}
              onFocus={() => setActiveTemplate(key)}
              onChange={(e) =>
                setTemplates((t) => ({ ...t, [key]: e.target.value }))
              }
            />
          </div>
        ))}
        <Button onClick={() => void saveTemplates()}>Сохранить шаблоны</Button>
      </section>

      <section className="space-y-4 rounded-xl border border-white/10 bg-slate-900/40 p-5">
        <h2 className="text-lg font-semibold text-white">Справочник услуг</h2>
        {serviceTypes.length === 0 ? (
          <p className="text-sm text-slate-500">Список пуст</p>
        ) : (
          serviceTypes.map((t, i) => (
            <div key={t.id || `new-${i}`} className="flex gap-2">
              <Input
                className={fieldClass}
                value={t.name}
                onChange={(e) => {
                  const next = [...serviceTypes];
                  next[i] = { ...t, name: e.target.value };
                  setServiceTypes(next);
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="shrink-0"
                onClick={() => void removeServiceType(i)}
                aria-label={`Удалить ${t.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
        <Button
          variant="outline"
          className="border-white/20"
          onClick={() =>
            setServiceTypes((s) => [
              ...s,
              { id: 0, name: "Новая услуга", sortOrder: s.length, active: true },
            ])
          }
        >
          Добавить услугу
        </Button>
        <Button onClick={() => void saveServiceTypes()}>Сохранить услуги</Button>
      </section>

      <section className="space-y-4 rounded-xl border border-white/10 bg-slate-900/40 p-5 lg:col-span-2">
        <h2 className="text-lg font-semibold text-white">Массовая SMS-рассылка</h2>
        <Textarea
          rows={4}
          className={fieldClass}
          value={broadcast}
          onChange={(e) => setBroadcast(e.target.value)}
          placeholder="Текст для всех клиентов CRM"
        />
        <Button onClick={() => void sendBroadcast()}>Отправить всем</Button>
      </section>
    </div>
  );
}
