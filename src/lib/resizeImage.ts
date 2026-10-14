const MAX_SIDE = 2000;
const SKIP_BELOW_BYTES = 1.2 * 1024 * 1024;

/**
 * Уменьшает фото перед отправкой: снимок с телефона весит 5–12 МБ, а на мобильной сети в цеху это минуты ожидания.
 * Сервер всё равно перекодирует фото и режет до 2400 px, так что 2000 px / JPEG 85% ничего не портят.
 * При любой неудаче (старый браузер, HEIC и т.п.) отдаём исходный файл — сервер сам решит, принять его или нет.
 */
export async function shrinkImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || (file.size < SKIP_BELOW_BYTES && file.type === "image/jpeg")) return file;
  try {
    // from-image: учитываем EXIF-поворот, иначе вертикальные снимки ложатся набок
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}
