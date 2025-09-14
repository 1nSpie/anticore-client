"use client";

import AutoPrice from "./glav/components/AutoPrice";
import AwesomeServices from "./glav/components/AwesomeServices";
import CarouselSection from "./glav/components/Carousel";
import FloatingNavigation from "./glav/components/FloatingNavigation";
import Garanty from "./glav/components/Garanty";
import MainVideoPlayer from "./glav/components/MainVideoPlayer";
import YandexMap from "./glav/components/map/Map";
import PriceCardList from "./glav/components/PriceList";
import TechProcces from "./glav/components/TechProcces";
import Marquee from "react-fast-marquee";

export default function GlavPage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-900/20 min-h-screen">
      {/* Декоративные элементы для фона */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-100/30 to-transparent dark:from-teal-900/20 dark:to-transparent" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12">
          <div className="w-64 h-64 bg-gradient-to-br from-teal-200/20 to-teal-300/20 dark:from-teal-700/20 dark:to-teal-600/20 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12">
          <div className="w-48 h-48 bg-gradient-to-br from-blue-200/20 to-blue-300/20 dark:from-blue-700/20 dark:to-blue-600/20 rounded-full blur-3xl" />
        </div>

        <FloatingNavigation />
        <main className="flex-1 relative z-10">
          <AwesomeServices id="hero" />

          <div className="py-16 lg:py-20">
            <AutoPrice id="auto-price" />
          </div>

          {/* Running line separator */}
          <div className="py-4 bg-transparent backdrop-blur-sm ">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
              <Marquee speed={100} pauseOnHover={true}>
                <span className="mx-4 text-teal-600 dark:text-teal-400 font-medium">
                  ★ Профессиональная антикоррозийная обработка ★ Гарантия на все
                  виды работ ★ Используем только качественные материалы ★
                  Индивидуальный подход к каждому клиенту ★
                </span>
              </Marquee>
            </div>
          </div>

          <div className="py-16 lg:py-20">
            <TechProcces id="tech-process" />
          </div>

          {/* Running line separator */}
          <div className="py-4 bg-transparent backdrop-blur-sm ">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
              <Marquee speed={100} pauseOnHover={true}>
                <span className="mx-4 text-teal-600 dark:text-teal-400 font-medium">
                  ★ Гарантия качества ★ Технологические процессы ★ Диагностика
                  перед обработкой ★ Полная прозрачность ★
                </span>
              </Marquee>
            </div>
          </div>

          <div className="py-16 lg:py-20">
            <Garanty id="garanty" />
          </div>

          {/* Running line separator */}
          <div className="py-4 bg-transparent backdrop-blur-sm ">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
              <Marquee speed={100} pauseOnHover={true}>
                <span className="mx-4 text-teal-600 dark:text-teal-400 font-medium">
                  ★ Видео отчеты ★ Контроль качества ★ Удовлетворенность
                  клиентов ★ Долговечная защита ★
                </span>
              </Marquee>
            </div>
          </div>

          <div className="py-16 lg:py-20">
            <MainVideoPlayer />
          </div>

          {/* Running line separator */}
          <div className="py-4 bg-transparent backdrop-blur-sm ">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
              <Marquee speed={100} pauseOnHover={true}>
                <span className="mx-4 text-teal-600 dark:text-teal-400 font-medium">
                  ★ Отзывы клиентов ★ Реальные истории ★ Рекомендации ★ Доверие
                  ★
                </span>
              </Marquee>
            </div>
          </div>

          <div className="py-16 lg:py-20">
            <CarouselSection id="reviews" />
          </div>

          {/* Running line separator */}
          <div className="py-4 bg-transparent backdrop-blur-sm ">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
              <Marquee speed={100} pauseOnHover={true}>
                <span className="mx-4 text-teal-600 dark:text-teal-400 font-medium">
                  ★ Гибкие цены ★ Прозрачное ценообразование ★ Сезонные акции ★
                  Индивидуальные скидки ★
                </span>
              </Marquee>
            </div>
          </div>

          <div className="py-16 lg:py-20">
            <PriceCardList id="prices" />
          </div>

          {/* Running line separator */}
          <div className="py-4 bg-transparent backdrop-blur-sm ">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
              <Marquee speed={100} pauseOnHover={true}>
                <span className="mx-4 text-teal-600 dark:text-teal-400 font-medium">
                  ★ Удобное расположение ★ Навигация ★ Контакты ★ Обратная связь
                  ★
                </span>
              </Marquee>
            </div>
          </div>

          <div className="py-16 lg:py-20">
            <YandexMap id="map" />
          </div>
        </main>
      </div>
    </div>
  );
}
