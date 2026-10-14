/**
 * Дневной лимит записей по филиалу — мягкий: администратор может записать и сверх лимита.
 * Сервер отвечает 400 с code `DAY_LIMIT_REACHED`; мы спрашиваем подтверждение и повторяем запрос
 * с `ignoreDayLimit: true`.
 */
export const DAY_LIMIT_CODE = "DAY_LIMIT_REACHED";

type ApiError = {
  response?: {
    data?: { code?: string; message?: string | string[] };
  };
};

/** Текст ошибки, если это «лимит дня достигнут», иначе null. */
export function dayLimitMessage(error: unknown): string | null {
  const data = (error as ApiError)?.response?.data;
  if (data?.code !== DAY_LIMIT_CODE) return null;
  const msg = Array.isArray(data.message) ? data.message.join(", ") : data.message;
  return msg || "Лимит записей на день исчерпан";
}

/**
 * Выполняет запрос. Если сервер ответил «лимит дня», спрашивает подтверждение
 * и повторяет запрос с ignoreDayLimit = true. Возвращает null, если админ отказался.
 * Остальные ошибки пробрасываются как обычно.
 */
export async function withDayLimitOverride<T>(
  run: (ignoreDayLimit: boolean) => Promise<T>,
): Promise<T | null> {
  try {
    return await run(false);
  } catch (error) {
    const message = dayLimitMessage(error);
    if (message === null) throw error;
    const confirmed = window.confirm(
      `${message.replace(/\.$/, "")}.\n\nВсё равно записать сверх лимита?`,
    );
    if (!confirmed) return null;
    return run(true);
  }
}

/** Добавляет флаг подтверждения в тело запроса, только когда он нужен. */
export function withIgnoreFlag<B extends object>(body: B, ignoreDayLimit: boolean) {
  return ignoreDayLimit ? { ...body, ignoreDayLimit: true } : body;
}
