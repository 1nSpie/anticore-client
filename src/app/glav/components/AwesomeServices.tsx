// AwesomeServices.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "src/shadcn/button";
import { CallbackModal } from "src/app/ui/ui/CallbackModal";
import { Phone } from "lucide-react";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001/api";

export default function AwesomeServices({ id }: { id: string }) {
  const scrollToAutoPrice = () => {
    const element = document.getElementById("auto-price");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id={id}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 object-cover w-full h-full z-0"
        preload="auto"
      >
        <source src={`${API_BASE_URL}/video/videoStart.mp4`} type="video/mp4" />
        Ваш браузер не поддерживает видео.
      </video>

      {/* Video Overlay with gradients for better readability */}
      <div
        className="absolute inset-0 z-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(0, 116, 120, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(0, 116, 120, 0.2) 0%, transparent 50%),
            linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)
          `,
        }}
      ></div>

      {/* Main Content */}
      <div className="relative z-20 mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center pt-30">
        {/* Service Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 mb-8"
        >
          <span className="text-orangeDefault font-mono text-lg tracking-wider">
            01
          </span>
          <div className="w-16 h-px bg-orangeDefault"></div>
          <span className="text-gray-300 font-light text-sm tracking-widest uppercase">
            АНТИКОРРОЗИЙНАЯ ОБРАБОТКА
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black leading-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orangeDefault via-teal-400 to-orangeDefault animate-gradient-x">
              АВАНКОР
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-px bg-orangeDefault"></div>
            <div className="w-12 h-px bg-orangeDefault"></div>
          </div>
          <p className="text-xl sm:text-2xl text-gray-300 font-light tracking-wide max-w-3xl mx-auto">
            Профессиональная защита Вашего автомобиля от коррозии{" "}
            <br className="hidden sm:block" />с гарантией до 5 лет
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Button
            onClick={scrollToAutoPrice}
            className="text-base h-14 inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Расчитать стоимость
          </Button>

          <CallbackModal
            trigger={
              <Link
                href={""}
                className="inline-flex items-center justify-center px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Phone className="mr-2 w-5 h-5" />
                Заказать звонок
              </Link>
            }
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="grid md:grid-cols-4 grid-cols-2 gap-8 mt-16 m-auto mx-auto"
        >
          <div className="text-center border-x border-white/10">
            <div className="text-3xl font-bold text-orangeDefault mb-2">
              До 5
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">
              Лет гарантии
            </div>
          </div>
          <div className="text-center border-x border-white/10">
            <div className="text-3xl font-bold text-orangeDefault mb-2">
              5000+
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">
              Авто защищено
            </div>
          </div>
          <div className="text-center border-x border-white/10">
            <div className="text-3xl font-bold text-orangeDefault mb-2">
              от 8ч
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">
              Время работы
            </div>
          </div>
          <div className="text-center border-x border-white/10">
            <div className="text-3xl font-bold text-orangeDefault mb-2">
              Работаем
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">
              Без выходных
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </section>
  );
}
