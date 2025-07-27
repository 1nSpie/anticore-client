"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import heroImg from "../../../../public/heroImg.jpg";
import { Button } from "src/shadcn/button";
import {
  Phone,
  Shield,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Zap,
  Award,
  Users,
} from "lucide-react";
import { CallbackModal } from "src/app/ui/ui/CallbackModal";

export default function Herosection({ id }: { id: string }) {
  const scrollToAutoPrice = () => {
    const element = document.getElementById("auto-price");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative overflow-hidden" id={id}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-gray-100 dark:bg-grid-gray-700/25 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200/30 dark:bg-orange-400/10 rounded-full blur-3xl -translate-x-48 -translate-y-48" />

      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {/* Main Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-sm font-medium text-orange-800 dark:text-orange-200"
            >
              <Award className="w-4 h-4" />
              №1 по защите от коррозии в России
            </motion.div>

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Защитим Ваш автомобиль от коррозии{' '}
                <span className="text-orangeDefault bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text">
                  с гарантией до 5 лет
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg leading-relaxed">
                Профессиональная антикоррозийная обработка с гарантией до 5 лет.
                Детальный фотоотчет и бесплатные осмотры каждые 12 месяцев.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={scrollToAutoPrice}
                size="lg"
                className="bg-orangeDefault hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                Рассчитать стоимость
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <CallbackModal
                trigger={
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-orangeDefault text-orangeDefault hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                  >
                    <Phone className="mr-2 w-4 h-4" />
                    Заказать звонок
                  </Button>
                }
              />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-3 gap-6 py-4"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-orangeDefault">5</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Лет гарантии
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orangeDefault">
                  500+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  довольных клиентов
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orangeDefault">8ч</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  время обработки
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Гарантия качества
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    До 5 лет защиты
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Быстрая обработка
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    От 8 часов
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Фотоотчет
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Детальная документация
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Бесплатные осмотры
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Каждые 12 месяцев
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative z-10">
              <Image
                src={heroImg}
                alt="Антикоррозийная обработка автомобиля ANTICORE"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl object-cover w-full h-auto"
                priority
              />

              {/* Floating Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      4000+
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Защищенных авто
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Quality Badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="absolute -top-4 -right-4 bg-orange-500 text-white rounded-xl shadow-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <div className="font-bold text-sm">Гарантия 5 лет</div>
                </div>
              </motion.div>
            </div>

            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-blue-400/10 rounded-2xl blur-3xl scale-110 -z-10" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
