// components/YandexMapWidget.tsx

import Link from "next/link";

export const YandexMapWidget = () => {
  return (
    <div className="flex justify-center items-start w-full px-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-500">
          {/* Reviews Header */}

          {/* Widget Container */}
          <div className="relative">
            <div
              className="relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
              style={{
                width: "100%",
                height: "600px",
              }}
            >
              <iframe
                className="w-full h-full"
                src="https://yandex.ru/maps-reviews-widget/211399234420?comments"
                title="Отзывы о АванКор"
                allowFullScreen
                style={{
                  border: "none",
                  boxSizing: "border-box",
                }}
              />

              {/* Enhanced Link Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/20 to-transparent p-4">
                <Link
                  href="  https://yandex.ru/maps/org/avankor/211399234420/  "
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:text-[#007478] dark:hover:text-[#00a2a6] transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Посмотреть на Яндекс Картах
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom CTA Section */}
          <div className="mt-6 text-center p-6 bg-gradient-to-r from-[#007478]/10 to-[#007478]/20 dark:from-[#007478]/20 dark:to-[#007478]/10 rounded-2xl border border-[#007478]/30 dark:border-[#007478]/20">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Станьте нашим клиентом!
            </h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Присоединяйтесь к сотням довольных клиентов АванКор
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="tel:+79932456882"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#007478] hover:bg-[#005a5e] dark:hover:bg-[#009a9f] text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Позвонить
              </Link>
              <Link
                href="#auto-price"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 text-[#007478] dark:text-[#00a2a6] font-semibold rounded-xl border-2 border-[#007478] hover:bg-[#007478]/10 dark:hover:bg-gray-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Рассчитать стоимость
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
