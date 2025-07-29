"use client";

import ServiceCard from "./components/ServiceCard";
import { services } from "./components/servicesData";
import { motion } from "framer-motion";
import { ShieldCheckIcon, CogIcon, SparklesIcon } from "@heroicons/react/24/outline";
import FeedbackLine from "../ui/ui/FeedbackLine";

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
      className="bg-gradient-to-br from-gray-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20 min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 to-transparent dark:from-orange-900/20 dark:to-transparent" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12">
          <div className="w-64 h-64 bg-gradient-to-br from-orange-200/20 to-orange-300/20 dark:from-orange-700/20 dark:to-orange-600/20 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12">
          <div className="w-48 h-48 bg-gradient-to-br from-blue-200/20 to-blue-300/20 dark:from-blue-700/20 dark:to-blue-600/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-100/80 dark:bg-orange-900/30 backdrop-blur-sm rounded-full mb-8"
            >
              <ShieldCheckIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-semibold text-orange-800 dark:text-orange-300">Профессиональная защита</span>
            </motion.div>

            {/* Main heading */}
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-orange-700 dark:from-white dark:via-gray-100 dark:to-orange-300 bg-clip-text text-transparent leading-tight"
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
              <a
                href="#services"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Посмотреть услуги
              </a>
              <a
                href="tel:+79932456882"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Получить консультацию
              </a>
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
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
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
      <section id="services" className="py-20 lg:py-32 relative">
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
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-orange-600 mx-auto rounded-full mb-6" />
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

      {/* Bottom CTA Section */}
      <FeedbackLine />
    </motion.div>
  );
}
