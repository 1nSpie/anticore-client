"use client";

import { Button } from "@/shadcn/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CARDS_DATA = [
  {
    id: 1,
    season: "Лето",
    title: "Лето",
    description: "Пыль, гравий, УФ-лучи и перепады температур разрушают защитный слой.\nБез обновления покрытия - металл быстро оголяется.",

  },
  {
    id: 2,
    season: "Осень",
    title: "Осень",
    description: "Дожди, грязь и первые заморозки создают идеальные условия для старта коррозии. Защита до морозов - залог целого кузова зимой.",

  },
  {
    id: 3,
    season: "Зима",
    title: "Зима",
    description: "Реагенты, соль, лед и влажность разъедают металл изнутри.\nЕсли нет антикора - кузов начнет гнить уже в январе.",

  },
  {
    id: 4,
    season: "Весна",
    title: "Весна",
    description: "Снег тает, но соль и влага остаются. Коррозия активизируется в 3 раза быстрее - особенно в скрытых полостях.",

  },
];

export default function AntiCorrosionSection() {

  return (
    <section className="py-16 md:py-24 lg:py-32 ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            Защита от коррозии - <br className="hidden sm:block" />
            <span className="text-orange-500">не сезонная услуга,</span>{' '}
            <br className="hidden sm:block" />
            <span>а постоянная необходимость</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
            В каждое время года автомобиль подвергается разным угрозам.
            Узнайте, как защитить ваш автомобиль в любой сезон.
          </p>
        </div>

        {/* Карточки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8" >
          {CARDS_DATA.map((card) => (
            <div
              key={card.id}
              className="
                w-full
                max-w-[300px]
                h-[482px]
                mx-auto
                sm:mx-0
                rounded-[10px]
                border
                border-[#96F7E4]
                bg-gradient-to-r
                from-[#F0FDFA]
                to-[#CBFBF1]
                opacity-100
                flex
                flex-col
                p-6
                md:p-8
                shadow-lg
                shadow-teal-100/50
                hover:shadow-xl
                hover:shadow-teal-200/50
                hover:-translate-y-1
                transition-all
                duration-300
                group
              "
            >
              {/* Иконка сезона */}
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-orange-600">
                  {card.title}
                </h3>
              </div>

              {/* Описание */}
              <div className="flex-1">
                <p className="text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-line">
                  {card.description}
                </p>
              </div>

              {/* Кнопка */}
              <Link href="/blog?category=sezonnost" className="mt-6 pt-6 border-t border-teal-100 block">
                <Button
                  className="
                    w-full
                    bg-gradient-to-r
                    from-teal-600
                    to-teal-700
                    hover:from-teal-700
                    hover:to-teal-800
                    text-white
                    font-semibold
                    py-3
                    px-4
                    rounded-lg
                    transition-all
                    duration-200
                    group-hover:shadow-lg
                    group-hover:shadow-teal-500/30
                  "
                >
                  <span className="flex items-center justify-center gap-2">
                    Подробнее
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>

              {/* Декоративные элементы */}
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute -top-8 -right-8 w-16 h-16 bg-teal-200/20 rounded-full" />
              </div>
              <div className="absolute bottom-0 left-0 w-12 h-12 overflow-hidden">
                <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-teal-300/20 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Дополнительная информация */}
        <div className="mt-16 md:mt-20 text-center">
          <div className="inline-flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse" />
            <span className="text-gray-700 font-medium">
              Защита работает круглый год • Гарантия до 5 лет • Бесплатная диагностика
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}