'use client'

import { useState, useEffect, useRef } from "react";
import { Shield, Star, ClipboardCheck, MoveRight, PlayIcon, CheckCircle, Phone, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/shadcn/carousel";
import Autoplay from "embla-carousel-autoplay";

import car from './imgs/car.png';
import plakat from './imgs/plakat.png';
import logo from 'public/favicon.svg';
import garanty from './imgs/garanty.png';
import yandex from './imgs/yandex.png';
import endoscope from './imgs/endoscope.png';
import { CallbackModal } from "@/app/ui/ui/CallbackModal";

const carouselSlides = [
    { id: 1, image: plakat, title: "СКРЫТЫЕ ПОЛОСТИ ВЕРХ КУЗОВА" },
    { id: 2, image: plakat, title: "СКРЫТЫЕ ПОЛОСТИ НИЗ КУЗОВА" },
    { id: 3, image: plakat, title: "ОБРАБОТКА АРОК" },
];

export default function NewStart() {
    const [activeTitle, setActiveTitle] = useState(carouselSlides[0].title);
    const [api, setApi] = useState<any | null>();

    const plugin = useRef(
        Autoplay({
            delay: 4000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
            playOnInit: true,
        })
    );

    useEffect(() => {
        if (!api) return;
        const onSelect = () => {
            const index = api.selectedScrollSnap();
            setActiveTitle(carouselSlides[index]?.title || carouselSlides[0].title);
        };
        api.on('select', onSelect);
        onSelect();
        return () => {
            api.off('select', onSelect);
        };
    }, [api]);

    return (
        <div className="bg-[#3A767B] mt-15">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">

                {/* БЛОК КОНТАКТОВ — адаптивный: на десктопе колонка с номером+время и кнопка справа, на мобиле горизонтально/вертикально */}
                <div className="w-full flex justify-end mb-0 lg:mb-8">
                    <div className="rounded-2xl w-full sm:w-auto">
                        {/* Десктопная версия (lg и выше) */}
                        <div className="hidden lg:flex items-stretch gap-6">
                            {/* Левая часть: номер сверху, время снизу */}
                            <div className="flex flex-col justify-between text-white">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-[#F87346]" />
                                    <a href="tel:+79932456882" className="text-xl font-semibold underline">
                                        7 (993) 245 68 82
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 text-white/90 text-sm mt-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Работаем с 9:00 до 20:00</span>
                                </div>
                            </div>
                            {/* Кнопка на всю высоту левой части */}
                            <CallbackModal
                                trigger={
                                    <button className=" text-[#F87346] border-[#F87346] border-4 text font-bold py-4 px-4 sm:px-6 rounded-xl transition-all transform hover:scale-105 shadow-md whitespace-nowrap text-sm sm:text-base">
                                        ЗАКАЗАТЬ ЗВОНОК
                                    </button>
                                }
                            />
                        </div>

                        {/* Мобильная/планшетная версия (меньше lg) */}
                        <div className="lg:hidden">
                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
                                <CallbackModal
                                    trigger={
                                        <button className=" text-[#F87346] border-[#F87346] border-4 text font-bold py-4 px-4 sm:px-6 rounded-xl transition-all transform hover:scale-105 shadow-md whitespace-nowrap text-sm sm:text-base">
                                            ЗАКАЗАТЬ ЗВОНОК
                                        </button>
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Основной контент — колонки (без изменений) */}
                <div className="flex flex-col lg:flex-row justify-center gap-8 lg:gap-12">
                    {/* Левая колонка с текстом и кнопкой */}
                    <div className="flex-1 px-4 sm:px-6 md:px-8 lg:px-10 pt-6 sm:pt-8 lg:pt-10">
                        <div className="text-center lg:text-left">
                            <h2 className="text-xl sm:text-2xl md:text-3xl text-white font-light">
                                Антикоррозийная обработка автомобиля с <span className="font-extrabold">гарантией до 5 лет</span>
                            </h2>
                            <p className="text-xl sm:text-2xl md:text-3xl text-white mb-2 font-light">
                                Помогаем сохранить рыночную <span className="font-extrabold">стоимость авто на 15-25%</span>
                            </p>
                            <div className="mt-4 mb-6">
                                <div className="text-white px-4 py-0 sm:py-2 lg:py-12 rounded-full text-base sm:text-lg font-light">
                                    Договор гарантии + Возможность продления гарантии
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pb-8">
                                <div className="flex flex-col sm:flex-row items-center justify-center w-full sm:w-auto pt-1 gap-1 lg:mb-12">
                                    <PlayIcon width={16} height={16} className="text-[#F8734666] rotate-90 sm:rotate-0" fill="#F8734666" />
                                    <PlayIcon width={16} height={16} className="text-[#F87346] rotate-90 sm:rotate-0" fill="#F87346" />
                                </div>
                                <p className="text-white text-sm sm:text-base text-center sm:text-left">
                                    <strong>Ответьте на 5 вопросов,</strong> чтобы узнать стоимость обработки вашего авто + <br />
                                    <strong>Бесплатную экспресс-диагностику скрытых полостей</strong>
                                </p>
                            </div>

                            <div className="bg-white flex flex-col sm:flex-row items-center py-6 sm:py-8 px-4 sm:px-6 rounded-3xl w-full lg:w-fit gap-4">
                                <button
                                    onClick={() => window.open('https://mrqz.me/avankor', '_blank')}
                                    className="bg-[#F87346] hover:bg-[#ff6431] text-white font-bold py-3 px-6 sm:px-8 rounded-2xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 text-base sm:text-lg"
                                >
                                    <div className="flex flex-col items-start">
                                        <span>РАССЧИТАТЬ СТОИМОСТЬ</span>
                                        <span>И ЗАБРАТЬ ПОДАРОК</span>
                                    </div>
                                    <MoveRight className="w-8 h-8 sm:w-10 sm:h-10" />
                                </button>
                                <p className="text-black font-montserrat font-semibold text-sm sm:text-base leading-5 w-auto sm:w-56 ml-0 sm:ml-10 mr-0 sm:mr-5 mb-0 text-center sm:text-left">
                                    За прохождение рассчета дарим PDF-файл “Антикор: сейчас или когда сгниёт” + СКИДКА 10%
                                </p>
                                <Image alt="image-car" src={car} width={100} height={100} />
                            </div>
                        </div>
                    </div>

                    {/* ПРАВАЯ КОЛОНКА — статичный плакат на lg+, карусель на меньших экранах */}
                    <div className="flex flex-col items-center lg:items-start">
                        <p className="text-[#F87346] bg-white border-2 border-[#F87346] rounded px-2 py-1 text-base sm:text-lg md:text-[25px] font-black whitespace-nowrap" style={{ lineHeight: '39px' }}>
                            <span className="lg:hidden">{activeTitle}</span>
                            <span className="hidden lg:inline">СКРЫТЫЕ ПОЛОСТИ ВЕРХ КУЗОВА</span>
                        </p>

                        <div className="block lg:hidden w-full mt-2">
                            <Carousel
                                className="w-full max-w-md mx-auto"
                                plugins={[plugin.current]}
                                opts={{ align: "start", loop: true }}
                                setApi={setApi}
                            >
                                <CarouselContent>
                                    {carouselSlides.map((slide) => (
                                        <CarouselItem key={slide.id}>
                                            <div className="relative">
                                                <Image
                                                    alt={slide.title}
                                                    src={slide.image}
                                                    className="w-full h-auto border-4 border-orange-500 rounded-xl"
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>
                        </div>

                        <div className="hidden lg:block relative mt-2">
                            <Image
                                alt="plakat"
                                src={plakat}
                                className="w-full max-w-md lg:max-w-full h-auto border-4 sm:border-8 border-orange-500 rounded-xl sm:rounded-2xl"
                            />
                            <div className="flex justify-end -mt-8 sm:-mt-12 md:-mt-16">
                                <Image alt='logo' src={logo} className="w-12 sm:w-16 md:w-20 lg:w-24 h-auto mr-2 sm:mr-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Нижний блок с карточками (без изменений) */}
                <div className="mt-16 lg:mt-20 px-2 sm:px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 auto-rows-fr">
                        {/* Карточка 1 */}
                        <div className="bg-[#F87346]/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-white shadow-lg flex flex-col items-center justify-center text-center h-[280px] sm:h-auto sm:min-h-[270px]">
                            <div className="flex items-baseline justify-center text-[#F87346]">
                                <span className="text-6xl sm:text-7xl lg:text-9xl font-extrabold">6</span>
                                <span className="text-3xl sm:text-4xl lg:text-6xl font-extrabold">+ лет</span>
                            </div>
                            <div className="text-base sm:text-lg lg:text-xl font-medium mt-2">обрабатываем автомобили</div>
                        </div>

                        {/* Карточка 2 */}
                        <div className="relative bg-[#F87346]/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-white shadow-lg overflow-hidden flex flex-col h-[280px] sm:h-auto sm:min-h-[270px]">
                            <h3 className="font-bold text-base sm:text-lg lg:text-xl mb-3 flex items-center gap-2">
                                <Shield className="w-5 h-5 sm:w-6 sm:h-6" /> ГАРАНТИЯ ПРОЗРАЧНОСТИ:
                            </h3>
                            <ul className="space-y-2 text-xs sm:text-sm md:text-md flex-grow">
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" /> Договор + гарантийный талон</li>
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" /> Фотофиксация всего процесса</li>
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" /> Сертифицированные материалы</li>
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" /> Обучения мастеров по регламенту</li>
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" /> Безопасность для ЛКП и салона</li>
                            </ul>
                            <Image alt='garanty' src={garanty} className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 w-24 sm:w-28 lg:w-36 h-auto opacity-90" />
                        </div>

                        {/* Карточка 3 */}
                        <div className="bg-[#F87346]/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-white shadow-lg flex flex-col h-[280px] sm:h-auto sm:min-h-[270px]">
                            <h3 className="font-bold text-base sm:text-lg lg:text-xl mb-3 flex items-center gap-2">
                                <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-white" /> НАМ ДОВЕРЯЮТ:
                            </h3>
                            <ul className="space-y-2 text-xs sm:text-sm md:text-md flex-grow">
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5" /> Обработали более 4000+ авто</li>
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5" /> Оценка 5 на Яндекс</li>
                            </ul>
                            <div className="flex justify-end mt-4">
                                <Image alt='yandex' src={yandex} className="w-24 sm:w-28 lg:w-32 h-auto" />
                            </div>
                        </div>

                        {/* Карточка 4 */}
                        <div className="relative bg-[#F87346]/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-white shadow-lg overflow-hidden flex flex-col h-[280px] sm:h-auto sm:min-h-[270px]">
                            <h3 className="font-bold text-base sm:text-lg lg:text-xl mb-3 flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6" /> ЭНДОСКОПИЯ до/после
                            </h3>
                            <ul className="space-y-2 text-xs sm:text-sm md:text-md">
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5" /> Полный фотоотчет</li>
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5" /> Обработки скрытых полостей</li>
                            </ul>
                            <Image alt='endoscope' src={endoscope} className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 w-28 sm:w-36 lg:w-48 h-auto opacity-90" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}