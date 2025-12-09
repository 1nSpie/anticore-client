import React, { useState } from "react";
import ReactPlayer from "react-player";

export default function MainVideoPlayer() {
  const [videoError, setVideoError] = useState(false);
  const baseApiUrl =
    process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:4444";

  const handleVideoError = () => {
    setVideoError(true);
  };

  if (videoError) {
    return (
        <div className="mx-auto max-w-[85rem] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 bg-transparent">
          <div className=" rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Видео временно недоступно
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Пожалуйста, попробуйте позже или обновите страницу
            </p>
            <button
              onClick={() => setVideoError(false)}
              className=" bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
    );
  }

  return (
    <div className="bg-transparent">
      <section
        className="mx-auto max-w-[85rem] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 section-surface rounded-3xl"
      >
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Наша работа в действии
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Посмотрите, как мы профессионально выполняем кузовные работы
          </p>
        </div>

        {/* Video Player Container */}
        <div className="relative">
          <div className="aspect-video rounded-lg overflow-hidden shadow-2xl">
            <ReactPlayer
              src={`${baseApiUrl}/video/video.mp4`}
              width={"auto"}
              height={"auto"}
              controls
              onError={handleVideoError}
            />
          </div>

          {/* Video Description */}
          <div className="mt-8 text-center">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Профессиональные кузовные работы
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Качественный результат
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Соблюдение сроков
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
