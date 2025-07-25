import { Button } from "src/shadcn/button";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import { CallbackModal } from "./CallbackModal";

export default function FeedbackLine() {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
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
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Свяжитесь с нами для получения персональной консультации и расчета
            стоимости
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CallbackModal
              trigger={
                <Button className="h-[60px] inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 hover:bg-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Заказать обратный звонок
                </Button>
              }
            />
            <Link
              href="/glav#auto-price"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-2xl border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all duration-200"
            >
              Рассчитать стоимость
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
