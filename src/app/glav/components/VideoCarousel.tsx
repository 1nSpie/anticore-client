"use client";

import { useState, useEffect, useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shadcn/carousel";
import ReactPlayer from "react-player";
import Autoplay from "embla-carousel-autoplay";
import { PlayCircle, PauseCircle } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_S3_URL;

const VIDEOS = [
  {
    id: 1,
    url: `${API_BASE_URL}/video/shorts/shorts1.mp4`,
    title: "Удаление ржавчины ЛАЗЕРОМ. Ржавая Toyota Land Cruiser 200",
  
  },
  {
    id: 2,
    url: `${API_BASE_URL}/video/shorts/shorts2.mp4`,
    title: "Лазерное удаление ржавчины",
   
  },
  {
    id: 3,
    url: `${API_BASE_URL}/video/shorts/shorts3.mp4`,
    title: "Антикор Китайского электропикапа Changan Hunter 2024",
   
  },
  {
    id: 4,
    url: `${API_BASE_URL}/video/shorts/shorts4.mp4`,
    title: "Антикор Lada Granta",
    
  },
  {
    id: 5,
    url: `${API_BASE_URL}/video/shorts/shorts5.mp4`,
    title: "Антикор Dodge Ram",
   
  },
  {
    id: 6,
    url: `${API_BASE_URL}/video/shorts/shorts6.mp4`,
    title: "Антикор Chery Tiggo 8",
   
  },
  {
    id: 7,
    url: `${API_BASE_URL}/video/shorts/shorts7.mp4`,
    title: "Антикор Tank 300",
    
  },
];

export default function VideoCarousel() {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const plugin = useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: true,
    })
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePlay = (index: number) => {
    setPlayingIndex(index);
  };

  const handlePause = () => {
    setPlayingIndex(null);
  };


  if (!isMounted) {
    return null;
  }

  return (
    <section className="py-12 lg:py-20 bg-[url(public/videocarouselbg.png)] bg-cover bg-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Видео наших работ
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Посмотрите реальные примеры нашей работы
          </p>
        </div>

        <div className="relative">
          <Carousel
            className="w-full mx-auto"
            plugins={[plugin.current]}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-4">
              {VIDEOS.map((video, index) => (
                <CarouselItem
                  key={video.id}
                  className="
                    pl-4 
                    basis-full         
                    sm:basis-1/2       
                    lg:basis-1/3       
                  "
                >
                  <div className="relative group p-2">
                    <div
                      className="
                        w-full
                        aspect-[9/16]   
                        max-w-[330px]    
                        sm:max-w-[380px] 
                        lg:max-w-[430px] 
                        mx-auto
                        rounded-xl 
                        overflow-hidden 
                        bg-black 
                        shadow-2xl
                        transition-all 
                        duration-300
                        group-hover:shadow-2xl
                        relative
                      "
                    >
                      {/* Контейнер видео */}
                      <div className="relative w-full h-full">
                        <ReactPlayer
                          src={video.url}
                          width="100%"
                          height="100%"
                          playing={playingIndex === index}
                          controls
                          onPlay={() => handlePlay(index)}
                          onPause={handlePause}
                          onEnded={handlePause}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                          }}
                        />
                        
                        
                      </div>
                    </div>

                    <div className="mt-4 px-2">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white truncate">
                          {video.title}
                        </h3>
                      </div>
                  
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="hidden lg:block">
              <CarouselPrevious
                variant="ghost"
                className="
                  bg-orange-500 
                   hover:bg-orange-600 
                  text-white
                  backdrop-blur-sm
                  transition-all
                  z-10
                "
              />
              <CarouselNext
                variant="ghost"
                className="
                   bg-orange-500 
                  hover:bg-orange-600 
                  text-white
                  backdrop-blur-sm
                  transition-all
                  z-10
                "
              />
            </div>

            {/* Кнопки для мобильных */}
            <div className="flex justify-center gap-4 mt-6 lg:hidden">
              <CarouselPrevious
                variant="ghost"
                className="
                  border-2 border-white/30 
                  bg-black/70 
                  hover:bg-black/90 
                  hover:border-white
                  text-white
                  w-10 h-10
                "
              />
              <CarouselNext
                variant="ghost"
                className="
                  border-2 border-white/30 
                  bg-black/70 
                  hover:bg-black/90 
                  hover:border-white
                  text-white
                  w-10 h-10
                "
              />
            </div>
          </Carousel>
        </div>

    
      </div>
    </section>
  );
}