"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function ProcessPage() {
  const steps = [
    {
      number: "01",
      title: "Осмотр и диагностика",
      description:
        "Профессиональный осмотр автомобиля для определения текущего состояния кузова и выявления проблемных зон",
      details: [
        "Визуальный осмотр кузова",
        "Оценка состояния скрытых полостей",
        "Проверка днища и порогов",
        "Составление плана обработки",
      ],
    },
    {
      number: "02",
      title: "Подготовительные работы",
      description:
        "Тщательная подготовка поверхностей для максимальной эффективности антикоррозийной обработки",
      details: [
        "Мойка и обезжиривание",
        "Снятие защитных элементов",
        "Обработка проблемных участков",
        "Подготовка рабочего места",
      ],
    },
    {
      number: "03",
      title: "Нанесение защитных составов",
      description:
        "Профессиональное нанесение современных антикоррозийных материалов с использованием специального оборудования",
      details: [
        "Обработка скрытых полостей",
        "Защита днища и порогов",
        "Обработка колесных арок",
        "Нанесение финишного покрытия",
      ],
    },
    {
      number: "04",
      title: "Контроль качества",
      description:
        "Финальная проверка качества выполненных работ и предоставление гарантийных обязательств",
      details: [
        "Проверка качества покрытия",
        "Контроль толщины слоя",
        "Финальная мойка",
        "Оформление гарантии",
      ],
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      transition={{ type: "spring", duration: 0.5 }}
      className="bg-gradient-to-br from-gray-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-900/20 min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 pt-30">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-100/30 to-transparent dark:from-teal-900/20 dark:to-transparent" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12">
          <div className="w-64 h-64 bg-gradient-to-br from-teal-200/20 to-teal-300/20 dark:from-teal-700/20 dark:to-teal-600/20 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12">
          <div className="w-48 h-48 bg-gradient-to-br from-blue-200/20 to-blue-300/20 dark:from-blue-700/20 dark:to-blue-600/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-teal-700 dark:from-white dark:via-gray-100 dark:to-teal-300 bg-clip-text text-transparent lg:leading-tight mb-4">
              Процесс антикоррозийной обработки
            </h1>
            <p className="mt-4 md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Мы используем проверенную методику обработки в 4 этапа, которая
              обеспечивает максимальную защиту вашего автомобиля от коррозии
            </p>
          </motion.div>

          {/* Process Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className={`flex flex-col lg:flex-row items-start gap-8 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                {/* Step Number and Title */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#007478] text-white text-2xl font-bold rounded-full mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {step.description}
                  </p>
                </div>

                {/* Step Details */}
                <div className="flex-1">
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Что входит в этап:
                    </h4>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="flex items-center text-gray-600 dark:text-gray-300"
                        >
                          <svg
                            className="w-4 h-4 text-[#007478] dark:text-[#00a2a6] mr-3 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#007478] to-[#005a5e] dark:from-[#005a5e] dark:to-[#004246] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Готовы защитить свой автомобиль?
            </h3>
            <p className="text-xl text-[#00a2a6] dark:text-teal-200 mb-8 max-w-2xl mx-auto">
              Свяжитесь с нами для получения персональной консультации и расчета
              стоимости
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="tel:+79932456882"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#007478] font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:bg-gray-50"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Позвонить сейчас
              </Link>
              <Link
                href="/#auto-price"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-2xl border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all duration-200"
              >
                Рассчитать стоимость
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
