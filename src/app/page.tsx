"use client";

import AutoPrice from "./glav/components/AutoPrice";
import AwesomeServices from "./glav/components/AwesomeServices";
import CarouselSection from "./glav/components/Carousel";
import FloatingNavigation from "./glav/components/FloatingNavigation";
import Garanty from "./glav/components/Garanty";
import MainVideoPlayer from "./glav/components/MainVideoPlayer";
import VideoCarousel from "./glav/components/VideoCarousel";
import YandexMap from "./glav/components/map/Map";
import PriceCardList from "./glav/components/PriceList";
import TechProcces from "./glav/components/TechProcces";
import Marquee from "react-fast-marquee";
import AntiCorrosionSection from "./glav/components/AntiCorrosionSection";

export default function GlavPage() {
  return (
    <div
      className="min-h-screen"
    >
      <div className="relative overflow-hidden">
        <FloatingNavigation />
        <main className="flex-1 relative z-10">
          <AwesomeServices id="hero" />
          <div className="bg-[url(public/bgfon.png)]">
            <AntiCorrosionSection />
            <AutoPrice id="auto-price" />
          </div>
          <VideoCarousel />
          <TechProcces id="tech-process" />
          <Garanty id="garanty" />
          <MainVideoPlayer />
          <CarouselSection id="reviews" />
          <PriceCardList id="prices" />
          <YandexMap id="map" />
        </main>
      </div>
    </div>
  );
}
