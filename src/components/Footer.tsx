"use client";

import Image from "next/image";
import Link from "next/link";
import LightLogo from "public/shapka1.svg";
import DarkLogo from "public/shapka_dark.svg";
import { navigationLinks } from "src/lib/contants";
import { PhoneIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  return (
   <footer className="relative py-16 lg:py-20 overflow-hidden">
  {/* Декоративные элементы для фона */}
  <div className="absolute inset-0 bg-gradient-to-br from-teal-100/30 to-transparent dark:from-teal-900/20 dark:to-transparent" />
  <div className="absolute top-0 right-0 -translate-y-12 translate-x-12">
    <div className="w-64 h-64 bg-gradient-to-br from-teal-200/20 to-teal-300/20 dark:from-teal-700/20 dark:to-teal-600/20 rounded-full blur-3xl" />
  </div>
  <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12">
    <div className="w-48 h-48 bg-gradient-to-br from-blue-200/20 to-blue-300/20 dark:from-blue-700/20 dark:to-blue-600/20 rounded-full blur-3xl" />
  </div>
  
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
      {/* Logo and About */}
      <div className="md:col-span-1">
        <Link href="/" className="inline-block mb-4">
          <div className="block dark:hidden">
            <Image
              src={DarkLogo}
              alt="Тёмный логотип"
              width={200}
              height={50}
            />
          </div>
          <div className="hidden dark:block">
            <Image
              src={LightLogo}
              alt="Светлый логотип"
              width={200}
              height={50}
            />
          </div>
        </Link>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
          Профессиональная антикоррозийная обработка автомобилей в Москве.
          Защитите свой автомобиль от ржавчины и коррозии с нами.
        </p>
      </div>

      {/* Navigation Links */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
          Карта сайта
        </h3>
        <ul className="space-y-3">
          {navigationLinks.map((item) => (
            <li key={item.label}>
              <Link
                href={item.link}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-[var(--color-teal)] dark:hover:text-teal-400 transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Contacts */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
          Контакты
        </h3>
        <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <PhoneIcon className="w-5 h-5 mr-3 mt-0.5 text-[var(--color-teal)] flex-shrink-0" />
            <Link
              href="tel:+79932456882"
              className="hover:text-[var(--color-teal)] dark:hover:text-teal-400 transition-colors"
            >
              +7 993 245 68 82
            </Link>
          </li>

          <li className="flex items-start">
            <svg
              className="w-5 h-5 mr-3 mt-0.5 text-[var(--color-teal)] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>г. Жуковский, ул. Речной проспект, д. 14</span>
          </li>
          <li className="flex items-start ">
            <svg
              className="w-5 h-5 mr-3 mt-0.5 text-[var(--color-teal)] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>село Чанки, ул. Центральная 152</span>
          </li>
        </ul>
      </div>

      {/* Social Media */}
      <div>
        <div className="mt-6">
          <Link
            href="/pk"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-[var(--color-teal)] dark:hover:text-teal-400 transition-colors underline"
          >
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </div>

    <div className="mt-12 border-t border-gray-200/50 dark:border-gray-800/50 pt-8 flex flex-col sm:flex-row items-center justify-between">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} AvanCore™. Все права защищены.
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 sm:mt-0 ">
        Разработано с ❤️
        <Link className="underline" href={"https://t.me/InSpie"}>
          {" "}
          @InSpie
        </Link>
      </p>
    </div>
  </div>
</footer>
  )
}
