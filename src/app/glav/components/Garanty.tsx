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
        <div className="bg-white dark:bg-gray-50 rounded-2xl shadow-2xl p-8 lg:p-12 max-w-8xl mx-auto">
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
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl text-gray-900 dark:text-gray-900 mb-0">
              Гарантия
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-600 mt-2 max-w-2xl mx-auto">
            Надёжная защита вашего автомобиля с гарантией до 5 лет
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
              Максимальный срок гарантии на антикоррозийную обработку
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-900">Бесплатно</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-600">
              Все работы по восстановлению покрытия в гарантийный период
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
              <span>Подробнее о гарантийном обслуживании</span>
            </div>
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
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
                <GarantyTextBlock services={services} />
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
          <GarantyTextBlock services={services} />
        </motion.div>
        </div>
      </div>
    </section>
  );
}

function GarantyTextBlock({
  services,
}: {
  services: { title: string; description: string }[];
}) {
  return (
    <div className="prose prose-lg max-w-none text-gray-700 space-y-6 leading-relaxed">
      <p className="text-left text-xl mb-6">
        Что такое <strong style={{ color: "#EF9147" }}>ГАРАНТИЯ</strong> и для чего это нужно?
      </p>
      <p className="text-lg">
        Ни для кого не секрет, что в нашем мире нет ничего вечного. Антикоррозийная
        обработка, даже если она произведена по технологии и качественными материалами,
        не исключение. Однако, существует способ значительно продлить срок службы
        антикоррозийного покрытия и, как следствие, кузова автомобиля. Этот способ —{" "}
        <strong style={{ color: "#EF9147" }}>ГАРАНТИЯ.</strong>
      </p>
      <p className="text-lg">
        ГАРАНТИЯ – комплекс мероприятий, направленных на поддержание целостности
        антикоррозийного покрытия в скрытых полостях и на открытых поверхностях кузова,
        а также на своевременное устранение недостатков.
      </p>

      <h3 className="text-xl font-bold mb-6" style={{ color: "#EF9147" }}>
        В гарантийное обслуживание входят:
      </h3>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-gray-100 rounded-xl p-6 flex items-start gap-4"
          >
            <span
              className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
              style={{ background: "#007478" }}
            />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{service.title}</h4>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-lg mb-6">
        Гарантийными случаями во многих компаниях, занимающихся антикоррозийной
        обработкой, считаются такие явления, как сквозная коррозия. Однако,{" "}
        <strong>гарантия в нашей компании</strong> — это не просто формальность. Это
        ваше спокойствие и уверенность в защите вашего авто на долгие годы.
      </p>

      <div className="bg-gray-100 rounded-2xl p-8 text-center">
        <p className="text-xl font-medium mb-4">
          Мы предоставляем гарантию до{" "}
          <strong style={{ color: "#EF9147" }}>5 лет</strong>, и абсолютно неважно, что
          произошло с покрытием и по какой причине.
        </p>
        <p className="text-lg">
          Будь то ДТП, тяжёлое бездорожье, механические повреждения или воздействие
          времени — мы обновим покрытие{" "}
          <strong style={{ color: "#EF9147" }}>БЕСПЛАТНО</strong> в течение
          гарантийного срока.
        </p>
      </div>

      <p className="italic text-gray-600 text-center text-lg font-medium mt-8">
        Ровных дорог и мирного неба, дорогие читатели. Ждём вас.
      </p>
    </div>
  );
}
