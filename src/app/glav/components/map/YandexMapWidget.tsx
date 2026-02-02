import Link from "next/link";

// ID виджетов отзывов для разных локаций
const LOCATION_REVIEW_IDS: { [key: string]: string } = {
  "Жуковский": "211399234420", // ID для Жуковского
  "Коломна": "211399234420", // TODO: Заменить на реальный ID для Коломны
};

const LOCATION_MAP_LINKS: { [key: string]: string } = {
  "Жуковский": "https://yandex.ru/maps/org/avankor/211399234420/",
  "Коломна": "https://yandex.ru/maps/org/avankor/211399234420/", // TODO: Заменить на реальную ссылку для Коломны
};

interface YandexMapWidgetProps {
  location?: string;
}

export const YandexMapWidget = ({ location = "Жуковский" }: YandexMapWidgetProps) => {
  const reviewId = LOCATION_REVIEW_IDS[location] || LOCATION_REVIEW_IDS["Жуковский"];
  const mapLink = LOCATION_MAP_LINKS[location] || LOCATION_MAP_LINKS["Жуковский"];

  return (
      <div className="flex justify-center items-start w-full px-4 mb-10">
        <div className="w-full max-w-4xl">
          <div className=" backdrop-blur-sm rounded-3xl p-8 shadow-2xl border from-[#F87346CC] to-[#FF5347CC] hover:shadow-3xl transition-all duration-500"
          style={{background: "linear-gradient(180deg, rgba(251, 114, 72, 0.7) 24.52%, rgba(255, 83, 71, 0.7) 61.06%)",}}>
            <div className="mb-6">
            </div>

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
                  key={reviewId} // key для перезагрузки iframe при смене локации
                  className="w-full h-full"
                  src={`https://yandex.ru/maps-reviews-widget/${reviewId}?comments`}
                  title={`Отзывы о АванКор - ${location}`}
                  allowFullScreen
                  style={{
                    border: "none",
                    boxSizing: "border-box",
                  }}
                />

                {/* Enhanced Link Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/20 to-transparent p-4">
                  <Link
                    href={mapLink}
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
          </div>
        </div>
      </div>

  );
};
