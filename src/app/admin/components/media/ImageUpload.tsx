"use client";

import { useId, useRef, useState } from "react";
import axios from "axios";
import { adminApi } from "../../_lib/api";
import { contentImageUrl } from "@/lib/media";
import { Button } from "@/shadcn/button";

export function apiError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 413) return "Файл слишком большой. Максимум — 10 МБ";
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(". ");
  }
  return fallback;
}

export default function ImageUpload({ label, folder, value, onChange, onBusyChange }: {
  label: string;
  folder: "blog" | "works";
  value: string;
  onChange: (value: string) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const id = useId();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file || inFlight.current) return;
    setError("");
    if (file.size > 10 * 1024 * 1024) { setError("Максимальный размер — 10 МБ"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Выберите JPEG, PNG или WebP"); return;
    }
    inFlight.current = true;
    setBusy(true); setProgress(0); onBusyChange(true);
    try {
      const data = new FormData(); data.append("file", file);
      const result = await adminApi.post<{ key: string }>(`/admin/media/${folder}`, data, {
        timeout: 120000,
        onUploadProgress: event => setProgress(Math.round((event.progress ?? 0) * 100)),
      });
      onChange(result.data.key);
    } catch (error) {
      setError(apiError(error, "Не удалось загрузить фото. Попробуйте ещё раз"));
    } finally {
      inFlight.current = false; setBusy(false); onBusyChange(false);
    }
  }

  return <div className="space-y-2 rounded-xl border border-white/10 p-3">
    <label htmlFor={id} className="block text-sm font-medium text-slate-200">{label}</label>
    {value && <img src={contentImageUrl(value)} alt={label} className="h-40 w-full rounded-lg object-contain bg-slate-950" />}
    <input id={id} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy}
      className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:text-slate-950"
      onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; void upload(file); }} />
    <p className="text-xs text-slate-400">JPEG, PNG или WebP, до 10 МБ. Фото появится на сайте после сохранения записи.</p>
    {busy && <p role="status" className="text-sm text-emerald-300">{progress < 100 ? `Загрузка: ${progress}%` : "Обработка и сохранение фото…"}</p>}
    {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
    {value && <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => onChange("")}>Убрать фото</Button>}
  </div>;
}
