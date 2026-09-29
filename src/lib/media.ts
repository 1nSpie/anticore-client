/**
 * Медиа сайта хранится в Selectel S3 (`NEXT_PUBLIC_S3_URL`), не в `public/` и не на бэке.
 *
 * Структура бакета:
 *   image/blog/*, image/works/*  — контент из БД (в БД ключ без префикса: `blog/blog2.jpg`, `works/honda-1.jpg`)
 *   image/site/*                 — картинки вёрстки (карусель, этапы работ, фоны, классы авто)
 *   image/process/*              — страница /process
 *   video/*                      — видео
 *
 * Загрузка файлов в бакет: `scripts/upload-media.sh` из корня проекта.
 */
const S3_BASE = (process.env.NEXT_PUBLIC_S3_URL ?? "").replace(/\/+$/, "");

/** Полный URL файла в бакете: `mediaUrl("video/videoStart.mp4")`. */
export function mediaUrl(path: string): string {
  return `${S3_BASE}/${path.replace(/^\/+/, "")}`;
}

/** Картинка контента по ключу из БД (`blog/blog2.jpg`, `works/honda-1.jpg`). */
export function contentImageUrl(key: string): string {
  return mediaUrl(`image/${key}`);
}

/** Картинка вёрстки сайта: `siteImageUrl("carousel/carousel2.png")`. */
export function siteImageUrl(path: string): string {
  return mediaUrl(`image/site/${path}`);
}
