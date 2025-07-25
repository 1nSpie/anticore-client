"use client";

import React from "react";
import StepCard from "src/app/glav/components/ui/StepsTechProccesCard";
import clear from "public/techprocces/clear.svg";
import diag from "public/techprocces/diag.svg";
import garanty from "public/techprocces/garanty.svg";
import mask from "public/techprocces/mask.svg";
import razb from "public/techprocces/razb.svg";
import sushka from "public/techprocces/sushka.svg";
import wash from "public/techprocces/wash.svg";

export interface Step {
  title: string;
  description: string;
  icon: string;
}

type Props = {
  id: string;
};

export const stepsData: Step[] = [
  {
    title: "Диагностика",
    description:
      "Производим осмотр авто. По итогам осмотра и Ваших пожеланий, составляется перечень работ.",
    icon: diag,
  },
  {
    title: "Разборка",
    description:
      "Снимаются колеса, подкрылки, пластиковые накладки. В отдельных случаях снимаются бампер, фары и фонари.",
    icon: razb,
  },
  {
    title: "Мойка",
    description: "Мойка днища специальным составом под большим давлением.",
    icon: wash,
  },
  {
    title: "Сушка",
    description:
      "Днище и полости продувается сжатым воздухом, после чего автомобиль сушится тепловыми пушками. Для просушки скрытых полостей используется турбосушка.",
    icon: sushka,
  },
  {
    title: "Маскировка",
    description:
      "Маскируется кузов авто, далее тормозная и выхлопная системы, элементы подвески и трансмиссии.",
    icon: mask,
  },
  {
    title: "Зачистка",
    description:
      "Очаги коррозии зачищаются при помощи пневмо- и электроинструмента различной конфигурации.",
    icon: clear,
  },
  {
    title: "Гарантийный талон",
    description:
      "После того, как Вы осмотрите автомобиль и примете работу, менеджер выпишет Вам гарантийный талон.",
    icon: garanty,
  },
];

export default function TechProcces({ id }: Props) {
  return (
    <section id={id} className="bg-gradient-to-br from-background1 via-background to-background1 dark:from-backgroundDark dark:via-backgroundDark1 dark:to-backgroundDark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-orangeDefault/5 to-greenDefault/5 pointer-events-none"></div>
      
      <div className="max-w-[85rem] mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Enhanced title section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl lg:leading-tight text-black dark:text-white mb-6 tracking-tight">
            Этапы работ
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-orangeDefault to-greenDefault mx-auto rounded-full mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Профессиональный подход к каждому этапу обработки автомобиля
          </p>
        </div>
        
        {/* Enhanced grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {stepsData.map((step, idx) => (
            <div key={idx} className="group">
              <StepCard step={step} />
            </div>
          ))}
        </div>
        
        {/* Bottom decoration */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 text-orangeDefault font-medium">
            <div className="w-8 h-0.5 bg-orangeDefault rounded-full"></div>
            <span className="text-sm uppercase tracking-wide">Качество гарантировано</span>
            <div className="w-8 h-0.5 bg-orangeDefault rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
