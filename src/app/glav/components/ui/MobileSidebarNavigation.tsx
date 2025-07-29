"use client";

import { useState } from "react";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { navigationLinks } from "src/lib/contants";
import Link from "next/link";
import Image from "next/image";
import telegramIcon from "public/icons8-телеграм.svg";
import whatsappIcon from "public/icons8-whatsapp.svg";
import vkIcon from "public/icons8-vk.svg";
import rutubeIcon from "public/Rutube_icon.svg";
import ThemeSwitcher from "src/app/ui/ui/ThemeSwitcher";

export default function MobileSidebarNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Кнопка для открытия меню */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden text-orangeDefault p-2 rounded-md"
      >
        <Bars3Icon className="h-8 w-8" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-30 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 w-64 sm:w-80 h-full bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-2xl transform transition-transform duration-500 ease-in-out z-50 rounded-l-2xl overflow-hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="mx-auto p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Меню
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-orangeDefault hover:text-orangeDefaultHover transition-colors"
                aria-label="Закрыть меню"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-4 space-y-4">
              {navigationLinks.map((item, index) => (
                <Link
                  key={index}
                  href={item.link}
                  className="block text-lg font-medium text-gray-800 dark:text-gray-200 hover:text-orangeDefault transition-transform transform hover:translate-x-1"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  {/* Social Media Links */}
                  <Link
                    href="https://api.whatsapp.com/send/?phone=79932456882&text=Добрый+день!+Хочу+записаться+на+обработку&type=phone_number&app_absent=0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex"
                  >
                    <div
                      className="w-10 h-10 bg-orangeDefault hover:bg-orangeDefaultHover rounded-full flex items-center justify-center shadow-md transition-transform duration-500 hover:scale-110"
                      title="WhatsApp"
                    >
                      <Image
                        src={whatsappIcon}
                        alt="Contact via WhatsApp"
                        width={20}
                        height={20}
                      />
                    </div>
                  </Link>

                  <Link
                    href="https://t.me/+79932456882"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex"
                  >
                    <div
                      className="w-10 h-10 bg-orangeDefault hover:bg-orangeDefaultHover rounded-full flex items-center justify-center shadow-md transition-transform duration-500 hover:scale-110"
                      title="Telegram"
                    >
                      <Image
                        src={telegramIcon}
                        alt="Contact via Telegram"
                        width={20}
                        height={20}
                      />
                    </div>
                  </Link>
                  <Link
                    href="https://vk.com/technosyndicate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex"
                  >
                    <div
                      className="w-10 h-10 bg-orangeDefault hover:bg-orangeDefaultHover rounded-full flex items-center justify-center shadow-md transition-transform duration-500 hover:scale-110"
                      title="VK"
                    >
                      <Image
                        src={vkIcon}
                        alt="Contact via Telegram"
                        width={20}
                        height={20}
                      />
                    </div>
                  </Link>
                  <Link
                    href="https://rutube.ru/channel/59698286/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex"
                  >
                    <div
                      className="w-10 h-10 bg-orangeDefault hover:bg-orangeDefaultHover rounded-full flex items-center justify-center shadow-md transition-transform duration-500 hover:scale-110"
                      title="RUTUBE"
                    >
                      <Image
                        src={rutubeIcon}
                        alt="Contact via Rutube"
                        width={20}
                        height={20}
                      />
                    </div>
                  </Link>
                </div>
              </div>
              <div className="mt-4">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
