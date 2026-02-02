"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useModal } from "@/lib/ModalContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Autocomplete } from "../../../shadcn/autocomplete";
import { Checkbox } from "../../../shadcn/checkbox";
import { Input } from "../../../shadcn/input";
import { RadioGroup, RadioGroupItem } from "../../../shadcn/radio-group";
import { getAllBrand, getAllCarWithBrand } from "../api";
import {
  Brand,
  Car,
  ServiceItem,
  ServiceDescriptions,
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
} from "src/shadcn/dialog";
import { Button } from "src/shadcn/button";
import { MessageCircle, Phone, Send, Info } from "lucide-react";
import Link from "next/link";
import { telegramApiClient } from "src/components/telegram/api";
import {
  autoPriceFormSchema,
  type AutoPriceFormData,
} from "src/lib/validations";
import { toast } from "sonner";
import { checkDuplicateSubmission, saveSubmission, getLastSubmissionTime } from "src/lib/duplicateCheck";
import { DuplicateWarningModal } from "src/app/ui/ui/DuplicateWarningModal";
import { ScrollArea } from "@/shadcn/scroll-area";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import bgfon from 'public/bgfon.png'
import Marquee from "react-fast-marquee";

export default function AutoPrice({ id }: AutoPriceProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<AutoPriceFormData>({
    resolver: zodResolver(autoPriceFormSchema),
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
  const { openModal, closeModal, isModalOpen, canOpenModal } = useModal();

  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [pendingData, setPendingData] = useState<AutoPriceFormData | null>(null);

  const SERVICE_MODAL_ID = "service-modal";
  const CONTACT_MODAL_ID = "contact-modal";

  const isServiceModalOpen = isModalOpen(SERVICE_MODAL_ID);
  const isContactModalOpen = isModalOpen(CONTACT_MODAL_ID);

  const isNotAuto = watch("isNotAuto");

  const svgIcon = (
    <svg
      className="shrink-0 mt-0.5 size-5 text-orange-500"
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

  const submitForm = async (data: AutoPriceFormData) => {
    try {
      await telegramApiClient.sendFullForm(data);
      saveSubmission();
      toast.success("Ваша заявка отправлена!", {
        description: "Менеджер перезвонит вам в ближайшее время",
      });
      closeModal(CONTACT_MODAL_ID);
    } catch (error) {
      toast.error("Ошибка отправки!", {
        description:
          error instanceof Error ? error.message : "Повторите попытку позже",
      });
    }
  };

  const onSubmit = async (data: AutoPriceFormData) => {
    // Проверяем дубликат по времени
    if (checkDuplicateSubmission()) {
      setPendingData(data);
      setShowDuplicateWarning(true);
      return;
    }

    // Если дубликата нет, отправляем сразу
    await submitForm(data);
  };

  const handleConfirmDuplicate = async () => {
    setShowDuplicateWarning(false);
    if (pendingData) {
      await submitForm(pendingData);
      setPendingData(null);
    }
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateWarning(false);
    setPendingData(null);
  };

  const serviceDescriptions: ServiceDescriptions = {
    "Стандарт ML": {
      title: "Стандарт ML",
      description:
        `При данном типе обработки мы демонтируем: колёса, подкрылки, локеры, все защитные
элементы дна автомобиля, а также пластиковые накладки порогов. Дно автомобиля
тщательно промывается и высушивается. Скрытые полости, днище и арки
обрабатываются сначала проникающими, а затем консервирующими ML-составами. Рекомендуется повторять
не реже, чем раз в год.`,
      includes: [
        "Снятие колес и разборка пластиковых защитных элементов.",
        "Мойка под давлением.",
        "Сушка",
        "Маскировка кузова и рабочих систем автомобиля.",
        "Обработка силовых скрытых полостей",
        "Контроль качества",
        "Сборка",

      ],
      duration: "4-8 часов",
      warranty: "1 год",
    },
    "Стандарт ML+BODY": {
      title: "Стандарт ML+BODY",
      description:
        `При данном типе обработки демонтируются все защитные элемнеты, а места коррозии
зачищаются. Дно и арки обрабатываются материалом с ингибитором коррозии для
предотвращения появления коррозии в будущем.Подходит для автомобилей с
небольшим пробегом или новых.`,
      includes: [
        "Снятие колес и разборка пластиковых защитных элементов.",
        "Мойка под давлением",
        "Сушка",
        "Маскировка кузова и рабочих систем автомобиля",
        "Зачистка очагов коррозии",
        "Обработка силовых скрытых полостей",
        "Обработка днища и арок грунтовочным слоем с преобразователем ржавчины",
        "Обработка днища и арок защитным полимерно-битумным материалом",
        "Контроль качества",
        "Сборка",
      ],
      duration: "6-12 часов",
      warranty: "5 лет",
    },
    "Комплекс ML": {
      title: "Комплекс ML",
      description:
        `При данном типе обработки мы демонтируем: колёса, подкрылки, локеры, все защитные
элементы дна автомобиля, а также пластиковые накладки порогов. Дно автомобиля
тщательно промывается и высушивается. Силовые скрытые полости, скрытые полости
верха кузова, днище и арки обрабатываются сначала проникающими, а затем
консервирующими ML-составами.
Такой вариант обработки подходит для автомобилей с большим пробегом, с большим
количеством коррозии на разной стадии в плоть до сквозной. Рекомендуется повторять
не реже, чем раз в год.`,
      includes: [
        "Снятие колес и разборка пластиковых защитных элементов.",
        "Мойка под давлением",
        "Сушка",
        "Маскировка кузова и рабочих систем автомобиля",
        "Обработка силовых скрытых полостей",
        "Обработка днища и арок",
        "Обработка скрытых полостей верха кузова",
        "Контроль качества",
        "Сборка",
      ],
      duration: "5-8 часов",
      warranty: "1 год",
    },
    "Комплекс ML+BODY": {
      title: "Комплекс ML+BODY",
      description:
        `При данном типе обработки демонтируются все защитные элемнеты, а места коррозии
зачищаются. Дно и арки обрабатываются материалом с ингибитором коррозии для
предотвращения появления коррозии в будущем. Подходит для автомобилей с
небольшим пробегом или новых.`,
      includes: [
        "Снятие колес и разборка пластиковых защитных элементов.",
        "Мойка под давлением",
        "Сушка",
        "Маскировка кузова и рабочих систем автомобиля",
        "Зачистка очагов коррозии",
        "Обработка силовых скрытых полостей",
        "Обработка днища и арок грунтовочным слоем с преобразователем ржавчины",
        "Обработка днища и арок защитным полимерно-битумным материалом",
        "Обработка скрытых полостей верах кузова",
        "Контроль качества",
        "Сборка",
      ],
      duration: "6-12 часов",
      warranty: "5 лет",
    },
  };

  const handleServiceClick = (service: ServiceItem) => {
    if (canOpenModal(SERVICE_MODAL_ID)) {
      setSelectedService(service);
      openModal(SERVICE_MODAL_ID);
    }
  };

  const handleOrderService = () => {
    closeModal(SERVICE_MODAL_ID);
    setTimeout(() => {
      openModal(CONTACT_MODAL_ID);
    }, 150); 
  };

  const canOpenContactModal = () => {
    return (watch("brand") && watch("model")) || watch("customBrand");
  };

  return (
    <section
      id={id}
      className="relative py-32 lg:py-40 overflow-hidden"
    >
      <div className={`max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto relative`}>
        <div className="grid md:grid-cols-2 items-center gap-12 ">
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
          <div className="relative">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col border border-orange-600 rounded-xl p-4 sm:p-6 lg:p-10 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white ">
                <h2 className="text-xl font-semibold text-black">
                  Узнайте стоимость обработки
                </h2>

                {isNotAuto ? (
                  <div className="mt-6 grid gap-6">
                    <div className="w-full">
                      <label
                        htmlFor="custom-brand"
                        className="block text-sm font-medium mb-2 text-gray-700"
                      >
                        Марка и модель
                      </label>
                      <Input
                        id="custom-brand"
                        placeholder="BMW"
                        {...register("customBrand")}
                        className={`${errors.customBrand
                          ? "border-red-500"
                          : "border-gray-300 focus-visible:border-orange-600 focus-visible:ring-1 focus-visible:ring-orange-600/30 focus-visible:ring-offset-0 bg-white text-gray-900 "
                          } `}
                      />
                      {errors.customBrand && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.customBrand.message}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4 lg:gap-6">
                    <div>
                      <label
                        htmlFor="brand-autocomplete"
                        className="block mb-2 text-sm font-medium text-gray-700"
                      >
                        Марка
                      </label>
                      <Controller
                        name="brand"
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            options={brands.map((b) => ({ value: b.name, label: b.name }))}
                            value={field.value!}
                            onChange={(v) => {
                              field.onChange(v);
                              setValue("model", "");
                            }}
                            placeholder="Введите марку для поиска"
                            emptyMessage="Марка не найдена"
                            inputClassName="border-gray-300 focus-visible:border-orange-600 focus-visible:ring-1 focus-visible:ring-orange-600/30 focus-visible:ring-offset-0 bg-white text-gray-900"
                            
                          />
                        )}
                      />
                    </div>

                    {watch("brand") && (
                      <div>
                        <label
                          htmlFor="model-autocomplete"
                          className="block mb-2 text-sm font-medium text-gray-700"
                        >
                          Модель
                        </label>
                        <Controller
                          name="model"
                          control={control}
                          render={({ field }) => (
                            <Autocomplete
                              options={cars.map((c) => ({ value: c.model, label: c.model }))}
                              value={field.value!}
                              onChange={field.onChange}
                              placeholder="Введите модель для поиска"
                              emptyMessage="Модель не найдена"
                              inputClassName="border-gray-300 focus-visible:border-orange-600 focus-visible:ring-1 focus-visible:ring-orange-600/30 focus-visible:ring-offset-0 bg-white text-gray-900"
                            />
                          )}
                        />
                        {errors.model && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.model.message}
                          </p>
                        )}
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
                      className="data-[state=checked]:bg-orange-600 border-orange-600"
                    />
                    <label
                      htmlFor="triggerNotAuto"
                      className="text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      Моего автомобиля нет в списке
                    </label>
                  </div>
                </div>
                <Dialog
                  open={isContactModalOpen}
                  onOpenChange={(open) =>
                    open
                      ? openModal(CONTACT_MODAL_ID)
                      : closeModal(CONTACT_MODAL_ID)
                  }
                >
                  <div className="mt-6 grid">
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        disabled={!canOpenContactModal()}
                        className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg bg-gradient-to-r from-[#EF9147] to-[#FF6B35] focus:outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md shadow-orange-500"
                        onClick={() => {
                          if (
                            canOpenContactModal() &&
                            canOpenModal(CONTACT_MODAL_ID)
                          ) {
                            openModal(CONTACT_MODAL_ID);
                          }
                        }}
                      >
                        {canOpenContactModal()
                          ? "Заказать обратный звонок"
                          : "Выберите марку и модель автомобиля"}
                      </button>
                    </DialogTrigger>
                  </div>
                  <DialogContent className="sm:max-w-[500px] bg-white border-orange-600 rounded-xl shadow-lg">
                    <DialogHeader>
                      <DialogTitle className="text-black">
                        Заказать обратный звонок
                      </DialogTitle>
                      <DialogDescription className="text-gray-600">
                        Оставьте свои контактные данные и мы свяжемся с вами в
                        ближайшее время
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <label
                          htmlFor="modal-name"
                          className="text-sm font-medium text-gray-700"
                        >
                          Имя
                        </label>
                        <Input
                          id="modal-name"
                          placeholder="Введите ваше имя"
                          {...register("name")}
                          className={`${errors.name
                            ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30"
                            : "border-gray-300 focus-visible:border-orange-600 focus-visible:ring-1 focus-visible:ring-orange-600/30 focus-visible:ring-offset-0"
                            } bg-white text-gray-900`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label
                          htmlFor="modal-phone"
                          className="text-sm font-medium text-gray-700"
                        >
                          Номер телефона
                        </label>
                        <Input
                          id="modal-phone"
                          placeholder="+7 (999) 999-99-99"
                          {...register("phone")}
                          className={`${errors.phone
                            ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30"
                            : "border-gray-300 focus-visible:border-orange-600 focus-visible:ring-1 focus-visible:ring-orange-600/30 focus-visible:ring-offset-0"
                            } bg-white text-gray-900 focus-visible:ring-[1px]`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col space-y-3">
                        <label className="text-sm font-medium text-gray-700">
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
                                  className="border-orange-600 data-[state=checked]:bg-orange-600"
                                />
                                <label
                                  htmlFor="contact-telegram"
                                  className="flex items-center space-x-2 text-sm cursor-pointer text-gray-900 hover:text-orange-600 transition-colors"
                                >
                                  <Send className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                  <span>Telegram</span>
                                </label>
                              </div>
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem
                                  value="whatsapp"
                                  id="contact-whatsapp"
                                  className="border-orange-600 data-[state=checked]:bg-orange-600"
                                />
                                <label
                                  htmlFor="contact-whatsapp"
                                  className="flex items-center space-x-2 text-sm cursor-pointer text-gray-900 hover:text-orange-600 transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                                  <span>WhatsApp</span>
                                </label>
                              </div>
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem
                                  value="phone"
                                  id="contact-phone"
                                  className="border-orange-600 data-[state=checked]:bg-orange-600"
                                />
                                <label
                                  htmlFor="contact-phone"
                                  className="flex items-center space-x-2 text-sm cursor-pointer text-gray-900 hover:text-orange-600 transition-colors"
                                >
                                  <Phone className="w-4 h-4 text-orange-600" />
                                  <span>Мобильный телефон</span>
                                </label>
                              </div>
                            </RadioGroup>
                          )}
                        />
                        {errors.contactMethod && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.contactMethod.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        onClick={() => closeModal(CONTACT_MODAL_ID)}
                        className="mr-2 h-9 px-4 py-2 rounded-md border border-orange-600 bg-white text-gray-700 hover:bg-orange-50 hover:text-gray-800 transition-colors"
                      >
                        Отмена
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-[#EF9147] to-[#FF6B35] hover:opacity-90 text-white shadow-orange-500"
                        onClick={handleSubmit((data) => {
                          onSubmit(data);
                          closeModal(CONTACT_MODAL_ID);
                        })}
                      >
                        Отправить заявку
                      </Button>
                    </DialogFooter>
                    <p className="text-xs text-center text-gray-600">
                      Нажимая кнопку “Отправить заявку” Соглашаюсь с{" "}
                      <Link href={"/pk"} className="underline hover:text-orange-600">
                        политикой конфиденциальности
                      </Link>
                    </p>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
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
              <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-600 hover:shadow-xl transition-shadow duration-300">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <h3 className="text-2xl font-bold text-black mb-2">
                    Стоимость обработки
                  </h3>
                  <p className="text-orange-600 font-medium">
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
                      className="bg-white p-4 rounded-lg shadow-md border border-orange-600/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer group hover:border-orange-600/50"
                      onClick={() => handleServiceClick(item)}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.label}
                        </p>
                        <motion.p
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{
                            delay: 0.1 * index + 0.4,
                            type: "spring",
                          }}
                          className="text-xl font-bold text-orange-600 mb-2"
                        >
                          {item.price} ₽
                        </motion.p>
                        <div className="flex items-center justify-center text-xs text-gray-500 group-hover:text-orange-600 transition-colors">
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

        <Dialog
          open={isServiceModalOpen}
          onOpenChange={(open) =>
            open ? openModal(SERVICE_MODAL_ID) : closeModal(SERVICE_MODAL_ID)
          }
        >
          <DialogContent className="sm:max-w-[600px] bg-white border-orange-600 rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-black">
                <span>{selectedService?.icon}</span>
                <span>{selectedService?.label}</span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-left">
                {selectedService &&
                  serviceDescriptions[selectedService.label]?.description}
              </DialogDescription>
            </DialogHeader>
            <div>
              <div className="flex justify-around">
                <div className="flex flex-col items-center">
                  <h4 className="font-medium text-sm text-gray-700">
                    Длительность
                  </h4>
                  <p className="text-orange-600 font-semibold">
                    {selectedService &&
                      serviceDescriptions[selectedService.label]?.duration}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <h4 className="font-medium text-sm text-gray-700">
                    Гарантия
                  </h4>
                  <p className="text-orange-600 font-semibold">
                    {selectedService &&
                      serviceDescriptions[selectedService.label]?.warranty}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">
                  Что включено:
                </h4>
                {isMobile ? <ScrollArea className="max-h-40 overflow-x-hidden mb-4">
                  <ul className="space-y-1">
                    {selectedService &&
                      serviceDescriptions[selectedService.label]?.includes.map(
                        (item, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2 text-sm text-gray-700"
                          >
                            <span className="text-orange-600 mt-1">
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        )
                      )}
                  </ul>
                </ScrollArea> : <ul className="space-y-1">
                  {selectedService &&
                    serviceDescriptions[selectedService.label]?.includes.map(
                      (item, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-sm text-gray-700"
                        >
                          <span className="text-orange-600 mt-1">
                            •
                          </span>
                          <span>{item}</span>
                        </li>
                      )
                    )}
                </ul>}
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-black">
                    Стоимость:
                  </span>
                  <span className="text-2xl font-bold text-orange-600">
                    {selectedService?.price} ₽
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => closeModal(SERVICE_MODAL_ID)}
                variant="outline"
                className="border-orange-600 text-gray-700 hover:text-gray-500 bg-white"
              >
                Закрыть
              </Button>
              <Button
                className="bg-gradient-to-r from-[#EF9147] to-[#FF6B35] hover:opacity-90 text-white hover:shadow-orange-500"
                onClick={handleOrderService}
              >
                Заказать услугу
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>



      <DuplicateWarningModal
        isOpen={showDuplicateWarning}
        onConfirm={handleConfirmDuplicate}
        onCancel={handleCancelDuplicate}
        minutesAgo={getLastSubmissionTime() || 0}
      />
    </section>
  );
}
