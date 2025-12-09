"use client";

import ServiceCard from "./components/ServiceCard";
import { services } from "./components/servicesData";
import { motion } from "framer-motion";
import { ShieldCheckIcon, CogIcon, SparklesIcon } from "@heroicons/react/24/outline";
import FeedbackLine from "../ui/ui/FeedbackLine";
import Link from "next/link";

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const features = [
  {
    icon: ShieldCheckIcon,
    title: "Надежная защита",
    description: "Комплексная защита от коррозии на долгие годы"
  },
  {
    icon: CogIcon,
    title: "Современные технологии",
    description: "Использование передовых материалов и методов"
  },
  {
    icon: SparklesIcon,
    title: "Гарантия качества",
    description: "Профессиональное выполнение с гарантией"
  }
];

export default function ServicesPage() {
  return (
    <motion.div 
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      transition={{ type: "spring", duration: 0.5 }}
className="min-h-screen"
      style={{
        background:
          "radial-gradient(900px circle at 20% 18%, rgba(0, 148, 151, 0.12), transparent 55%), radial-gradient(1100px circle at 80% 12%, rgba(15, 23, 42, 0.12), transparent 60%), linear-gradient(180deg, rgba(13, 22, 36, 0.94), rgba(13, 22, 36, 0.82))",
      }}
    >
      {/* Обернул декоративные элементы в контейнер с hidden overflow */}
      <div className="relative overflow-hidden">

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 pt-30">
          <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-100/80 dark:bg-teal-900/30 backdrop-blur-sm rounded-full mb-8"
              >
                <ShieldCheckIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-semibold text-teal-800 dark:text-teal-300">Профессиональная защита</span>
              </motion.div>

              {/* Main heading */}
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-teal-700 dark:from-white dark:via-gray-100 dark:to-teal-300 bg-clip-text text-transparent leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Антикоррозийная обработка от профессионалов
              </motion.h1>

              {/* Description */}
              <motion.p
                className="mt-6 text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Защитите свой автомобиль от ржавчины и увеличьте его срок службы с
                помощью наших комплексных решений. Мы используем современные
                материалы и технологии, чтобы надежно защитить скрытые полости,
                днище, пороги и колесные арки.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link
                  href="#services"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Посмотреть услуги
                </Link>
                <Link
                  href="tel:+79932456882"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Получить консультацию
                </Link>
              </motion.div>
            </div>

            {/* Features Grid */}
            <motion.div
              className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 group"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Наши услуги
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-teal-600 mx-auto rounded-full mb-6" />
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Выберите подходящий пакет услуг для защиты вашего автомобиля
              </p>
            </motion.div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ServiceCard service={pkg} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Bottom CTA Section */}
      <FeedbackLine />
    </motion.div>
  );
}