'use client'

import { useState, useEffect, useRef } from "react";
import { Shield, Star, ClipboardCheck, MoveRight, PlayIcon, CheckCircle, Phone, Clock } from "lucide-react";
import Image from "next/image";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/shadcn/carousel";
import Autoplay from "embla-carousel-autoplay";

import car from './imgs/car.png';
import plakat from './imgs/plakat.png';
import plakat2obr from './imgs/plakat2obr.png';
import plakat2 from './imgs/plakat2.jpg';
import plakat3 from './imgs/plakat3.jpg';
import garanty from './imgs/garanty.png';
import yandex from './imgs/yandex.png';
import { CallbackModal } from "@/app/ui/ui/CallbackModal";

const API_BASE_URL = process.env.NEXT_PUBLIC_S3_URL;

const carouselSlides = [
    { id: 1, image: plakat, title: "СКРЫТЫЕ ПОЛОСТИ ВЕРХ КУЗОВА" },
    { id: 2, image: plakat2, title: "СИЛОВЫЕ СКРЫТЫЕ ПОЛОСТИ" },
    { id: 3, image: plakat3, title: "ОБРАБОТКА АРОК" },
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
        <section className="relative mt-15 overflow-hidden text-white ">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 object-cover w-full h-full z-0"
                preload="auto"
            >
                <source src={`${API_BASE_URL}/video/videoStart.mp4`} type="video/mp4" />
                Ваш браузер не поддерживает видео.
            </video>
            <div
                className="absolute inset-0 z-10"
                style={{
                    backgroundImage: `
            radial-gradient(900px circle at 18% 78%, rgba(0, 148, 151, 0.22), transparent 55%),
            radial-gradient(820px circle at 82% 18%, rgba(0, 116, 120, 0.18), transparent 52%),
            linear-gradient(120deg, rgba(8, 13, 24, 0.9) 0%, rgba(12, 19, 32, 0.82) 100%)
          `,
                }}
            />

            <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">

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
                                        <button className=" text-[#F87346] border-[#F87346] border-4 text font-bold py-4 px-20 sm:px-6 rounded-xl transition-all transform hover:scale-105 shadow-md whitespace-nowrap text-sm sm:text-base">
                                            ЗАКАЗАТЬ ЗВОНОК
                                        </button>
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Основной контент */}
                <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-10">
                    {/* Левая колонка с текстом и кнопкой */}
                    <div className="w-full px-1 sm:px-2 lg:px-0 pt-4 sm:pt-6">
                        <div className="text-center lg:text-left">
                            <h2 className="text-xl sm:text-2xl md:text-3xl text-white font-light mb-2">
                                Антикоррозийная обработка автомобиля с <span className="font-extrabold">гарантией до 5 лет</span>
                            </h2>
                            <p className="text-xl sm:text-2xl md:text-3xl text-white mb-4 font-light">
                                Помогаем сохранить рыночную <span className="font-extrabold">стоимость авто на 15-25%</span>
                            </p>
                           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pb-8">
                                <div className="flex flex-col sm:flex-row items-center justify-center w-full sm:w-auto pt-1 gap-1 lg:mb-12">
                                    <PlayIcon width={16} height={16} className="text-[#F8734666] rotate-90 sm:rotate-0" fill="#F8734666" />
                                    <PlayIcon width={16} height={16} className="text-[#F87346] rotate-90 sm:rotate-0" fill="#F87346" />
                                </div>
                                <p className="text-white text-sm sm:text-base text-center sm:text-left leading-6">
                                    <strong>Ответьте на 5 вопросов,</strong> чтобы узнать стоимость обработки вашего авто + <br />
                                    <strong>Бесплатную экспресс-диагностику скрытых полостей</strong>
                                </p>
                            </div>

                            <div className="bg-white flex flex-col sm:flex-row items-center py-4 sm:py-5 px-4 sm:px-5 rounded-2xl w-full lg:max-w-[759px] shadow-lg">
                                <button
                                    onClick={() => window.open('https://mrqz.me/avankor', '_blank')}
                                    className="
    w-[306px] h-[97px]
    bg-linear-to-r from-[#EF9147] to-[#FF6B35] hover:opacity-90
    text-white font-bold 
    py-3 px-4 md:px-8 
    rounded-2xl 
    transition-all transform hover:scale-105 
    shadow-lg 
    flex items-center justify-center gap-2 
    text-sm md:text-base
"
                                >
                                    <div className="flex flex-col items-start text-xs">
                                        <span>РАССЧИТАТЬ СТОИМОСТЬ</span>
                                        <span>И ЗАБРАТЬ ПОДАРОК</span>
                                    </div>
                                    <MoveRight className="w-8 h-8 sm:w-10 sm:h-10" />
                                </button>

                                <p className="text-black font-montserrat text-sm sm:text-base leading-5 w-auto sm:w-56 pt-2 ml-0 sm:ml-10 mr-0 sm:mr-5 mb-0 text-center sm:text-left">
                                    За прохождение рассчета дарим PDF-файл “Антикор: сейчас или когда сгниёт” + СКИДКА 10%
                                </p>
                                <Image alt="image-car" src={car} className="scale-x-[-1]" width={200} height={100} />
                            </div>
                        </div>
                    </div>
                                    
                </div>

                {/* Нижний блок с карточками */}
                <div className="mt-12 lg:mt-14 px-0">
                    <div className="flex flex-col lg:flex-row gap-5 sm:gap-6">
                        {/* Карточка 1 */}
                        <div
                            className="bg-white/8 rounded-[20px] p-2 text-white shadow-lg border border-white/20 border-dashed flex flex-col items-center justify-center text-center min-h-[212px] lg:w-[245px] lg:h-[212px] shrink-0"
                            style={{ opacity: 1, backdropFilter: "blur(20px)" }}
                        >
                            <div className="flex items-baseline justify-center text-[#F87346]">
                                <span className="text-6xl sm:text-7xl lg:text-8xl font-extrabold">6</span>
                                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">+ лет</span>
                            </div>
                            <div className="text-base sm:text-lg font-medium mt-2">в области обработки авто.<br />Защищаем от коррозии.</div>
                        </div>

                        {/* Карточка 2 */}
                        <div
                            className="relative bg-white/10 rounded-[20px] p-4 sm:p-6 text-white shadow-lg border border-white/20 overflow-hidden flex flex-col w-full h-[380px] lg:max-w-none lg:w-[474px] lg:h-[212px] shrink-0"
                            style={{ opacity: 1, backdropFilter: "blur(20px)" }}
                        >
                            <h3 className="font-bold text-base sm:text-lg lg:text-xl mb-3 flex items-center gap-2 lg:pr-24">
                                <Shield className="w-5 h-5 sm:w-6 sm:h-6" /> ГАРАНТИЯ ПРОЗРАЧНОСТИ:
                            </h3>
                            <ul className="space-y-2 text-xs sm:text-sm md:text-md grow lg:pr-24">
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" /> Договор + гарантийный талон</li>
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" /> Фотофиксация всего процесса</li>
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" /> Сертифицированные материалы</li>
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" /> Обучения мастеров по регламенту</li>
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" /> Безопасность для ЛКП и салона</li>
                            </ul>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[282px] lg:hidden">
                                <Image
                                    alt='plakat2obr'
                                    src={plakat2obr}
                                    className="w-[282px] object-cover opacity-95"
                                />
                            </div>
                            <Image
                                alt='garanty'
                                src={garanty}
                                className="hidden lg:block absolute top-0 right-0 w-auto h-full object-contain opacity-95"
                            />
                        </div>

                        {/* Карточка 3 */}
                        <div
                            className="relative bg-white/10 rounded-[20px] p-4 sm:p-6 text-white shadow-lg border border-white/20 flex flex-col w-full h-[192px] lg:max-w-none lg:w-[412px] lg:h-[212px] overflow-hidden shrink-0"
                            style={{ opacity: 1, backdropFilter: "blur(20px)" }}
                        >
                            <h3 className="font-bold text-base sm:text-lg lg:text-xl mb-3 flex items-center gap-2 pr-24">
                                <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-white" /> НАМ ДОВЕРЯЮТ:
                            </h3>
                            <ul className="space-y-2 text-xs sm:text-sm md:text-md grow pr-24">
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5" /> Обработали более 4000+ авто</li>
                                <li className="flex items-start gap-2"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5" /> Оценка 5 на Яндекс</li>
                            </ul>
                            <Image
                                alt='yandex'
                                src={yandex}
                                className="absolute top-0 right-0 h-full w-auto object-contain opacity-95"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}