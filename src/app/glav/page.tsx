// app/glav/page.tsx
"use client";

import Herosection from "./components/Herosection";
import AutoPrice from "./components/AutoPrice";
import PriceCardList from "./components/PriceList";
import YandexMap from "./components/map/Map";
import CarouselSection from "./components/Carousel";
import TechProcces from "./components/TechProcces";
import NavbarHeroSection from "./components/NavbarHerosection";
import Garanty from "./components/Garanty";
import FloatingNavigation from "./components/FloatingNavigation";

import MainVideoPlayer from "./components/MainVideoPlayer";



export default function GlavPage() {
  return (
    <>
      <div className="block xl:hidden">
        <Herosection id='hero'/>
      </div>

      {/* Сайдбар */}

      {/* Floating Navigation */}
      <FloatingNavigation />

      {/* Основное содержимое */}
      <main className="flex-1">
        <NavbarHeroSection id='hero'/>
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
