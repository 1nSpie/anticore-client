"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shadcn/select";
import { Checkbox } from "../../../shadcn/checkbox";
import { Input } from "../../../shadcn/input";
import { RadioGroup, RadioGroupItem } from "../../../shadcn/radio-group";
import { getAllBrand, getAllCarWithBrand } from "../api";
import {
  Brand,
  Car,
  ServiceItem,
  ServiceDescriptions,
  AutoPriceFormData,
  AutoPriceProps,
} from "../type";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/dialog";
import { Button } from "@/shadcn/button";
import { MessageCircle, Phone, Send, Info } from "lucide-react";
import Link from "next/link";
import { telegramApiClient } from "@/components/telegram/api";

export default function AutoPrice({ id }: AutoPriceProps) {
  const { register, handleSubmit, watch, control, setValue } =
    useForm<AutoPriceFormData>({
      defaultValues: {
        brand: "",
        model: "",
        customBrand: "",
        isNotAuto: false,
        name: "",
        phone: "",
        contactMethod: "phone",
      },
    });

  const [brands, setBrands] = useState<Brand[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [viewPrice, setViewPrice] = useState<Car | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const isNotAuto = watch("isNotAuto");

  const svgIcon = (
    <svg
      className="shrink-0 mt-0.5 size-5 text-orangeDefault"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  // Загружаем бренды при монтировании
  useEffect(() => {
    getAllBrand().then((data) => {
      setBrands(data);
    });
  }, []);

  // Загружаем модели при выборе бренда
  useEffect(() => {
    const selectedBrandId = watch("brand");
    if (selectedBrandId) {
      const brand = brands.find((b) => b.name === selectedBrandId);
      if (brand?.id) {
        getAllCarWithBrand(brand.id).then(setCars);
      }
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("brand")]);

  // Обновляем цену при выборе модели
  useEffect(() => {
    const selectedModel = watch("model");
    if (selectedModel) {
      const foundCar = cars.find((car) => car.model === selectedModel) || null;
      setViewPrice(foundCar);
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("model")]);

  useEffect(() => {
    setValue("brand", "");
    setValue("model", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch("isNotAuto")]);

  const onSubmit = (data: AutoPriceFormData) => {
    telegramApiClient.sendFullForm(data);
  };

  const serviceDescriptions: ServiceDescriptions = {
    "Стандарт ML": {
      title: "Стандарт ML",
      description:
        "При данном типе обработки мы демонтируем: колёса, подкрылки, локеры, все защиты дна автомобиля, а также пластиковые накладки порогов. Дно автомобиля тщательно промывается и высушивается.",
      includes: [
        "Демонтаж защитных деталей",
        "Промывка и сушка",
        "Упаковка и обработка пластиком",
        "Обработка антикоррозийным составом",
        "Мойка",
        "Финальная сборка",
      ],
      duration: "8 часов",
      warranty: "3 года",
    },
    "Стандарт ML+BODY": {
      title: "Стандарт ML+BODY",
      description:
        "При данном типе обработки демонтируются все защиты, а места коррозии зачищаются. Дно и арки обрабатываются с ингибитором коррозии для предотвращения появления коррозии в будущем.",
      includes: [
        "Демонтаж защитных деталей",
        "Зачистка и обработка мест коррозии",
        "Обработка составами с ингибитором",
        "Покрытие навесного оборудования восками",
        "Мойка",
        "Финальная сборка",
      ],
      duration: "8 часов",
      warranty: "5 лет",
    },
    "Комплекс ML": {
      title: "Комплекс ML",
      description:
        "Процесс включает демонтирование защитных деталей, тщательную промывку и сушку, а также нанесение ML консерванта во внутренние полости для защиты от коррозии.",
      includes: [
        "Демонтаж защитных деталей",
        "Промывка с высоким давлением",
        "Сушка и обработка консервантом",
        "Покрытие навесного оборудования восками",
        "Мойка",
        "Финальная сборка",
      ],
      duration: "8 часов",
      warranty: "3 года",
    },
    "Комплекс ML+BODY": {
      title: "Комплекс ML+BODY",
      description:
        "Полная обработка включает тщательную промывку, сушку и использование BPM состава для вибро-изоляции и долговременной защиты.",
      includes: [
        "Демонтаж и промывка",
        "Сушка и защита консервантом",
        "Обработка BPM составом для виброизоляции",
        "Покрытие воском",
        "Мойка",
        "Финальная сборка и проверка",
      ],
      duration: "8 часов",
      warranty: "3 лет",
    },
  };

  const handleServiceClick = (service: ServiceItem) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  };

  const handleOrderService = () => {
    setIsServiceModalOpen(false);
    setIsContactModalOpen(true);
  };

  const canOpenContactModal = () => {
    return (watch("brand") && watch("model")) || watch("customBrand");
  };

  return (
    <section
      id={id}
      className="bg-[url(/fon.svg)]  dark:bg-[url(/fondark2.svg)] py-16 lg:py-20"
    >
      <div className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto ">
        <div className="grid md:grid-cols-2 items-center gap-12">
          {/* Left side */}
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl lg:leading-tight text-black dark:text-white">
              Почему выбирают нас?
            </h1>
            <p className="mt-1 md:text-lg text-black dark:text-neutral-200 pl-1">
              Мы — ваш надежный партнер в защите автомобиля.
            </p>
            <div className="mt-8">
              <ul className="mt-2 space-y-2">
                <li className="flex gap-x-3 items-center">
                  {svgIcon}
                  <span>Используем только высококачественные материалы</span>
                </li>
                <li className="flex gap-x-3 items-center">
                  {svgIcon}
                  <span>Предоставляем гарантию на все виды работ</span>
                </li>
                <li className="flex gap-x-3 items-center">
                  {svgIcon}
                  <span>Обеспечиваем индивидуальный подход</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="relative dark:bg-backgroundDark bg-background1 rounded-xl">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col border border-orangeDefault dark:border-orangeDefault rounded-xl p-4 sm:p-6 lg:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-xl font-semibold text-black dark:text-neutral-200">
                  Узнайте стоимость обработки
                </h2>

                {isNotAuto ? (
                  <div className="mt-6 grid gap-6">
                    <div className="w-full">
                      <label
                        htmlFor="custom-brand"
                        className="block text-sm font-medium mb-2 dark:text-white"
                      >
                        Марка и модель
                      </label>
                      <Input
                        id="custom-brand"
                        placeholder="BMW"
                        {...register("customBrand")}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 lg:gap-6">
                    <div>
                      <label
                        htmlFor="brand-select"
                        className="block mb-2 text-sm font-medium dark:text-white"
                      >
                        Марка
                      </label>
                      <Controller
                        key={"brand"}
                        name="brand"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={(v) => {
                              field.onChange(v);
                              setValue("model", ""); // Сброс модели
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Выберите марку" />
                            </SelectTrigger>
                            <SelectContent>
                              {brands.map((el) => (
                                <SelectItem
                                  key={`${el.id}-${el.name}`}
                                  value={el.name}
                                >
                                  {el.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {watch("brand") && (
                      <div>
                        <label
                          htmlFor="model-select"
                          className="block mb-2 text-sm font-medium dark:text-white"
                        >
                          Модель
                        </label>
                        <Controller
                          key={"model"}
                          name="model"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Выберите модель" />
                              </SelectTrigger>
                              <SelectContent>
                                {cars.map((el) => (
                                  <SelectItem
                                    key={`${el.id}-${el.model}`}
                                    value={el.model}
                                  >
                                    {el.model}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 flex">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="triggerNotAuto"
                      checked={isNotAuto}
                      onCheckedChange={(checked) =>
                        setValue("isNotAuto", !!checked)
                      }
                      className="data-[state=checked]:bg-orangeDefault border-orangeDefault"
                    />
                    <label
                      htmlFor="triggerNotAuto"
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
                    >
                      Моего автомобиля нет в списке
                    </label>
                  </div>
                </div>
                <Dialog
                  open={isContactModalOpen}
                  onOpenChange={setIsContactModalOpen}
                >
                  <div className="mt-6 grid">
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        disabled={!canOpenContactModal()}
                        className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg bg-orangeDefault hover:bg-orangeDefaultHover focus:outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
                        onClick={() => {
                          if (canOpenContactModal()) {
                            setIsContactModalOpen(true);
                          }
                        }}
                      >
                        {canOpenContactModal()
                          ? "Заказать обратный звонок"
                          : "Выберите марку и модель автомобиля"}
                      </button>
                    </DialogTrigger>
                  </div>
                  <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900 dark:text-white">
                        Заказать обратный звонок
                      </DialogTitle>
                      <DialogDescription className="text-gray-600 dark:text-gray-300">
                        Оставьте свои контактные данные и мы свяжемся с вами в
                        ближайшее время
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <label
                          htmlFor="modal-name"
                          className="text-sm font-medium text-gray-900 dark:text-gray-100"
                        >
                          Имя
                        </label>
                        <Input
                          id="modal-name"
                          placeholder="Введите ваше имя"
                          {...register("name", { required: true })}
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label
                          htmlFor="modal-phone"
                          className="text-sm font-medium text-gray-900 dark:text-gray-100"
                        >
                          Номер телефона
                        </label>
                        <Input
                          id="modal-phone"
                          placeholder="+7 (999) 999-99-99"
                          {...register("phone", { required: true })}
                        />
                      </div>
                      <div className="flex flex-col space-y-3">
                        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Как с вами связаться?
                        </label>
                        <Controller
                          name="contactMethod"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem
                                  value="telegram"
                                  id="contact-telegram"
                                  className="text-orangeDefault dark:text-orangeDefault hover:ring-2"
                                />
                                <label
                                  htmlFor="contact-telegram"
                                  className="flex items-center space-x-2 text-sm cursor-pointer text-gray-900 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                >
                                  <Send className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                  <span>Telegram</span>
                                </label>
                              </div>
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem
                                  value="whatsapp"
                                  id="contact-whatsapp"
                                  className="text-orangeDefault dark:text-orangeDefault hover:ring-2"
                                />
                                <label
                                  htmlFor="contact-whatsapp"
                                  className="flex items-center space-x-2 text-sm cursor-pointer text-gray-900 dark:text-gray-100 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                                  <span>WhatsApp</span>
                                </label>
                              </div>
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem
                                  value="phone"
                                  id="contact-phone"
                                  className="text-orangeDefault dark:text-orangeDefault hover:ring-2"
                                />
                                <label
                                  htmlFor="contact-phone"
                                  className="flex items-center space-x-2 text-sm cursor-pointer text-gray-900 dark:text-gray-100 hover:text-orangeDefault dark:hover:text-orangeDefault transition-colors"
                                >
                                  <Phone className="w-4 h-4 text-orangeDefault dark:text-orangeDefault" />
                                  <span>Мобильный телефон</span>
                                </label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => setIsContactModalOpen(false)}
                        variant="outline"
                        className="mr-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Отмена
                      </Button>
                      <Button
                        type="submit"
                        className="bg-orangeDefault hover:bg-orangeDefaultHover dark:bg-orangeDefault dark:hover:bg-orange-600 text-white"
                        onClick={handleSubmit((data) => {
                          onSubmit(data);
                          setIsContactModalOpen(false);
                        })}
                      >
                        Отправить заявку
                      </Button>
                    </DialogFooter>
                    <p className="text-xs text-center">
                      Нажимая кнопку “Отправить заявку” Соглашаюсь с{" "}
                      <Link href={"/pk"} className="underline">
                        политикой конфиденциальности
                      </Link>
                    </p>
                  </DialogContent>
                </Dialog>
              </div>
            </form>

            {/* Показываем цену, если выбрана модель */}
          </div>
        </div>

        {/* Sliding Price Display */}
        <AnimatePresence>
          {viewPrice && !isNotAuto && watch("brand") && watch("model") && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="mt-8 mx-auto max-w-4xl"
            >
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 shadow-lg border border-orange-200 dark:border-gray-600">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Стоимость обработки
                  </h3>
                  <p className="text-orangeDefault dark:text-orangeDefault font-medium">
                    {watch("brand")} {watch("model")}
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(
                    [
                      {
                        label: "Стандарт ML",
                        price: viewPrice.prices.standartML,
                      },
                      {
                        label: "Стандарт ML+BODY",
                        price: viewPrice.prices.standartMLBody,
                      },
                      {
                        label: "Комплекс ML",
                        price: viewPrice.prices.complexML,
                      },
                      {
                        label: "Комплекс ML+BODY",
                        price: viewPrice.prices.complexMLBody,
                      },
                    ] as ServiceItem[]
                  ).map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index + 0.3 }}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-orange-100 dark:border-gray-600 hover:shadow-lg hover:shadow-orangeDefault/10 dark:hover:shadow-orangeDefault/10 transition-all duration-300 cursor-pointer group hover:border-orange-200 dark:hover:border-orangeDefault/50"
                      onClick={() => handleServiceClick(item)}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {item.label}
                        </p>
                        <motion.p
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: 0.1 * index + 0.4,
                            type: "spring",
                          }}
                          className="text-xl font-bold text-orangeDefault dark:text-orangeDefault mb-2"
                        >
                          {item.price} ₽
                        </motion.p>
                        <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 group-hover:text-orangeDefault dark:group-hover:text-orangeDefault transition-colors">
                          <Info className="w-3 h-3 mr-1" />
                          <span>Подробнее</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Service Description Modal */}
        <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
                <span>{selectedService?.icon}</span>
                <span>{selectedService?.label}</span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                {selectedService &&
                  serviceDescriptions[selectedService.label]?.description}
              </DialogDescription>
            </DialogHeader>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                    Длительность
                  </h4>
                  <p className="text-orangeDefault dark:text-orangeDefault font-semibold">
                    {selectedService &&
                      serviceDescriptions[selectedService.label]?.duration}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                    Гарантия
                  </h4>
                  <p className="text-orangeDefault dark:text-orangeDefault font-semibold">
                    {selectedService &&
                      serviceDescriptions[selectedService.label]?.warranty}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                  Что включено:
                </h4>
                <ul className="space-y-1">
                  {selectedService &&
                    serviceDescriptions[selectedService.label]?.includes.map(
                      (item, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span className="text-orangeDefault dark:text-orangeDefault mt-1">
                            •
                          </span>
                          <span>{item}</span>
                        </li>
                      )
                    )}
                </ul>
              </div>

              <div className="bg-orange-50 dark:bg-gray-700/50 p-4 rounded-lg border border-orange-100 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Стоимость:
                  </span>
                  <span className="text-2xl font-bold text-orangeDefault dark:text-orangeDefault">
                    {selectedService?.price} ₽
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsServiceModalOpen(false)}
                variant="outline"
                className="mr-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Закрыть
              </Button>
              <Button
                className="bg-orangeDefault hover:bg-orangeDefaultHover dark:bg-orangeDefault dark:hover:bg-orange-600 text-white"
                onClick={handleOrderService}
              >
                Заказать услугу
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
