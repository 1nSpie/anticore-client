import AutoPrice from "./glav/components/AutoPrice";
import CarouselSection from "./glav/components/Carousel";
import FloatingNavigation from "./glav/components/FloatingNavigation";
import Garanty from "./glav/components/Garanty";
import PriceCardList from "./glav/components/PriceList";
import TechProcces from "./glav/components/TechProcces";
import AntiCorrosionSection from "./glav/components/AntiCorrosionSection";
import NewStart from "./glav/components/NewStart";
import {
  LazyMainVideoPlayer,
  LazyVideoCarousel,
  LazyYandexMap,
} from "./glav/components/LazySections";
import { siteImageUrl } from "@/lib/media";

export default function GlavPage() {
  return (
    <div
      className="min-h-screen"
    >
      <div className="relative overflow-hidden">
        <FloatingNavigation />
        <main className="flex-1 relative z-10">
          <NewStart />
          <div style={{ backgroundImage: `url(${siteImageUrl("bg/bgfon.png")})` }}>
            <AntiCorrosionSection />
            <AutoPrice id="auto-price" />
          </div>
          <LazyVideoCarousel id="video-carousel"/>
          <TechProcces id="tech-process" />
          <Garanty id="garanty" />
          <LazyMainVideoPlayer id="main-video"/>
          <CarouselSection id="reviews" />
          <PriceCardList id="prices" />
          <LazyYandexMap id="map" />
        </main>
      </div>
    </div>
  );
}
