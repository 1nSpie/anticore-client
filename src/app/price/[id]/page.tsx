"use client";

import { notFound } from "next/navigation";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon,
  CheckIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";
import { services } from "../components/servicesData";
import { ServiceStep, CarType } from "../components/types";
import Link from "next/link";
import FeedbackLine from "src/app/ui/ui/FeedbackLine";

interface PriceCalculatorProps {
  service: ServiceStep;
}

const PriceCalculator = ({ service }: PriceCalculatorProps) => {
  const [selectedCarType, setSelectedCarType] =
    useState<CarType>("До 4-х метров");

  const selectedPrice = service.prices.find(
    (p) => p.carType === selectedCarType
  )?.price;

  return (
    <div className="bg-gradient-to-br from-[#007478]/10 to-[#007478]/20 dark:from-[#007478]/20 dark:to-[#007478]/10 rounded-3xl p-8 shadow-xl border border-[#007478]/30 dark:border-[#007478]/20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#007478]/10 dark:bg-[#007478]/20 rounded-2xl mb-4">
          <CalculatorIcon className="w-8 h-8 text-[#007478] dark:text-[#00a2a6]" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Калькулятор стоимости
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Выберите тип автомобиля для расчета цены
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {service.prices.map((priceItem) => (
          <motion.button
            key={priceItem.carType}
            onClick={() => setSelectedCarType(priceItem.carType)}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
              selectedCarType === priceItem.carType
                ? "border-[#007478] bg-[#007478] text-white shadow-lg"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-[#007478] hover:shadow-md"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-sm font-medium">{priceItem.carType}</div>
            <div
              className={`text-xs mt-1 ${
                selectedCarType === priceItem.carType
                  ? "text-[#007478]/80"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {typeof priceItem.price === "number"
                ? `${priceItem.price.toLocaleString()} ₽`
                : priceItem.price}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-[#007478] "
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-[#007478] dark:text-[#00a2a6] mb-2">
              {typeof selectedPrice === "number"
                ? `${selectedPrice.toLocaleString()} ₽`
                : selectedPrice}
            </div>
            <div className="text-gray-600 dark:text-gray-300 mb-4">
              за {selectedCarType.toLowerCase()}
            </div>
            <div className="flex space-x-3">
              <Link
                href="tel:+79932456882"
                className="flex-1 bg-[#007478] hover:bg-[#005a5e] dark:hover:bg-[#009a9f] text-white py-3 rounded-xl font-medium transition-colors text-center"
              >
                Записаться
              </Link>
              <Link
                href="/#auto-price"
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
              >
                Консультация
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const ProcessStep = ({
  step,
  index,
  isActive,
}: {
  step: string;
  index: number;
  isActive: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: isActive ? 1 : 0.4, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-start space-x-4 p-4 rounded-2xl transition-all duration-500 ${
        isActive
          ? "bg-[#007478]/10 dark:bg-[#007478]/20 border-2 border-[#007478]/30 dark:border-[#007478]/20 shadow-md"
          : "bg-gray-50 dark:bg-gray-800/50"
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
          isActive
            ? "bg-[#007478] text-white"
            : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
        }`}
      >
        {isActive ? <CheckIcon className="w-5 h-5" /> : index + 1}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm font-medium transition-colors duration-300 ${
            isActive
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {step}
        </p>
      </div>
    </motion.div>
  );
};

const ProcessVisualizer = ({ steps }: { steps: string[] }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Процесс обработки
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Пошаговая демонстрация работы
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#007478] to-[#005a5e] mx-auto rounded-full mt-4" />
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <ProcessStep
            key={index}
            step={step}
            index={index}
            isActive={index <= activeStep}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= activeStep
                  ? "bg-[#007478]"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);

  const packageId = parseInt(params.id as string, 10);
  const service = services.find((item) => item.id === packageId);

  if (!service) {
    notFound();
  }

  const currentService = service.content[selectedServiceIndex];

  // Color schemes for different service packages
  const getServiceColorScheme = (index: number) => {
    const schemes = [
      {
        bg: "from-[#007478]/10 to-[#007478]/20 dark:from-[#007478]/20 dark:to-[#007478]/10",
        border: "border-[#007478]/30 dark:border-[#007478]/20",
        text: "text-[#007478] dark:text-[#00a2a6]",
      },
      {
        bg: "from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10",
        border: "border-emerald-200/50 dark:border-emerald-700/30",
        text: "text-emerald-600 dark:text-emerald-400",
      },
      {
        bg: "from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10",
        border: "border-blue-200/50 dark:border-blue-700/30",
        text: "text-blue-600 dark:text-blue-400",
      },
      {
        bg: "from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10",
        border: "border-purple-200/50 dark:border-purple-700/30",
        text: "text-purple-600 dark:text-purple-400",
      },
    ];
    return schemes[index % schemes.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-gray-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-900/20 min-h-screen"
    >
      {/* Обернул декоративные элементы в контейнер с hidden overflow */}
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-100/30 to-transparent dark:from-teal-900/20 dark:to-transparent" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12">
          <div className="w-64 h-64 bg-gradient-to-br from-teal-200/20 to-teal-300/20 dark:from-teal-700/20 dark:to-teal-600/20 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12">
          <div className="w-48 h-48 bg-gradient-to-br from-blue-200/20 to-blue-300/20 dark:from-blue-700/20 dark:to-blue-600/20 rounded-full blur-3xl" />
        </div>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <button
                onClick={() => router.back()}
                className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-[#007478] dark:hover:text-[#00a2a6] transition-colors mb-8 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Назад к услугам</span>
              </button>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#007478]/10 dark:bg-[#007478]/20 backdrop-blur-sm rounded-full mb-8"
              >
                <CheckIcon className="w-5 h-5 text-[#007478] dark:text-[#00a2a6]" />
                <span className="text-sm font-semibold text-[#007478] dark:text-[#00a2a6]">
                  Профессиональная защита
                </span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-[#007478] dark:from-white dark:via-gray-100 dark:to-[#00a2a6] bg-clip-text text-transparent leading-tight mb-6">
                {service.title}
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Защитите свой автомобиль от коррозии с помощью наших комплексных
                решений. Современные технологии и материалы для максимальной
                защиты.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Service Selector */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Выберите пакет услуг
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#007478] to-[#005a5e] mx-auto rounded-full mb-6" />
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Каждый пакет разработан для определенных потребностей и бюджета
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {service.content.map((serviceItem, index) => {
                const colorScheme = getServiceColorScheme(index);
                return (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedServiceIndex(index)}
                    className={`relative p-6 rounded-3xl border-2 transition-all duration-300 text-left group overflow-hidden ${
                      selectedServiceIndex === index
                        ? "border-[#007478] bg-[#007478] text-white shadow-xl transform scale-105"
                        : `bg-gradient-to-br ${colorScheme.bg} ${colorScheme.border} border text-gray-700 dark:text-gray-200 hover:shadow-lg hover:transform hover:scale-102`
                    }`}
                    whileHover={{
                      scale: selectedServiceIndex === index ? 1.05 : 1.02,
                    }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent rounded-full -translate-y-12 translate-x-12" />

                    <h3 className="text-lg font-bold mb-2 relative z-10">
                      {serviceItem.name}
                    </h3>
                    <p
                      className={`text-sm mb-4 relative z-10 ${
                        selectedServiceIndex === index
                          ? "text-white/90"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {serviceItem.steps.length} этапов обработки
                    </p>
                    <div className="relative z-10">
                      <span
                        className={`text-xl font-bold ${
                          selectedServiceIndex === index
                            ? "text-white"
                            : colorScheme.text
                        }`}
                      >
                        от{" "}
                        {typeof serviceItem.prices[0].price === "number"
                          ? serviceItem.prices[0].price.toLocaleString()
                          : serviceItem.prices[0].price}{" "}
                        ₽
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                key={selectedServiceIndex}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ProcessVisualizer steps={currentService.steps} />
              </motion.div>

              <motion.div
                key={`calc-${selectedServiceIndex}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <PriceCalculator service={currentService} />
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom CTA Section */}
      <FeedbackLine />
    </motion.div>
  );
}