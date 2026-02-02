"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/card";

import FeedbackLine from "../ui/ui/FeedbackLine";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

const IMAGE_URL = `${process.env.NEXT_PUBLIC_S3_URL}/image`

const steps = [
  {
    id: "diagnostika",
    number: "01",
    title: "Диагностика",
    description: `На первом этапе производится внешний осмотр автомобиля на предмет внешних очагов коррозии и составляется акт осмотра автомобиля с указанием всех дефектов.

Далее автомобиль поднимается на подъемнике и мастер производит осмотр наружных поверхностей низа авто- днища, колесных арок. В ходе этого этапа выявляются очаги коррозии, степень повреждений. Так же осматриваются пластиковые элементы защиты днища и арок на предмет недостающего или сломанного крепежа для его дальнейшей замены на новый.

Завершающим этапом производится осмотр скрытых полостей автомобиля- лонжеронов, порогов, усилителей, соединителей пола, коробов. Для этого применяется видео эндоскоп.

По итогу клиенту дается рекомендация по выбору типа обработки, антикоррозийным материалам, а также определятся сколько времени потребуется на обработку и какой будет срок гарантии.`,
  },
  {
    id: "razborka",
    number: "02",
    title: "Разборка/Сборка",
    description: `Перед разборкой весь крепеж обрабатывается проникающей смазкой. Снимаются колеса, подкрылки, пластиковые накладки. В отдельных случаях снимаются бампер, фары и фонари, металлические и пластиковые подножки, снимаются все резиновые и пластиковые заглушки.

Производится фотофиксация состояния подкрылок и защит.

При разборке мы стараемся применить максимально деликатные методы, что бы максимально сохранить заводской оригинальный крепеж и заглушки. Однако бывают случаи, когда необходимо применить немного грубой силы. Тогда в дело вступает сверлящий и режущий инструмент. В случае высверливания резьбового металлического соединения (болт, винт) на его место мы устанавливаем оцинкованную закладную с аналогичной резьбой.

Элементы одноразового крепежа (клипсы) меняются на новые. Мы всегда держим в наличии большое количество клипс разных видов и размеров.

Перед установкой колес привалочная поверхность ступицы зачищается от коррозии и грязи, обрабатывается защитной смазкой.

Затяжка колесных болтов и гаек осуществляется при помощи динамометрического ключа.`,
    imgs: [`${IMAGE_URL}/process/razborka1.jpg`, `${IMAGE_URL}/process/razborka2.jpg`, `${IMAGE_URL}/process/razborka3.jpg`, `${IMAGE_URL}/process/razborka4.jpg`,]

  },
  {
    id: "moyka",
    number: "03",
    title: "Мойка",
    description: `Мойка - самый важный этап подготовки к обработке.

Первый этап: мойка низа авто подготовленной теплой водой под высоким давлением. Промывается подвеска, зоны за бампером, ступичные узлы, скрытые полости. Рамы на внедорожниках промываются специальной каналопромывочной насадкой.

Второй этап: нанесение щелочного состава. Применение этого состава позволяет убрать с днища авто сложные загрязнения в виде масляных отложений, въевшейся дорожной грязи, следов старых антикоррозийных покрытий. После нанесения составу нужно поработать 2-3 минуты, после чего состав смывается водой под давлением.

Третий этап: нанесение кислотного состава и ручная мойка. На днища авто наносится кислотный состав. Он обладает более мягкими моющими свойствами и пригоден для ручной мойки. Ручная мойка производится при помощи кистей, щеток, ершиков. Это необходимо, чтобы убрать статические загрязнения из труднодоступных мест. Помимо этого кислотный состав нейтрализует остатки щелочного состава, что позволяет исключить возникновение коррозии. Кислотный состав также смывается водой под высоким давлением.

Четвертый этап. Контроль качества. После мойки автомобиль проверяют последовательно два человека- мастер цеха и мастер приемщик. Если обнаруживаются грязные или не промытые участки мойка повторяется до достижения нужного результата.`,
    imgs: [`${IMAGE_URL}/process/moika1.png`, `${IMAGE_URL}/process/moika2.png`, `${IMAGE_URL}/process/moika3.png`, `${IMAGE_URL}/process/moika4.png`, `${IMAGE_URL}/process/moika5.png`, `${IMAGE_URL}/process/moika6.png`,]
  },
  {
    id: "sushka",
    number: "04",
    title: "Сушка",
    description: `Сушка автомобиля производится при помощи нескольких турбосушек - мощных тепловых фенов. Они создают мощный направленный поток горячего воздуха. Скорость воздуха на выходе может достигать 300 км/ч. При помощи специальных насадок влага выгоняется сначала из всех скрытых полостей- лонжеронов, порогов, усилителей, далее просушиваются открытые поверхности- днище и арки. Так же возможно применение тепловых пушек мощностью 25 кВт.

Контроль качества сушки производится по аналогии с мойкой. Исключается нанесение антикоррозионных составов на мокрую или влажную поверхность, за редким исключением.`,
    imgs: [`${IMAGE_URL}/process/sushka1.png`, `${IMAGE_URL}/process/sushka2.png`, `${IMAGE_URL}/process/sushka3.png`, `${IMAGE_URL}/process/sushka4.png`, `${IMAGE_URL}/process/sushka5.png`]
  },
  {
    id: "maskirovka",
    number: "05",
    title: "Маскировка",
    description: `Перед обработкой маскируются:
• Кузов авто
• Стыки кузовных панелей
• Выхлопная система
• Система автономного отопления
• Тормозная система
• Пневматическая система подвески
• Сапуны в трансмиссии
• Концевики и датчики

Для маскировки используются бумага, пленка и малярный скотч высокого качества, чтобы не повредить ЛКП автомобиля.`,
  },
  {
    id: "zachistka",
    number: "06",
    title: "Зачистка",
    description: `Современные антикоррозийные составы допускается наносить на незначительную коррозию. Однако, мы точно убеждены в том, что эффективность обработки будет значительно выше, если поверхность хорошо подготовить, очистив от ржавчины.

Существует несколько методов:
1. Механическая зачистка. Используется радиальный инструмент с зачистными дисками, щетками разной жесткости и конфигурации.
2. Преобразователь ржавчины. Специальные составы преобразовывающие коррозию в неактивные химические соединения.
3. Лазерная очистка. Применяется специальная установка для очистки металла импульсным лазером. Удаляет коррозию даже из пор металла.

В работе мы применяем все три способа удаления коррозии. Все они имеют свои преимущества и недостатки и применяются в разных ситуациях.

Однако, бывают случаи, когда коррозии настолько много, что пытаться убрать ее не имеет смысла. Это особенно актуально для возрастных авто с большим пробегом. В этом случае применяется ML метод обработки.

После зачистки производится продувка и обезжиривание поверхности. Далее автомобиль готов к обработке.`,
    imgs: [`${IMAGE_URL}/process/chistka1.png`, `${IMAGE_URL}/process/chistka2.png`, `${IMAGE_URL}/process/chistka3.png`, `${IMAGE_URL}/process/chistka4.png`, `${IMAGE_URL}/process/chistka5.png`]
  },
  {
    id: "obrabotka",
    number: "07",
    title: "Обработка",
    description: `Для антикоррозийной обработки кузова авто используются отечественные и импортные антикоррозийные материалы. Все они делятся на несколько видов:

1. Составы для защиты днища и колесных арок.
   1.1. Полимерно-битумные материалы - используются для защиты от воздействия окружающей среды. Обладают высокой прочностью и износостойкостью, сохраняя при этом эластичность в широком диапазоне температур. Данные материалы отлично подходят для обработки новых авто или авто с небольшим пробегом. При соблюдении всех правил обработки и должном обслуживании могут прослужить до 10 лет.
   1.2. Битумно-восковые составы. Применяются для обработки днища и колесных арок на автомобилях с большим пробегом со следами коррозии. В отличие от полимерно-битумных составов обладают большей мягкостью и пластичностью, а так же содержат ингибиторы коррозии на масляной основе, что позволяет эффективно бороться с уже существующей коррозией и не подпускать возникновение новой. Данные составы менее требовательны к качеству поверхности, допускается нанесение на незначительную коррозию, въевшиеся загрязнения, масляные следы.

2. Составы для защиты скрытых полостей или ML – составы.
   2.1. Масляные составы. Обладают самой высокой летучестью и проникающей способностью среди всех ML составов. Благодаря капиллярному эффекту легко проникают в сварные и резьбовые соединения, стыки кузовных элементов, словом - во все самые труднодоступные места кузова автомобиля. Этот эффект значительно усиливается за счет применения профессионального оборудования с высоким давлением распыления. Недостатком данных материалов является их недолговечность. Для продления срока службы рекомендуется поверх наносить консервационные полимерно-масляные или полимерно-восковые составы.
   2.2. Полимерно-масляные составы. Это масляные составы модифицированные полимерными смолами и синтетическими каучуками. По сравнению с масляными составами обладают более высокой вязкостью и меньшей проникающей способностью, однако гораздо более устойчивы к воздействию внешних факторов физического воздействия. Используются как защитный слой для масляных составов. Обладают большим сроком службы. Применяются для обработки скрытых полостей низа авто- лонжеронов, порогов, усилителей.
   2.3. Полимерно-восковые составы. Это составы на масляной основе с содержанием нефтяных восков и смол, модифицированные синтетическими каучуками и полиэтиленовыми восками. Самые вязкие среди всех ML составов. Используются для обработки скрытых полостей верха кузова- дверей, стоек, подкапотного пространства, крышки багажника, капота, полостей в задних крыльях. Самые экологичные из всех ML составов.

Первый этап: Обработка скрытых полостей низа кузова (силовых). Для этого используется оборудование безвоздушного и комбинированного распыления. За счет высокого давления состав подается в полость через специальные форсунки образуя плотный туман, за счет этого состав поступает даже в самые сложные участки полостей, исключая возможность непрокраса. На первом этапе используются грунтовочные ML составы. Они создают пленку на поверхности металла, блокируя поступление кислорода и влаги.

Второй этап: Обработка днища и арок полимерно-битумным или битумно-восковым составом. Для этого используется исключительно безвоздушное оборудование. Специальный насос подает антикоррозийный состав под давлением до 400 атмосфер. Для распыления используются сопла с твердосплавными наконечниками из карбида вольфрама. Совокупность этих факторов дает возможность наносить состав равномерным слоем необходимой (для каждого материала своя) толщины. Так же такой метод нанесения исключает возможность попадания в состав влаги и пузырьков воздуха.

Третий этап. Обработка консервирующим ML составом. Повторно обрабатываются скрытые полости низа авто. Затем при помощи воздушного оборудования обрабатываются полости верха кузова. Воздушное оборудование применяется в этом случае для того, чтобы уменьшить распыл и не допустить попадание материала на элементы салона авто. После обработки излишки материала убираются сжатым воздухом.`,
  imgs:[`${IMAGE_URL}/process/obrabotka1.jpg`,`${IMAGE_URL}/process/obrabotka2.jpg`,`${IMAGE_URL}/process/obrabotka3.jpg`,`${IMAGE_URL}/process/obrabotka4.jpg`,`${IMAGE_URL}/process/obrabotka5.jpg`,`${IMAGE_URL}/process/obrabotka6.jpg`,`${IMAGE_URL}/process/obrabotka7.jpg`,`${IMAGE_URL}/process/obrabotka8.jpg`,]
},
  {
    id: "kontrol-kachestva",
    number: "08",
    title: "Контроль качества",
    description: `После обработки производится тщательный визуальный осмотр всех поверхностей днища авто. Покрытие должно быть равномерным и непрерывным. В случае обнаружения пропусков материал наносится повторно на место пропуска с заходом на уже обработанную поверхность. Размер перехлеста составляет не менее 15 см.

Для контроля качества обработки скрытых полостей используется видео эндоскоп.`,
    imgs: [`${IMAGE_URL}/process/control1.png`, `${IMAGE_URL}/process/control2.png`]

  },
];

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function ProcessPage() {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<{
    url: string;
    stepIndex: number;
    imageIndex: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;

      if (hash) {
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            setExpandedStep(hash.slice(1))
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    }
  }, []);

  const handleExpandedStep = (stepId: string) => {
    const stepElement = document.getElementById(stepId);

    if (expandedStep === stepId) {
      setExpandedStep(null);
    } else {
      setExpandedStep(stepId);


      setTimeout(() => {
        if (stepElement) {
          stepElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
        }
      }, 100);
    }
  }

  // Блокировка скролла при открытом изображении
  useEffect(() => {
    if (fullscreenImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [fullscreenImage]);

  const openFullscreen = (url: string, stepIndex: number, imageIndex: number) => {
    setFullscreenImage({ url, stepIndex, imageIndex });
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!fullscreenImage) return;

    const step = steps[fullscreenImage.stepIndex];
    if (!step.imgs) return;

    const currentIndex = fullscreenImage.imageIndex;
    let newIndex: number;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % step.imgs.length;
    } else {
      newIndex = (currentIndex - 1 + step.imgs.length) % step.imgs.length;
    }

    setFullscreenImage({
      url: step.imgs[newIndex],
      stepIndex: fullscreenImage.stepIndex,
      imageIndex: newIndex,
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      transition={{ type: "spring", duration: 0.5 }}
      className="min-h-screen pt-20"
      style={{
        background:
          "radial-gradient(900px circle at 20% 18%, rgba(0, 148, 151, 0.12), transparent 55%), radial-gradient(1100px circle at 80% 12%, rgba(15, 23, 42, 0.12), transparent 60%), linear-gradient(180deg, rgba(13, 22, 36, 0.94), rgba(13, 22, 36, 0.82))",
      }}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#007478]/10 dark:bg-[#007478]/20 border border-[#007478]/20 dark:border-[#007478]/30 mb-6">
              <span className="text-sm font-medium text-[#007478] dark:text-[#00a2a6]">
                8 этапов профессиональной обработки
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-teal-700 dark:from-white dark:via-gray-100 dark:to-teal-300 bg-clip-text text-transparent mb-6 leading-tight">
              Процесс обработки
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Подробное описание всех этапов антикоррозийной обработки автомобиля
            </p>
          </motion.div>

          {/* Process Steps Grid */}
          <div className="grid gap-6 lg:gap-8">
            {steps.map((step, stepIndex) => {
              const isExpanded = expandedStep === step.id;

              return (
                <motion.div
                  key={step.number}
                  id={step.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: stepIndex * 0.1 }}
                  className="scroll-mt-24"
                >
                  <Card
                    className="overflow-hidden border-2 hover:border-[#007478]/50 dark:hover:border-[#00a2a6]/50 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-xl hover:shadow-2xl cursor-pointer"
                  >

                    <CardHeader className="gap-0" onClick={() => handleExpandedStep(step.id)}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-[#007478] to-[#005a5e] dark:from-[#007478] dark:to-[#005a5e] flex items-center justify-center shadow-lg">
                            <span className="text-xl font-bold text-white">
                              {step.number}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                                {step.title}
                              </CardTitle>
                              <ChevronDownIcon
                                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CardContent className="pt-10 border-t border-gray-200 dark:border-gray-700 mt-4 ">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base lg:text-lg">
                                {step.description}
                              </p>
                            </div>

                            {/* Галерея изображений */}
                            {step?.imgs && step.imgs.length > 0 && (
                              <div className="mt-8">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                  <ZoomIn className="w-4 h-4" />
                                  Фотографии этапа ({step.imgs.length})
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {step.imgs.map((img, imageIndex) => (
                                    <button
                                      key={imageIndex}
                                      onClick={() => openFullscreen(img, stepIndex, imageIndex)}
                                      className="relative aspect-square overflow-hidden rounded-lg hover:scale-[1.02] transition-transform group"
                                      aria-label={`Открыть фото ${imageIndex + 1}`}
                                    >
                                      {/* Номер на миниатюре */}
                                      <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                        {imageIndex + 1}
                                      </div>

                                      {/* Overlay при наведении */}
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 z-0" />

                                      <Image
                                        src={img}
                                        alt={`Фото этапа "${step.title}" - ${imageIndex + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 50vw, 33vw"
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95">
          {/* Кнопка закрытия */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-10 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Кнопка навигации - Назад */}
          <button
            onClick={() => navigateImage('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center transition-colors md:left-6"
            aria-label="Предыдущее фото"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Кнопка навигации - Вперед */}
          <button
            onClick={() => navigateImage('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center transition-colors md:right-6"
            aria-label="Следующее фото"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Основное изображение */}
          <div className="relative w-full max-w-6xl h-full max-h-[85vh]">
            <Image
              src={fullscreenImage.url}
              alt="Увеличенное фото"
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Индикатор */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
            {fullscreenImage.imageIndex + 1} / {steps[fullscreenImage.stepIndex].imgs?.length}
          </div>

          {/* Миниатюры (только на десктопе) */}
          <div className="hidden md:block absolute bottom-16 left-1/2 -translate-x-1/2">
            <div className="flex gap-2 max-w-[90vw] overflow-x-auto py-2 px-4">
              {steps[fullscreenImage.stepIndex].imgs?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setFullscreenImage({
                    ...fullscreenImage,
                    url: img,
                    imageIndex: index
                  })}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === fullscreenImage.imageIndex
                    ? 'border-blue-500 scale-110'
                    : 'border-transparent hover:border-gray-400'
                    }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={img}
                      alt={`Миниатюра ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <FeedbackLine />
    </motion.div>
  );
}