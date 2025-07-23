"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "public/trans_bg.svg";
import { navigationLinks } from "@/lib/contants";
import { PhoneIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-gray-100 via-white to-white dark:from-backgroundDark dark:via-backgroundDark1 dark:to-backgroundDark1 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and About */}
          <div className="md:col-span-1">
            <Link href="/glav" className="inline-block mb-4">
              <Image
                width={"50"}
                height={"50"}
                alt="AvanCore Logo"
                src={Logo}
              />
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
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-orangeDefault dark:hover:text-orange-400 transition-colors"
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
                <PhoneIcon className="w-5 h-5 mr-3 mt-0.5 text-orangeDefault flex-shrink-0" />
                <a
                  href="tel:+79161456882"
                  className="hover:text-orangeDefault dark:hover:text-orange-400 transition-colors"
                >
                  +7 993 245 68 82
                </a>
              </li>

              <li className="flex items-start">
                <svg
                  className="w-5 h-5 mr-3 mt-0.5 text-orangeDefault flex-shrink-0"
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
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <div className="mt-6">
              <Link
                href="/pk"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-orangeDefault dark:hover:text-orange-400 transition-colors underline"
              >
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} AvanCore™. Все права защищены.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 sm:mt-0">
            Разработано с ❤️ @InSpie
          </p>
        </div>
      </div>
    </footer>
  );
}
