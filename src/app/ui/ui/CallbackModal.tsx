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
import { telegramApiClient } from "src/components/telegram/api";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

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
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
    href: pathName,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    telegramApiClient
      .sendCallbackForm(formData)
      .then(() =>
        toast.success("Ваша заявка отправлена!", {
          description: "Менеджер перезвонит вам в ближайшее время",
        })
      )
      .catch(() =>
        toast.error("Упс, что-то пошло не так!", {
          description: "Повторите позже или свяжитесь с нами напрямую",
          action: {
            label: "Позвонить",
            onClick: () => {
              window.location.href = `tel:${89932456882}`;
            },
          },
        })
      );
    setIsOpen(false);
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-200">
              Ваше имя
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Введите ваше имя"
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700 dark:text-gray-200">
              Номер телефона
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+7 (___) ___-__-__"
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              required
            />
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
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Расскажите о вашем автомобиле или задайте вопрос"
              className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none"
              rows={3}
            />
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
