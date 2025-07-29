'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Custom404() {
  const [mounted, setMounted] = useState(false)

  // Предотвращаем гидратацию UI (чтобы не было мерцания темы)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <main className="h-svh flex items-center justify-center bg-background1 dark:bg-backgroundDark">
        <p className="text-gray-700 dark:text-gray-300">Loading...</p>
      </main>
    )
  }

  return (
    <main className="h-svh flex items-center justify-center bg-background1 dark:bg-backgroundDark px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center max-w-2xl w-full">
        {/* Код ошибки */}
        <p className="text-base font-semibold text-orange">
          404
        </p>

        {/* Заголовок */}
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-7xl">
          Страница не найдена
        </h1>

        {/* Описание */}
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
          К сожалению, мы не смогли найти страницу, которую вы ищете.
        </p>

        {/* Кнопки */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Основная кнопка */}
          <Link
            href="/"
            className="rounded-md bg-orange px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 dark:hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-colors bg-orangeDefault"
          >
            Вернуться на главную
          </Link>

        </div>
      </div>
    </main>
  )
}