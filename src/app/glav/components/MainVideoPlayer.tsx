"use client";

import { Button } from "@/shadcn/button";
import React, { useState } from "react";
import ReactPlayer from "react-player";
import { CallbackModal } from "src/app/ui/ui/CallbackModal";

const BENEFITS = [
  "Профессиональные кузовные работы",
  "Качественный результат",
  "Соблюдение сроков",
];

const VIDEO_CARD_STYLE = {
  boxShadow: "5px 25px 50px -12px #FF5347",
  border: "2px solid rgba(255, 83, 71, 0.4)",
  borderRadius: "10px",
};

export default function MainVideoPlayer() {
  const [videoError, setVideoError] = useState(false);
  const API_BASE_URL = process.env.NEXT_PUBLIC_S3_URL;

  const handleError = () => {
    setVideoError(true);
  };

  if (videoError) {
    return (
      <section
        className="relative py-16 sm:py-24 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url(/bgfon.png)" }}
      >
        <div className="mx-auto max-w-[1296px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-white/10 backdrop-blur p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Видео временно недоступно
            </h3>
            <p className="text-gray-600 mb-6">
              Пожалуйста, попробуйте позже или обновите страницу
            </p>
            <button
              onClick={() => setVideoError(false)}
              className="px-6 py-3 bg-gradient-to-r from-[#FF5347] to-[#EA5E33] text-white font-medium rounded-lg transition-all shadow-lg hover:opacity-90"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative py-16 sm:py-24 overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url(/bgfon.png)" }}
    >
      <div className="mx-auto max-w-[1296px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Наша работа в действии
          </h2>
          <p className="text-white text-lg max-w-2xl mx-auto">
            Посмотрите, как мы профессионально выполняем кузовные работы
          </p>
        </div>

        {/* Video Cards */}
        <div className="flex flex-col gap-6 sm:gap-8">
          <div
            className="relative w-full overflow-hidden bg-black rounded-[10px] aspect-video lg:h-[550px] lg:aspect-auto"
            style={VIDEO_CARD_STYLE}
          >
            <ReactPlayer
              src={`${API_BASE_URL}/video/video1.mp4`}
              controls
              width="100%"
              height="100%"
              onError={handleError}
              className="absolute top-0 left-0"
            />
          </div>

          <div
            className="relative w-full overflow-hidden bg-black rounded-[10px] aspect-video lg:h-[550px] lg:aspect-auto"
            style={VIDEO_CARD_STYLE}
          >
            <ReactPlayer
              src={`${API_BASE_URL}/video/video2.mp4`}
              controls
              width="100%"
              height="100%"
              onError={handleError}
              className="absolute top-0 left-0"
            />
          </div>
        </div>

        {/* Benefits List */}
        <ul className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-12 sm:mt-16">
          {BENEFITS.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-3 text-gray-700 text-base sm:text-lg"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#FF5347" }}
              />
              {item}
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <div className="text-center mt-12 sm:mt-16">
          <CallbackModal
            trigger={
              <Button
                type="button"
                className="inline-flex items-center justify-center text-white transition-all hover:opacity-95 hover:scale-[1.02] w-full max-w-[305px] h-[72px]"
                style={{
                  background: "linear-gradient(90deg, #EF9147 0%, #FF6B35 100%)",
                  borderRadius: 16,
                  boxShadow:
                    "0px 4px 6px -4px #0000004D, 0px 10px 15px -3px #FF5347CC",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: 25,
                  lineHeight: "24px",
                  letterSpacing: 0,
                  textAlign: "center",
                }}
              >
                Записаться
              </Button>
            }
          />
        </div>
      </div>
    </section>
  );
}
