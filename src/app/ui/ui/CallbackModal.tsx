// components/CallbackModal.tsx
"use client";

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
import { Input } from "src/shadcn/input";
import { Label } from "src/shadcn/label";
import { Textarea } from "src/shadcn/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { telegramApiClient } from "src/components/telegram/api";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { callbackFormSchema, type CallbackFormData } from "src/lib/validations";

interface CallbackModalProps {
  trigger?: React.ReactNode; // любая кнопка или элемент
  hasOpen?: boolean;
  setView?: (status: boolean) => void;
}

export function CallbackModal({
  trigger,
  hasOpen,
  setView,
}: CallbackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathName = usePathname();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CallbackFormData>({
    resolver: zodResolver(callbackFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      message: "",
      href: pathName,
    },
  });

  const onSubmit = async (data: CallbackFormData) => {
    try {
      await telegramApiClient.sendCallbackForm(data);
      toast.success("Ваша заявка отправлена!", {
        description: "Менеджер перезвонит вам в ближайшее время",
      });
      reset();
      if (setView) {
        setView(false);
      } else {
        setIsOpen(false);
      }
    } catch (error) {
      toast.error("Упс, что-то пошло не так!", {
        description: error instanceof Error ? error.message : "Повторите позже или свяжитесь с нами напрямую",
        action: {
          label: "Позвонить",
          onClick: () => {
            window.location.href = `tel:${89932456882}`;
          },
        },
      });
    }
  };

  return (
    <Dialog
      open={hasOpen ? hasOpen : isOpen}
      onOpenChange={setView ? setView : setIsOpen}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">
            Заказать обратный звонок
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Оставьте свои контактные данные и мы свяжемся с вами в течение 15
            минут
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-200">
              Ваше имя
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Введите ваше имя"
              className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700 dark:text-gray-200">
              Номер телефона
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="+7 (___) ___-__-__"
              className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                errors.phone ? "border-red-500" : ""
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="message"
              className="text-gray-700 dark:text-gray-200"
            >
              Сообщение (необязательно)
            </Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Расскажите о вашем автомобиле или задайте вопрос"
              className={`bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none ${
                errors.message ? "border-red-500" : ""
              }`}
              rows={3}
            />
            {errors.message && (
              <p className="text-red-500 text-sm">{errors.message.message}</p>
            )}
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="submit"
              className="w-full bg-orangeDefault hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              Отправить заявку
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
