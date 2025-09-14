"use client";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import { LOCATION } from "./helpers";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../shadcn/tabs";
import { PhoneIcon, ClockIcon, HomeIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { YandexMapWidget } from "./YandexMapWidget";
import Link from "next/link";

type Props = {
  id: string;
};

export default function YandexMap({ id }: Props) {
  return (
    <section
      id={id}
      className="py-16 lg:py-24"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#007478]/10 to-transparent dark:from-[#007478]/20 dark:to-transparent pointer-events-none" />
      
      <div className="max-w-[85rem] mx-auto relative">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#007478]/10 dark:bg-[#007478]/20 rounded-full mb-4">
            <MapPinIcon className="w-5 h-5 text-[#007478] dark:text-[#00a2a6]" />
            <span className="text-sm font-medium text-[#007478] dark:text-[#00a2a6]">Наши офисы</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Найти нас легко!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Мы работаем в двух удобных локациях. Выберите ближайший офис для посещения.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-500">
          {/* Tabs Container */}
          <Tabs defaultValue="Жуковский" className="space-y-8">
            {/* Enhanced Tabs List */}
            <TabsList className=" h-auto bg-gradient-to-r from-[#007478] to-[#005a5e] dark:from-[#009a9f] dark:to-[#007478] grid grid-cols-2 w-full max-w-md mx-auto rounded-2xl shadow-lg p-1 border-0">
              <TabsTrigger
                value="Жуковский"
                className="rounded-xl font-semibold text-white/90 hover:text-white hover:bg-white/20 data-[state=active]:bg-white data-[state=active]:text-[#007478] data-[state=active]:shadow-md transition-all duration-300 py-3"
              >
                Жуковский
              </TabsTrigger>
              <TabsTrigger
                value="Коломна"
                className="rounded-xl font-semibold text-white/90 hover:text-white hover:bg-white/20 data-[state=active]:bg-white data-[state=active]:text-[#007478] data-[state=active]:shadow-md transition-all duration-300 py-3"
              >
                Коломна
              </TabsTrigger>
            </TabsList>

            {/* Жуковский Tab Content */}
            <TabsContent
              value="Жуковский"
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in-50 duration-500"
            >
              {/* Enhanced Contact Info */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#007478]/10 to-[#007478]/20 dark:from-[#007478]/20 dark:to-[#007478]/10 rounded-2xl p-6 border border-[#007478]/30 dark:border-[#007478]/20">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#007478] rounded-xl flex items-center justify-center">
                      <MapPinIcon className="w-5 h-5 text-white" />
                    </div>
                    Офис Жуковский
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl hover:bg-white/90 dark:hover:bg-gray-700/70 transition-colors group">
                      <div className="w-12 h-12 bg-[#007478]/10 dark:bg-[#007478]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <HomeIcon className="w-6 h-6 text-[#007478] dark:text-[#00a2a6]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Адрес</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          Жуковский Речной пр., 14
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl hover:bg-white/90 dark:hover:bg-gray-700/70 transition-colors group">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PhoneIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Телефон</p>
                        <Link href="tel:+79932456882" className="text-lg font-semibold text-gray-900 dark:text-white hover:text-[#007478] dark:hover:text-[#00a2a6] transition-colors">
                          +7 993 245 68 82
                        </Link>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl hover:bg-white/90 dark:hover:bg-gray-700/70 transition-colors group">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Время работы</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          09:00–20:00
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Map */}
              <div className="w-full h-[350px] lg:h-[450px] rounded-2xl overflow-hidden shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-shadow duration-300">
                <YMaps
                  query={{
                    apikey: process.env.NEXT_PUBLIC_REACT_APP_YMAP_KEY,
                    lang: "ru_RU",
                  }}
                >
                  <Map
                    className="w-full h-full"
                    defaultState={{
                      type: "yandex#map",
                      center: LOCATION,
                      zoom: 14,
                    }}
                  >
                    <Placemark 
                      geometry={LOCATION} 
                      options={{
                        preset: 'islands#redDotIcon',
                        hideIconOnBalloonOpen: false
                      }}
                      properties={{
                        balloonContent: 'АванКор - Жуковский офис<br/>Речной пр., 14'
                      }}
                    />
                  </Map>
                </YMaps>
              </div>
            </TabsContent>

            {/* Коломна Tab Content */}
            <TabsContent
              value="Коломна"
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in-50 duration-500"
            >
              {/* Enhanced Contact Info */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#007478]/10 to-[#007478]/20 dark:from-[#007478]/20 dark:to-[#007478]/10 rounded-2xl p-6 border border-[#007478]/30 dark:border-[#007478]/20">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#007478] rounded-xl flex items-center justify-center">
                      <MapPinIcon className="w-5 h-5 text-white" />
                    </div>
                    Офис Коломна
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl hover:bg-white/90 dark:hover:bg-gray-700/70 transition-colors group">
                      <div className="w-12 h-12 bg-[#007478]/10 dark:bg-[#007478]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <HomeIcon className="w-6 h-6 text-[#007478] dark:text-[#00a2a6]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Адрес</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          село Чанки, ул. Центральная 152
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl hover:bg-white/90 dark:hover:bg-gray-700/70 transition-colors group">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PhoneIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Телефон</p>
                        <Link href="tel:+79932456882" className="text-lg font-semibold text-gray-900 dark:text-white hover:text-[#007478] dark:hover:text-[#00a2a6] transition-colors">
                          +7 993 245 68 82
                        </Link>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-700/50 rounded-xl hover:bg-white/90 dark:hover:bg-gray-700/70 transition-colors group">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Время работы</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          09:00–20:00
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Map */}
              <div className="w-full h-[350px] lg:h-[450px] rounded-2xl overflow-hidden shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-shadow duration-300">
                <YMaps
                  query={{
                    apikey: process.env.NEXT_PUBLIC_REACT_APP_YMAP_KEY,
                    lang: "ru_RU",
                  }}
                >
                  <Map
                    className="w-full h-full"
                    defaultState={{
                      type: "yandex#map",
                      center: [55.123116, 38.810275],
                      zoom: 14,
                    }}
                  >
                    <Placemark 
                      geometry={[55.123116, 38.810275]} 
                      options={{
                        preset: 'islands#redDotIcon',
                        hideIconOnBalloonOpen: false
                      }}
                      properties={{
                        balloonContent: 'АванКор - Коломна офис<br/>село Чанки, ул. Центральная 152'
                      }}
                    />
                  </Map>
                </YMaps>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Enhanced Reviews Widget Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Отзывы наших клиентов
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              Узнайте, что говорят о нас наши довольные клиенты
            </p>
          </div>
          <YandexMapWidget />
        </div>
      </div>
    </section>
  );
}