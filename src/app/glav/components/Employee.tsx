"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import carousel1 from "../../../../public/carousel1-Photoroom.png";

const employee = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  img: carousel1,
}));

export default function Employee() {
  const [isAll, setIsAll] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Скролл к кнопке после анимации
  const scrollToButton = () => {
    if (triggerRef.current) {
      setTimeout(() => {
        triggerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center", // Центрируем кнопку на экране
        });
      }, 300); // Задержка для завершения анимации списка
    }
  };

  // Отслеживаем изменение состояния isExpanded
  useEffect(() => {
    scrollToButton();
  }, [isAll]);

  return (
    <div className="bg-background dark:bg-backgroundDark">
      <div className="max-w-[85rem] px-4 py-16 sm:px-6 lg:px-8 lg:py-20 mx-auto">
        {/* Заголовок */}
        <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
          <h2 className="text-2xl font-bold md:text-4xl md:leading-tight text-black dark:text-white">
            Наша команда
          </h2>
        </div>

        {/* Первые три карточки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {employee.slice(0, 3).map((emp, index) => (
            <motion.div
              key={emp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col rounded-xl p-4 md:p-6 bg-white border border-gray-200 dark:bg-backgroundDark1 dark:border-orangeDefault hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-x-4">
                <Image
                  width={80}
                  height={80}
                  className="rounded-full size-20"
                  src={emp.img.src} // Исправлено для работы с импортированными изображениями
                  alt="Avatar"
                />
                <div className="grow">
                  <h3 className="font-medium text-gray-800 dark:text-neutral-200">
                    David Forren
                  </h3>
                  <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                    Founder / CEO
                  </p>
                </div>
              </div>
              <p className="mt-3 text-gray-500 dark:text-neutral-400">
                I am an ambitious workaholic, but apart from that, pretty simple
                person.
              </p>
            </motion.div>
          ))}
        </div>

        {/* Контейнер для анимируемого контента */}
        <div ref={containerRef}>
          {/* Остальные карточки */}
          <AnimatePresence>
            {isAll && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }} // Начальное состояние
                animate={{ opacity: 1, height: "auto", y: 0 }} // Конечное состояние
                exit={{ opacity: 0, height: 0, y: -20 }} // Исчезновение
                transition={{ duration: 1 }}
                className="overflow-hidden space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {employee.slice(3).map((emp, index) => (
                    <motion.div
                      key={emp.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex flex-col rounded-xl p-4 md:p-6 bg-white border border-gray-200 dark:bg-backgroundDark1 dark:border-orangeDefault hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center gap-x-4">
                        <Image
                          width={80}
                          height={80}
                          className="rounded-full size-20"
                          src={emp.img.src} // Исправлено для работы с импортированными изображениями
                          alt="Avatar"
                        />
                        <div className="grow">
                          <h3 className="font-medium text-gray-800 dark:text-neutral-200">
                            David Forren
                          </h3>
                          <p className="text-xs uppercase text-gray-500 dark:text-neutral-500">
                            Founder / CEO
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-gray-500 dark:text-neutral-400">
                        I am an ambitious workaholic, but apart from that,
                        pretty simple person.
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Кнопка с анимацией положения */}
          <motion.button
            className="w-full text-center mb-6 mt-10 py-2 px-4 bg-orangeDefault hover:bg-orangeDefaultHover text-white rounded-lg focus:outline-none transition-colors"
            onClick={() => setIsAll((prev) => !prev)}
            initial={{ y: 0 }}
            animate={{
              y: isAll ? 0 : -20, // Кнопка плавно поднимается наверх
            }}
            transition={{ duration: 0.5 }}
          >
            {isAll ? "Скрыть список" : "Показать список"}
          </motion.button>
        </div>

        <div className="pb-20"></div>
      </div>
    </div>
  );
}
