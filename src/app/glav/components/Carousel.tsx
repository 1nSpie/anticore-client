"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../shadcn/carousel";
import Image from "next/image";
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { siteImageUrl } from "@/lib/media";

const carousel1 = siteImageUrl("carousel/carousel1-Photoroom.png");
const carousel2 = siteImageUrl("carousel/carousel2.png");
const carousel3 = siteImageUrl("carousel/carousel3.png");
const carousel4 = siteImageUrl("carousel/carousel4.png");
const carousel5 = siteImageUrl("carousel/carousel5.png");
const carousel6 = siteImageUrl("carousel/carousel6.png");
const carousel7 = siteImageUrl("carousel/carousel7.png");
const carousel8 = siteImageUrl("carousel/carousel8.png");
const carousel9 = siteImageUrl("carousel/carousel9.png");
const carousel10 = siteImageUrl("carousel/carousel10.png");
const carousel11 = siteImageUrl("carousel/carousel11.png");
const about1 = siteImageUrl("carousel/about1.svg");
const about2 = siteImageUrl("carousel/about2.svg");
const about3 = siteImageUrl("carousel/about3.svg");
const about4 = siteImageUrl("carousel/about4.svg");

const slides = [
  {
    id: 1,
    title: "Dugla profi BPM 482",
    content:
      "Мастика на битумно-восковой основе применяется для антикоррозионной, антигравийной и шумоизоляционной защиты днища автомобиля, колёсных арок",
    img: carousel1,
  },
  {
    id: 2,
    title: "Master Wax",
    content:
      "Преобразователь ржавчины- это эффективное средство для удаления ржавчины на основе фосфорорганических комплексов",
    img: carousel2,
  },
  {
    id: 3,
    title: "Dugla profi ML",
    content:
      "Водовытесняющий антикоррозионный состав на масляно-восковой основе с повышенной проникающей способностью. Останавливает начавшийся процесс коррозии",
    img: carousel3,
  },
  {
    id: 4,
    title: "Dinitrol 4010",
    content:
      "Антикор для моторного отсека. Создает прочную и прозрачную не боится кислот, щелочей и тд. Защищает от грязи, солей и коррозии",
    img: carousel4,
  },
  {
    id: 5,
    title: "Dugla profi W 2005",
    content:
      "Легкопроникающий антикоррозионный состав на масляно-восковой основе. Заполняет все зазоры, глубоко проникает в микротрещины, пропитывает рыхлую пленку уже имеющихся очагов коррозии",
    img: carousel5,
  },
  {
    id: 6,
    title: "Dinitrol 479",
    content:
      "Защитный состав из синтетической резины. Обеспечивает шумоизоляцию и препятствует коррозии",
    img: carousel6,
  },
  {
    id: 7,
    title: "Prim ML",
    content:
      "Предохраняет скрытые полости автомобиля от коррозии и химических реагентов",
    img: carousel7,
  },
  {
    id: 8,
    title: "Dinitrol Penetrant LT",
    content:
      "Инновационный антикоррозийный состав для труднодоступных полостей. Предотвращает появление и замедляет развитие имеющихся очагов коррозии",
    img: carousel8,
  },
  {
    id: 9,
    title: "Prim Антишум",
    content:
      "Предохраняет корпус авто от коррозии, воздействия химичесикх реагентов. Обеспечивает шумоизоляцию и дополнительную теплоизоляцию",
    img: carousel9,
  },
  {
    id: 10,
    title: "Dinitrol ML",
    content:
      "Останавливает процесс развития коррозии за счет глубокого пропитвыания ржавчины. Водовытесняющий состав",
    img: carousel10,
  },
  {
    id: 11,
    title: "Prim Body",
    content:
      "Предохраняет корпус днища от коррозии, воздействия химичесиких реагентов. Обеспечивает шумоизоляцию и дополнительную теплоизоляцию",
    img: carousel11,
  },
];

const icons = [
  {
    id: 1,
    description: "Лазерная очистка металла",
    icon: about1,
  },
  {
    id: 2,
    description: "Гибкая система скидок",
    icon: about2,
  },
  {
    id: 3,
    description: "Сертифицированные материалы",
    icon: about3,
  },
  {
    id: 4,
    description: "Бесплатный трансфер",
    icon: about4,
  },
];

type Props = {
  id: string;
};

export default function CarouselSection({ id }: Props) {
  const plugin = useRef(
    Autoplay({
      delay: 2000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: true,
    })
  );

  return (
    <section
      id={id}
      className="relative py-16 lg:py-20 overflow-hidden"
      style={{ backgroundImage: `url(${siteImageUrl("bg/bgfon.png")})` }}
    >
      <div className="max-w-[85rem] mx-auto h-auto px-6 sm:px-6 lg:px-12">
        {/* Заголовок */}
        <div className="rounded-xl text-black dark:text-white block max-w-[85rem] mx-auto text-center pb-10">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
            Мы обрабатываем только проверенными материалами
          </h2>
          <p className="text-black dark:text-white">
            И делаем все только по технологическим картам производителей
          </p>
        </div>

        {/* Контейнер для карусели и блока информации */}
        <div className="grid grid-cols-1 items-center gap-12 section-surface rounded-3xl p-8 ">
          {/* Карусель */}
          <Carousel
            plugins={[plugin.current]}
            opts={{
              align: "start",
              loop: true,
            }}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={() => plugin.current.play}
            className="relative"
          >
            <CarouselContent className="pl-0">
              {slides.map((slide, key) => (
                <CarouselItem
                  key={key}
                  className="md:basis-1/2 lg:basis-1/3 w-full shrink-0"
                >
                  <div className="h-full border-orange-600 border-2 p-2 bg-white rounded-2xl hover:shadow-lg transition-shadow duration-300">
                    <div className="flex flex-col items-center h-full text-center">
                      <Image
                        src={slide.img}
                        alt={slide.title}
                        width={150}
                        height={150}
                        className="w-35 h-35 object-cover mb-4 fill-white"
                      />
                      <div className="flex flex-col text-center h-fit">
                        <span className="text-xl font-bold text-orange-500 transition-colors duration-300 ">
                          {slide.title}
                        </span>
                        <span className="text-sm text-black transition-colors duration-300 leading-relaxed">
                          {slide.content}
                        </span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious variant={"ghost"} className="bg-white text-black border"/>
            <CarouselNext variant={"ghost"} className="bg-white text-black border"/>
          </Carousel>
          <div className="w-full">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {icons.map((el) => (
                <div
                  key={el.id}
                  className="flex flex-col items-center text-center"
                >
                  {/* Изображение */}
                  <Image
                    itemType="svg"
                    src={el.icon}
                    alt={el.description}
                    width={10000}
                    height={10000}
                    className="w-[500%] object-cover mb-2"
                  />
                  {/* Текст */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
