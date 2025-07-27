"use client";

import React from "react";
import { PhoneIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { Button } from "src/shadcn/button";
import { FaMapMarkerAlt } from "react-icons/fa";
import { navigationLinks } from "src/lib/contants";
import { usePathname } from "next/navigation";
import shapka1 from "public/shapka1.svg";
import telegramIcon from "public/icons8-телеграм.svg";
import whatsappIcon from "public/icons8-whatsapp.svg";
import vkIcon from "public/icons8-vk.svg";
import rutubeIcon from "public/Rutube_icon.svg";
import { CallbackModal } from "src/app/ui/ui/CallbackModal";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001/api";

export default function NavbarHeroSection({ id }: { id: string }) {
  const pathname = usePathname();

  const handleScroll = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Скрываем navbar на главной
  if (pathname === "/glav")
    return (
      <div className="relative min-h-screen overflow-hidden hidden xl:block" id={id}>
        {/* Видео на заднем фоне */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 object-cover w-full h-full z-[-1]"
          preload="auto"
        >
          <source
            src={`${API_BASE_URL}/video/videoStart.mp4`}
            type="video/mp4"
          />
          Ваш браузер не поддерживает видео.
        </video>

        {/* Тёмный overlay для улучшения читаемости текста */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-0"></div>

        {/* Основной контент */}
        <div className="relative z-10">
          {/* Навигационное меню */}
          <nav className="mx-auto px-4 py-4 flex items-center justify-between w-full">
            {/* Логотип */}
            <div className="flex items-center wrap">
              <div className="flex items-center min-w-fit mr-8">
                <Image src={shapka1} alt="Логотип" width={300} height={300} />
              </div>
              <div
                className="hidden md:flex flex-col no-wrap"
                onClick={(e) => handleScroll(e, "map")}
              >
                <div
                  className="flex cursor-pointer mb-1"

                >
                  <FaMapMarkerAlt className="mr-1 text-orangeDefault" />
                  <span className="text-white">Жуковский</span>
                </div>
                <div
                  className="flex cursor-pointer"
                >
                  <FaMapMarkerAlt className="mr-1 text-orangeDefault" />
                  <span className="text-white">Коломна</span>
                </div>
                <span className="text-sm text-white dark:text-gray-300 border-t-2 border-dashed border-orangeDefault mt-2 pt-2">
                  Ежедневно c 09:00 до 20:00
                </span>
              </div>
            </div>

            {/* Меню навигации */}
            <div className="flex w-2/3 gap-12 justify-center">
              {navigationLinks.map((el, i) => (
                <a
                  key={i}
                  href={el.link}
                  className="text-xl font-bold text-white hover:text-orangeDefault hover:underline hover:decoration-2 hover:underline-offset-8"
                >
                  {el.label}
                </a>
              ))}
            </div>
          </nav>
          <CallbackModal
            trigger={
              <div className="group flex items-center cursor-pointer w-fit left-4/5 relative">
                <div className="rounded-full border-2 border-orangeDefault group-hover:border-orange-600 p-2 transition-colors duration-300">
                  <PhoneIcon className="w-10 h-10 text-white" />
                </div>
                <div className="ml-2 text-right">
                  <span className="text-xl text-white">+7 993 245 68 82</span>
                  <p
                    className="text-xl text-orangeDefault hover:text-orange-600 border-b-2 border-dotted border-orangeDefault 
                group-hover:text-orange-600 group-hover:border-orange-600 transition-all duration-300"
                  >
                    Заказать звонок
                  </p>
                </div>
              </div>
            }
          ></CallbackModal>

          {/* Hero Section */}
          <div className="flex items-center h-full mt-10 justify-end mr-37">
            <div className="py-8 flex flex-col items-end max-w-full mr-37">
              <h1 className="text-3xl font-bold text-white dark:text-white mb-4 text-center">
                Защита авто от коррозии — <br />
                <span className="text-orangeDefault">наша работа</span>
              </h1>
              <Button
                className="h-16 w-100 inline-flex items-center justify-center px-8 py-4 bg-orangeDefault hover:bg-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                onClick={(e) => handleScroll(e, "auto-price")}
              >
                <p className="text-3xl mt-4">Остановить коррозию</p>
              </Button>
            </div>
          </div>
        </div>
          <div className="absolute bottom-0 right-0 flex space-x-4 px-24 py-8">
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
              href=" https://t.me/+79932456882 "
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
              href="https://vk.com/technosyndicate "
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
                  alt="Contact via VK"
                  width={20}
                  height={20}
                />
              </div>
            </Link>

            <Link
              href="https://rutube.ru/channel/59698286/ "
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
    );
}
