"use client";

import { useState } from "react";
import { ChevronDownIcon, ShieldCheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  id: string;
};

export default function Garanty({ id }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const services = [
    {
      title: "Мойка днища и скрытых полостей",
      description: "Тщательная очистка всех труднодоступных участков"
    },
    {
      title: "Тщательный осмотр антикоррозийного покрытия",
      description: "Детальная диагностика состояния защитного слоя"
    },
    {
      title: "Зачистка выявленных очагов коррозии",
      description: "Устранение повреждений и следов коррозии"
    },
    {
      title: "Обновление составов на днище и в скрытых полостях",
      description: "Восстановление защитного покрытия"
    }
  ];

  return (
    <section id={id} className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16 lg:py-20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orangeDefault rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="relative max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Enhanced Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center items-center mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-orangeDefault mr-3" />
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl text-gray-900 dark:text-white">
              Гарантия
            </h1>
            <ShieldCheckIcon className="w-8 h-8 text-orangeDefault ml-3" />
          </div>
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-orangeDefault to-orange-600 mx-auto mt-4 rounded-full"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">
            Надёжная защита вашего автомобиля с гарантией до 5 лет
          </p>
        </motion.div>

        {/* Key Features Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center mb-4">
              <ClockIcon className="w-8 h-8 text-orangeDefault mr-3" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">До 5 лет</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Максимальный срок гарантии на антикоррозийную обработку
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400 mr-3">✓</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Бесплатно</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Все работы по восстановлению покрытия в гарантийный период
            </p>
          </motion.div>
        </div>

        {/* Mobile Accordion */}
        <div className="xl:hidden">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex justify-between items-center w-full px-6 py-5 text-left text-lg sm:text-xl font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 focus:outline-none focus:ring-4 focus:ring-orangeDefault/30 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700"
            aria-expanded={isOpen}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center">
              <ShieldCheckIcon className="w-6 h-6 text-orangeDefault mr-3" />
              <span>Подробнее о гарантии</span>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDownIcon className="w-6 h-6 text-orangeDefault" />
            </motion.div>
          </motion.button>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  {/* Mobile Content */}
                  <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none">
                    <p className="text-center mb-6">
                      Что такое{" "}
                      <strong className="text-orangeDefault">ГАРАНТИЯ</strong> и для чего это нужно?
                    </p>
                    <p className="mb-4">
                      Ни для кого не секрет, что в нашем мире нет ничего вечного.
                      Антикоррозийная обработка, даже если она произведена по технологии
                      и качественными материалами, не исключение. Однако, существует способ
                      значительно продлить срок службы антикоррозийного покрытия и, как
                      следствие, кузова автомобиля. Способ этот –{" "}
                      <strong className="text-orangeDefault">ГАРАНТИЯ.</strong>
                    </p>
                    <p className="mb-6">
                      ГАРАНТИЯ – комплекс мероприятий, направленных на поддержание целостности
                      антикоррозийного покрытия в скрытых полостях и на открытых поверхностях
                      кузова, а также на своевременное устранение недостатков.
                    </p>
                    
                    <h4 className="font-semibold text-orangeDefault mb-4">В гарантийное обслуживание входят:</h4>
                    <div className="space-y-3 mb-6">
                      {services.map((service, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <span className="w-2 h-2 bg-orangeDefault rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">{service.title}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <p className="mb-4">
                      Гарантийными случаями во многих компаниях, занимающихся антикоррозийной
                      обработкой, считается сквозная коррозия. Однако, гарантия в нашей компании —
                      это не просто формальность. Это ваше спокойствие и уверенность в защите
                      вашего авто на долгие годы.
                    </p>
                    
                    <div className="bg-gradient-to-r from-orange-50 to-green-50 dark:from-orange-900/20 dark:to-green-900/20 p-4 rounded-lg mb-6">
                      <p className="text-center font-medium">
                        Мы предоставляем гарантию до <strong className="text-orangeDefault">5 лет</strong>, и абсолютно неважно,
                        что произошло с покрытием и по какой причине. Будь то ДТП, тяжёлое
                        бездорожье, механические повреждения или воздействие времени — мы обновим
                        покрытие{" "}
                        <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                          БЕСПЛАТНО
                        </span>{" "}
                        в течение гарантийного срока.
                      </p>
                    </div>
                    
                    <p className="italic text-gray-600 dark:text-gray-400 text-center font-medium">
                      Ровных дорог и мирного неба, дорогие читатели. Ждём вас.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Version */}
        <motion.div 
          className="hidden xl:block"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 lg:p-12 border border-gray-200 dark:border-gray-700">
            <div className="prose prose-lg dark:prose-invert max-w-none mx-auto text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
              <p className="text-center text-xl mb-8">
                Что такое{" "}
                <strong className="text-orangeDefault">ГАРАНТИЯ</strong> и для чего это нужно?
              </p>
              <p className="text-lg">
                Ни для кого не секрет, что в нашем мире нет ничего вечного.
                Антикоррозийная обработка, даже если она произведена по технологии
                и качественными материалами, не исключение. Однако, существует способ
                значительно продлить срок службы антикоррозийного покрытия и, как
                следствие, кузова автомобиля. Этот способ —{" "}
                <strong className="text-orangeDefault">ГАРАНТИЯ.</strong>
              </p>
              <p className="text-lg">
                ГАРАНТИЯ – комплекс мероприятий, направленных на поддержание целостности
                антикоррозийного покрытия в скрытых полостях и на открытых поверхностях
                кузова, а также на своевременное устранение недостатков.
              </p>
              
              <h3 className="text-xl font-bold text-orangeDefault text-center mb-8">В гарантийное обслуживание входят:</h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-4">
                      <span className="w-3 h-3 bg-orangeDefault rounded-full mt-2 flex-shrink-0"></span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{service.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400">{service.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <p className="text-lg mb-6">
                Гарантийными случаями во многих компаниях, занимающихся антикоррозийной
                обработкой, считаются такие явления, как сквозная коррозия. Однако, гарантия
                в нашей компании — это не просто формальность. Это ваше спокойствие и
                уверенность в защите вашего авто на долгие годы.
              </p>
              
              <motion.div 
                className="bg-gradient-to-r from-orange-50 to-green-50 dark:from-orange-900/20 dark:to-green-900/20 rounded-2xl p-8 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-xl font-medium mb-4">
                  Мы предоставляем гарантию до{" "}
                  <strong className="text-orangeDefault text-2xl">5 лет</strong>, и абсолютно неважно,
                  что произошло с покрытием и по какой причине.
                </p>
                <p className="text-lg">
                  Будь то ДТП, тяжёлое бездорожье, механические повреждения или воздействие времени — мы обновим
                  покрытие{" "}
                  <span className="font-bold text-green-600 dark:text-green-400 text-xl">
                    БЕСПЛАТНО
                  </span>{" "}
                  в течение гарантийного срока.
                </p>
              </motion.div>
              
              <p className="italic text-gray-600 dark:text-gray-400 text-center text-lg font-medium mt-8">
                Ровных дорог и мирного неба, дорогие читатели. Ждём вас.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
