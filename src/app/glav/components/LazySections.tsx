"use client";

import dynamic from "next/dynamic";

// Тяжёлые секции ниже первого экрана: отдельные чанки, грузятся после основного бандла.
// ssr:false разрешён только в клиентском компоненте, поэтому обёртка вынесена сюда.
const placeholder = (minHeight: number) =>
  function Placeholder() {
    return <div style={{ minHeight }} aria-hidden />;
  };

export const LazyYandexMap = dynamic(() => import("./map/Map"), {
  ssr: false,
  loading: placeholder(600),
});
export const LazyVideoCarousel = dynamic(() => import("./VideoCarousel"), {
  ssr: false,
  loading: placeholder(600),
});
export const LazyMainVideoPlayer = dynamic(() => import("./MainVideoPlayer"), {
  ssr: false,
  loading: placeholder(600),
});
