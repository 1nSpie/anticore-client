const LAST_SUBMISSION_KEY = "last_form_submission_timestamp";
const DUPLICATE_WARNING_TIME = 5 * 60 * 1000; // 5 минут в миллисекундах

/**
 * Проверяет, была ли отправлена заявка в последние 5 минут
 */
export function checkDuplicateSubmission(): boolean {
  try {
    // На сервере localStorage недоступен
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }

    const lastTimestampStr = localStorage.getItem(LAST_SUBMISSION_KEY);
    if (!lastTimestampStr) {
      return false;
    }

    const lastTimestamp = parseInt(lastTimestampStr, 10);
    if (isNaN(lastTimestamp)) {
      return false;
    }

    const now = Date.now();
    const timeDiff = now - lastTimestamp;

    // Проверяем, что прошло меньше 10 минут
    return timeDiff < DUPLICATE_WARNING_TIME;
  } catch (error) {
    console.error("Error checking duplicate submission:", error);
    return false;
  }
}

/**
 * Сохраняет время последней отправки заявки
 */
export function saveSubmission(): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    localStorage.setItem(LAST_SUBMISSION_KEY, Date.now().toString());
  } catch (error) {
    console.error("Error saving submission:", error);
  }
}

/**
 * Получает время последней отправки в минутах
 */
export function getLastSubmissionTime(): number | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }

    const lastTimestampStr = localStorage.getItem(LAST_SUBMISSION_KEY);
    if (!lastTimestampStr) {
      return null;
    }

    const lastTimestamp = parseInt(lastTimestampStr, 10);
    if (isNaN(lastTimestamp)) {
      return null;
    }

    const now = Date.now();
    const timeDiff = now - lastTimestamp;
    const minutesAgo = Math.floor(timeDiff / (60 * 1000));

    return minutesAgo;
  } catch (error) {
    console.error("Error getting last submission time:", error);
    return null;
  }
}

