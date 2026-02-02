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
    <section
      id={id}
      className="relative py-16 lg:py-20 overflow-hidden min-h-[600px]"
      style={{
        backgroundImage: "url(/videocarouselbg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <div className="relative max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Белая карточка контента */}
        <div className="bg-white dark:bg-gray-50 rounded-2xl shadow-2xl p-8 lg:p-12 max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center items-center mb-4">
            <ShieldCheckIcon className="w-10 h-10 mr-3" style={{ color: "#EF9147" }} />
            <span className="text-3xl font-bold sm:text-4xl lg:text-5xl text-gray-900 dark:text-gray-900">
              ГАРАНТИЯ
            </span>
          </div>
          <motion.div 
            className="w-24 h-1 mx-auto mt-4 rounded-full"
            style={{ background: "linear-gradient(90deg, #EF9147 0%, #FF6B35 100%)" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          ></motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-600 mt-2 max-w-2xl mx-auto">
            До 5 лет. Ежегодная профилактика. Срок гарантии зависит от состояния авто до обработки.
          </p>
        </motion.div>

        {/* Key Features Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <motion.div 
            className="bg-gray-50 dark:bg-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            style={{ border: "2px solid #EF9147" }}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center mb-4">
              <ClockIcon className="w-8 h-8 mr-3" style={{ color: "#EF9147" }} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-900">До 5 лет</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-600">
              Ежегодная профилактика. Срок гарантии зависит от состояния авто до обработки.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-gray-50 dark:bg-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
            style={{ border: "2px solid #EF9147" }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold mr-3" style={{ color: "#EF9147" }}>✓</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-900">Все работы в гарантийный период</h3>
            </div>
            <p className="text-gray-900">
              Все работы по восстановлению, обновлению и обслуживанию покрытия в гарантийный период.
            </p>
          </motion.div>
        </div>

        {/* Mobile Accordion */}
        <div className="xl:hidden">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex justify-between items-center w-full px-6 py-5 text-left text-lg sm:text-xl font-semibold text-gray-900 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 transition-all duration-300"
            style={{ border: "2px solid #EF9147" }}
            aria-expanded={isOpen}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center">
              <ShieldCheckIcon className="w-6 h-6 mr-3" style={{ color: "#EF9147" }} />
              <span>Подробнее об ежегодной профилактике</span>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDownIcon className="w-6 h-6" style={{ color: "#EF9147" }} />
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
                <div className="p-6 bg-white rounded-xl shadow-lg" style={{ border: "2px solid #EF9147" }}>
                  {/* Mobile Content */}
                  <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none text-gray-900">
                    <p className="text-center mb-6">
                      Что такое{" "}
                      <strong style={{ color: "#EF9147" }}>ЕЖЕГОДНАЯ ПРОФИЛАКТИКА</strong> и для чего это нужно?
                    </p>
                    <p className="mb-4">
                      Ни для кого не секрет, что в нашем мире нет ничего вечного.
                      Антикоррозийная обработка, даже если она произведена по технологии
                      и качественными материалами, не исключение. Однако, существует способ
                      значительно продлить срок службы антикоррозийного покрытия и, как
                      следствие, кузова автомобиля. Способ этот –{" "}
                      <strong style={{ color: "#EF9147" }}>ЕЖЕГОДНАЯ ПРОФИЛАКТИКА.</strong>
                    </p>
                    <p className="mb-6">
                      ЕЖЕГОДНАЯ ПРОФИЛАКТИКА – комплекс мероприятий, направленных на поддержание целостности
                      антикоррозийного покрытия в скрытых полостях и на открытых поверхностях
                      кузова, а также на своевременное устранение недостатков.
                    </p>
                    
                    <h4 className="font-semibold mb-4" style={{ color: "#EF9147" }}>В ежегодную профилактику входят:</h4>
                    <div className="space-y-3 mb-6">
                      {services.map((service, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border-orange-600 border hover:shadow-lg transition-all duration-300"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: "#007478" }}></span>
                          <div>
                            <h5 className="font-medium text-gray-900 ">{service.title}</h5>
                            <p className="text-sm text-gray-600 ">{service.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <p className="mb-4">
                      Гарантийными случаями во многих компаниях, занимающихся антикоррозийной
                      обработкой, считается сквозная коррозия. Однако, ежегодная профилактика в нашей компании —
                      это не просто формальность. Это ваше спокойствие и уверенность в защите
                      вашего авто на долгие годы.
                    </p>
                    
                    <div className="p-4 rounded-lg mb-6" style={{ background: "linear-gradient(90deg, rgba(239,145,71,0.15) 0%, rgba(255,107,53,0.15) 100%)", border: "1px solid #EF9147" }}>
                      <p className="text-center font-medium">
                        Мы предоставляем ежегодную профилактику до <strong style={{ color: "#EF9147" }}>5 лет</strong>, и абсолютно неважно,
                        что произошло с покрытием и по какой причине. Будь то ДТП, тяжёлое
                        бездорожье, механические повреждения или воздействие времени — мы обновим
                        покрытие в течение гарантийного срока.
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
          <div>
            <div className="prose prose-lg dark:prose-invert max-w-none mx-auto text-gray-900 space-y-6 leading-relaxed">
              <p className="text-center text-xl mb-8 text-gray-900">
                Что такое{" "}
                <strong style={{ color: "#EF9147" }}>ЕЖЕГОДНАЯ ПРОФИЛАКТИКА</strong> и для чего это нужно?
              </p>
              <p className="text-lg">
                Ни для кого не секрет, что в нашем мире нет ничего вечного.
                Антикоррозийная обработка, даже если она произведена по технологии
                и качественными материалами, не исключение. Однако, существует способ
                значительно продлить срок службы антикоррозийного покрытия и, как
                следствие, кузова автомобиля. Этот способ —{" "}
                <strong style={{ color: "#EF9147" }}>ЕЖЕГОДНАЯ ПРОФИЛАКТИКА.</strong>
              </p>
              <p className="text-lg">
                ЕЖЕГОДНАЯ ПРОФИЛАКТИКА – комплекс мероприятий, направленных на поддержание целостности
                антикоррозийного покрытия в скрытых полостях и на открытых поверхностях
                кузова, а также на своевременное устранение недостатков.
              </p>
              
              <h3 className="text-xl font-bold text-center mb-8" style={{ color: "#EF9147" }}>В ежегодную профилактику входят:</h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    className="border-orange-600 border rounded-xl p-6 hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-4">
                      <span className="w-3 h-3 rounded-full mt-2 shrink-0" style={{ background: "#007478" }}></span>
                      <div>
                        <h4 className="font-semibold text-gray-900  mb-2">{service.title}</h4>
                        <p className="text-gray-600 ">{service.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <p className="text-lg mb-6">
                Гарантийными случаями во многих компаниях, занимающихся антикоррозийной
                обработкой, считаются такие явления, как сквозная коррозия. Однако, ежегодная профилактика
                в нашей компании — это не просто формальность. Это ваше спокойствие и
                уверенность в защите вашего авто на долгие годы.
              </p>
              
              <motion.div 
                className="bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 rounded-2xl p-8 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-xl font-medium mb-4">
                  Мы предоставляем ежегодную профилактику до{" "}
                  <strong className="text-2xl" style={{ color: "#EF9147" }}>5 лет</strong>, и абсолютно неважно,
                  что произошло с покрытием и по какой причине.
                </p>
                <p className="text-lg">
                  Будь то ДТП, тяжёлое бездорожье, механические повреждения или воздействие времени — мы обновим
                  покрытие в течение гарантийного срока.
                </p>
              </motion.div>
              
              <p className="italic text-gray-600 dark:text-gray-400 text-center text-lg font-medium mt-8">
                Ровных дорог и мирного неба, дорогие читатели. Ждём вас.
              </p>
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
