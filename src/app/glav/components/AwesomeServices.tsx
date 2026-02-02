"use client";

import { motion } from "framer-motion";
import { Button } from "src/shadcn/button";
import { CallbackModal } from "src/app/ui/ui/CallbackModal";
import { Phone } from "lucide-react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_S3_URL
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900 text-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
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
        <source
          src={`${API_BASE_URL}/video/videoStart.mp4`}
          type="video/mp4"
        />
        Ваш браузер не поддерживает видео.
      </video>

      {/* Video Overlay with gradients for better readability */}
      <div
        className="absolute inset-0 z-10"
        style={{
          backgroundImage: `
            radial-gradient(900px circle at 18% 78%, rgba(0, 148, 151, 0.22), transparent 55%),
            radial-gradient(820px circle at 82% 18%, rgba(0, 116, 120, 0.18), transparent 52%),
            linear-gradient(120deg, rgba(8, 13, 24, 0.9) 0%, rgba(12, 19, 32, 0.82) 100%)
          `,
        }}
      ></div>

      {/* Main Content */}
      <div className="relative z-20 mx-auto px-4 py-10 sm:py-14 md:py-16 sm:px-6 lg:px-8 text-center">
        {/* Service Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 mb-4 sm:mb-6 md:mb-8"
        >
          <div className="w-10 sm:w-16 h-px bg-orangeDefault" />
          <span className="text-gray-300 font-light text-xs sm:text-sm tracking-widest uppercase">
            АНТИКОРРОЗИЙНАЯ ОБРАБОТКА
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mb-4 sm:mb-6"
        >
          <h1>
            <span
              className="font-montserrat font-extrabold text-center align-middle text-white [text-shadow:0px_4px_4px_#FF5347] text-[48px] sm:text-[64px] md:text-[80px] lg:text-[100px] leading-tight sm:leading-none"
            >
              АВАНКОР
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-8 sm:mb-10 md:mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <div className="w-8 sm:w-12 h-px bg-orangeDefault" />
            <div className="w-8 sm:w-12 h-px bg-orangeDefault" />
          </div>
          <p className="text-base sm:text-xl md:text-2xl text-white font-bold tracking-wide max-w-3xl mx-auto leading-snug">
            Профессиональная защита Вашего автомобиля от коррозии
            <br className="hidden sm:block" />
            с гарантией до 5 лет
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center w-full sm:w-auto"
        >
          <Button
            onClick={scrollToAutoPrice}
            className="w-full sm:w-auto text-sm sm:text-base h-12 sm:h-14 inline-flex items-center justify-center px-6 sm:px-8 py-4 bg-gradient-to-r from-[#EF9147] to-[#FF6B35] text-white font-semibold rounded-xl sm:rounded-2xl shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/60 transform hover:scale-105 active:scale-100 transition-all duration-200"
          >
            Рассчитать стоимость
          </Button>

          <CallbackModal
            trigger={
              <Link
                href=""
                className="w-full sm:w-auto inline-flex items-center justify-center h-12 sm:h-14 px-6 sm:px-8 py-4 text-black font-semibold rounded-xl sm:rounded-2xl bg-white shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-orange-500/60 transform hover:scale-105 active:scale-100 transition-all duration-200"
              >
                <Phone className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
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
          className="grid md:grid-cols-4 grid-cols-2 gap-8 mt-10 sm:mt-12 md:mt-16 m-auto mx-auto"
        >
          <div className="text-center border-x border-white/10 py-4 sm:py-5">
            <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1 sm:mb-2">До 5</div>
            <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Лет гарантии</div>
          </div>
          <div className="text-center border-x border-white/10 py-4 sm:py-5">
            <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1 sm:mb-2">5000+</div>
            <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Авто защищено</div>
          </div>
          <div className="text-center border-x border-white/10 py-4 sm:py-5">
            <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1 sm:mb-2">от 8ч</div>
            <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Время работы</div>
          </div>
          <div className="text-center border-x border-white/10 py-4 sm:py-5">
            <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1 sm:mb-2">Работаем</div>
            <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Без выходных</div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent"></div>
    </section>
  );
}
