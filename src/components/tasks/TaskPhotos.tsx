"use client";

import { useRef, useState } from "react";
import { AxiosError } from "axios";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { shrinkImage } from "@/lib/resizeImage";
import { cn } from "@/lib/utils";

export interface TaskPhotoItem {
  id: number;
  /** Подписанная ссылка на 10 минут; null — приватное хранилище не настроено. */
  url: string | null;
  by: "ADMIN" | "MASTER";
  createdAt: string;
}

type Props = {
  photos: TaskPhotoItem[];
  canAdd: boolean;
  canDelete: (p: TaskPhotoItem) => boolean;
  upload: (file: File) => Promise<unknown>;
  remove: (photoId: number) => Promise<unknown>;
  onChanged: () => void;
  /** Крупные кнопки для телефона (кабинет мастера). */
  touch?: boolean;
};

const MAX_FILES_AT_ONCE = 6;

/** Фото задачи: превью, добавление (камера или галерея, можно несколько) и удаление. Общий для админки и кабинета мастера. */
export function TaskPhotos({ photos, canAdd, canDelete, upload, remove, onChanged, touch }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  if (!photos.length && !canAdd) return null;

  const onPick = async (files: FileList | null) => {
    const list = [...(files ?? [])].slice(0, MAX_FILES_AT_ONCE);
    if (input.current) input.current.value = "";
    if (!list.length) return;
    setProgress({ done: 0, total: list.length });
    let ok = 0;
    for (const original of list) {
      try {
        await upload(await shrinkImage(original));
        ok++;
      } catch (e) {
        const m = e instanceof AxiosError ? e.response?.data?.message : undefined;
        toast.error(typeof m === "string" ? m : "Не удалось загрузить фото");
        // дальше не идём: чаще всего причина общая (лимит, нет сети, закрытая задача)
        break;
      } finally {
        setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
      }
    }
    setProgress(null);
    if (ok) onChanged();
  };

  const onRemove = async (p: TaskPhotoItem) => {
    if (!window.confirm("Удалить это фото?")) return;
    try {
      await remove(p.id);
      onChanged();
    } catch (e) {
      const m = e instanceof AxiosError ? e.response?.data?.message : undefined;
      toast.error(typeof m === "string" ? m : "Не удалось удалить фото");
    }
  };

  return (
    <div className="space-y-2">
      {photos.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <li key={p.id} className="relative aspect-square overflow-hidden rounded-xl bg-slate-800">
              {p.url ? (
                <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label="Открыть фото">
                  {/* eslint-disable-next-line @next/next/no-img-element -- подписанная внешняя ссылка, оптимизатор Next ей не нужен */}
                  <img src={p.url} alt="Фото к задаче" loading="lazy" className="h-full w-full object-cover" />
                </a>
              ) : (
                <div className="flex h-full items-center justify-center p-2 text-center text-[11px] text-slate-500">Хранилище не настроено</div>
              )}
              <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-slate-200">
                {p.by === "ADMIN" ? "Админ" : "Мастер"}
              </span>
              {canDelete(p) && (
                <button type="button" onClick={() => onRemove(p)} aria-label="Удалить фото"
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canAdd && (
        <>
          <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => void onPick(e.target.files)} />
          <button type="button" disabled={!!progress} onClick={() => input.current?.click()}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 text-sm text-slate-300 transition-colors hover:bg-white/5 disabled:opacity-60",
              touch ? "min-h-12" : "min-h-9",
            )}>
            {progress ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Загрузка {Math.min(progress.done + 1, progress.total)} из {progress.total}…
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Добавить фото
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}
