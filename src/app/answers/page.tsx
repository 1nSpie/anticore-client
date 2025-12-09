"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import FeedbackLine from "../ui/ui/FeedbackLine";

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function AnswersPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "Как часто нужно делать антикоррозийную обработку?",
      answer:
        "Рекомендуется проводить антикоррозийную обработку каждые 2-3 года или при пробеге 30-40 тысяч километров. Однако частота может варьироваться в зависимости от условий эксплуатации автомобиля, климата и качества дорог.",
    },
    {
      id: 2,
      question: "Сколько времени занимает обработка?",
      answer:
        "Полная антикоррозийная обработка занимает от 4 до 8 часов в зависимости от типа автомобиля и объема работ. Обработка скрытых полостей — 2-3 часа, днища и порогов — 3-4 часа, комплексная обработка — до 8 часов.",
    },
    {
      id: 3,
      question: "Можно ли ездить на машине сразу после обработки?",
      answer:
        "После обработки рекомендуется подождать 2-4 часа до полного высыхания состава. В это время можно ездить, но следует избегать агрессивной езды, мойки и попадания в глубокие лужи первые 24 часа.",
    },
    {
      id: 4,
      question: "Какую гарантию вы предоставляете?",
      answer:
        "Мы предоставляем гарантию на материалы и работы сроком от 1 до 3 лет в зависимости от типа обработки. Гарантия покрывает качество нанесения защитного покрытия и его эффективность при соблюдении рекомендаций по эксплуатации.",
    },
    {
      id: 5,
      question: "Нужна ли специальная подготовка автомобиля?",
      answer:
        "Желательно помыть автомобиль перед обработкой, особенно днище. Мы также проводим дополнительную очистку и обезжиривание поверхностей перед нанесением защитных составов. Бак должен быть заправлен не более чем на половину.",
    },
    {
      id: 6,
      question: "Какие материалы вы используете?",
      answer:
        "Мы работаем только с проверенными материалами ведущих производителей: Tectyl, Dinitrol, Body 950, Rust Stop. Все составы имеют сертификаты качества и рекомендованы автопроизводителями.",
    },
    {
      id: 7,
      question: "Влияет ли обработка на гарантию автомобиля?",
      answer:
        "Антикоррозийная обработка не влияет на заводскую гарантию автомобиля, если она выполнена в соответствии с требованиями производителя. Мы используем только разрешенные материалы и методы обработки.",
    },
    {
      id: 8,
      question: "Можно ли обрабатывать автомобиль зимой?",
      answer:
        "Обработку можно проводить круглый год при температуре не ниже +5°C. Зимой особенно важно тщательно очистить днище от соли и реагентов. В отапливаемом боксе работы возможны при любой погоде.",
    },
    {
      id: 9,
      question: "Что входит в комплексную обработку?",
      answer:
        "Комплексная обработка включает: защиту скрытых полостей (пороги, лонжероны, стойки), обработку днища автомобиля, защиту колесных арк, обработку моторного отсека и нанесение защитных составов на сварные швы.",
    },
    {
      id: 10,
      question: "Как понять, что машине нужна обработка?",
      answer:
        "Признаки необходимости обработки: появление ржавчины на кузове, возраст автомобиля более 2 лет, эксплуатация в агрессивных условиях (соленые дороги, высокая влажность), отсутствие предыдущей антикоррозийной обработки.",
    },
  ];

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <motion.div
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      transition={{ type: "spring", duration: 0.5 }}
      className="
  min-h-screen
  relative
  overflow-hidden
"
      style={{
        background:
          "radial-gradient(900px circle at 20% 18%, rgba(0, 148, 151, 0.12), transparent 55%), radial-gradient(1100px circle at 80% 12%, rgba(15, 23, 42, 0.12), transparent 60%), linear-gradient(180deg, rgba(13, 22, 36, 0.94), rgba(13, 22, 36, 0.82))",
      }}
    >
      <div className="relative overflow-hidden lg:pt-10 pt-20">
        <section className="relative max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto section-surface rounded-3xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl lg:leading-tight text-white">
              Ответы на частые вопросы
            </h1>
            <p className="mt-4 md:text-lg text-gray-200 max-w-3xl mx-auto">
              Здесь собраны ответы на самые популярные вопросы об
              антикоррозийной обработке автомобилей
            </p>
          </div>

          {/* FAQ List */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="section-surface rounded-2xl shadow-lg border border-white/5 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-white pr-4">
                      {faq.question}
                    </h3>
                    <svg
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${
                        openFaq === faq.id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openFaq === faq.id && (
                    <div className="px-6 pb-4">
                      <div className="border-t border-white/5 pt-4">
                        <p className="text-gray-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Help Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="section-surface rounded-2xl p-6 text-center shadow-lg border border-white/5">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-teal-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Телефонная консультация
              </h4>
              <p className="text-gray-300 text-sm">
                Получите ответы на вопросы по телефону в рабочее время
              </p>
            </div>

            <div className="section-surface rounded-2xl p-6 text-center shadow-lg border border-white/5">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-teal-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Онлайн-чат
              </h4>
              <p className="text-gray-300 text-sm">
                Быстрые ответы в мессенджерах и на сайте
              </p>
            </div>

            <div className="section-surface rounded-2xl p-6 text-center shadow-lg border border-white/5">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-teal-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                Личная консультация
              </h4>
              <p className="text-gray-300 text-sm">
                Приезжайте к нам для подробной консультации и осмотра авто
              </p>
            </div>
          </div>
        </section>
      </div>
      <FeedbackLine />
    </motion.div>
  );
}
