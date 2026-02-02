'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Подавляем ошибки Server Actions при пересборке
    if (
      error.message?.includes('Failed to find Server Action') ||
      error.message?.includes('Server Action')
    ) {
      console.warn('Server Action mismatch (likely due to rebuild):', error.message);
      // Автоматически перезагружаем страницу через небольшую задержку
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return;
    }

    // Логируем другие ошибки
    console.error('Application error:', error);
  }, [error]);

  // Для ошибок Server Actions не показываем UI, просто перезагружаем
  if (
    error.message?.includes('Failed to find Server Action') ||
    error.message?.includes('Server Action')
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Обновление приложения...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Что-то пошло не так!</h2>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}



