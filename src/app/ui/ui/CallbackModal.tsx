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
import { checkDuplicateSubmission, saveSubmission, getLastSubmissionTime } from "src/lib/duplicateCheck";
import { DuplicateWarningModal } from "./DuplicateWarningModal";

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
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [pendingData, setPendingData] = useState<CallbackFormData | null>(null);
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

  const submitForm = async (data: CallbackFormData) => {
    try {
      await telegramApiClient.sendCallbackForm(data);
      saveSubmission();
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

  const onSubmit = async (data: CallbackFormData) => {
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

  return (
    <Dialog
      open={hasOpen ? hasOpen : isOpen}
      onOpenChange={setView ? setView : setIsOpen}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-orange-600 rounded-xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-gray-900">
            Заказать обратный звонок
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Оставьте свои контактные данные и мы свяжемся с вами в ближайшее время
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">
              Ваше имя
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Введите ваше имя"
              className={`${
                errors.name
                  ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30"
                  : "border-orange-600/60 focus-visible:border-orange-600 focus-visible:ring-1 focus-visible:ring-orange-600/30 focus-visible:ring-offset-0"
              } bg-white text-gray-900 placeholder:text-gray-500`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700">
              Номер телефона
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="+7 (___) ___-__-__"
              className={`${
                errors.phone
                  ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30"
                  : "border-orange-600/60 focus-visible:border-orange-600 focus-visible:ring-1 focus-visible:ring-orange-600/30 focus-visible:ring-offset-0"
              } bg-white text-gray-900 placeholder:text-gray-500`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-700">
              Сообщение (необязательно)
            </Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Расскажите о вашем автомобиле или задайте вопрос"
              className={`${
                errors.message
                  ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/30"
                  : "border-orange-600/60 focus-visible:border-orange-600 focus-visible:ring-1 focus-visible:ring-orange-600/30 focus-visible:ring-offset-0"
              } bg-white text-gray-900 placeholder:text-gray-500 resize-none`}
              rows={3}
            />
            {errors.message && (
              <p className="text-red-500 text-sm">{errors.message.message}</p>
            )}
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#EF9147] to-[#FF6B35] hover:opacity-90 text-white shadow-md hover:shadow-orange-500/30 transition-all duration-200"
            >
              Отправить заявку
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <DuplicateWarningModal
        isOpen={showDuplicateWarning}
        onConfirm={handleConfirmDuplicate}
        onCancel={handleCancelDuplicate}
        minutesAgo={getLastSubmissionTime() || 0}
      />
    </Dialog>
  );
}