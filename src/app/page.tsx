// app/glav/page.tsx
"use client";

import AutoPrice from "./glav/components/AutoPrice";
import CarouselSection from "./glav/components/Carousel";
import FloatingNavigation from "./glav/components/FloatingNavigation";
import Garanty from "./glav/components/Garanty";
import Herosection from "./glav/components/Herosection";
import MainVideoPlayer from "./glav/components/MainVideoPlayer";
import YandexMap from "./glav/components/map/Map";
import NavbarHeroSection from "./glav/components/NavbarHerosection";
import PriceCardList from "./glav/components/PriceList";
import TechProcces from "./glav/components/TechProcces";

export default function GlavPage() {
  return (
    <>
      <div className="block xl:hidden">
        <Herosection id="hero" />
      </div>

      {/* Сайдбар */}

      {/* Floating Navigation */}
      <FloatingNavigation />

      {/* Основное содержимое */}
      <main className="flex-1">
        <NavbarHeroSection id="hero" />
        <AutoPrice id="auto-price" />
        <TechProcces id="tech-process" />
        <Garanty id="garanty" />
        <MainVideoPlayer />

        <CarouselSection id="reviews" />
        <PriceCardList id="prices" />
        <YandexMap id="map" />
      </main>
    </>
  );
}
