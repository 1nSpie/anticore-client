"use client";

import React, { useState } from "react";
import {
  Phone,
  User,
  MessageSquare,
  Car,
} from "lucide-react";
import axios from "axios";

// shadcn/ui components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "src/shadcn/dialog";
import { Button } from "src/shadcn/button";
import { Input } from "src/shadcn/input";
import { Label } from "src/shadcn/label";
import { Textarea } from "src/shadcn/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/shadcn/select";

interface FeedbackModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

interface FormData {
  phone: string;
  name: string;
  communicationMethod: string;
  carDescription: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  showModal,
  setShowModal,
}) => {
  const [formData, setFormData] = useState<FormData>({
    phone: "",
    name: "",
    communicationMethod: "phone",
    carDescription: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Send data to backend
      const response = await axios.post(
        "http://localhost:4444/api/feedback",
        formData
      );

      if (response.data.success) {
        console.log("Form submitted successfully:", response.data);

        // Auto-close after 3 seconds
        setTimeout(() => {
          setShowModal(false);

          setFormData({
            phone: "",
            name: "",
            communicationMethod: "phone",
            carDescription: "",
          });
        }, 3000);
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // You might want to show an error message to the user here
      alert("Произошла ошибка при отправке формы. Попробуйте еще раз.");
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, communicationMethod: value }));
  };

  // Main Form Dialog with comprehensive dark theme
  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Оставить заявку
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Заполните форму, и мы свяжемся с вами для консультации по
            антикоррозийной обработке
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <User
                size={16}
                className="text-orangeDefault dark:text-orangeDefault"
              />
              Ваше имя
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Введите ваше имя"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-orangeDefault focus:border-orangeDefault dark:focus:ring-orangeDefault dark:focus:border-orangeDefault"
              required
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Phone
                size={16}
                className="text-orangeDefault dark:text-orangeDefault"
              />
              Номер телефона
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+7 (999) 123-45-67"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-orangeDefault focus:border-orangeDefault dark:focus:ring-orangeDefault dark:focus:border-orangeDefault"
              required
            />
          </div>

          {/* Communication Method */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <MessageSquare
                size={16}
                className="text-orangeDefault dark:text-orangeDefault"
              />
              Способ связи
            </Label>
            <Select
              value={formData.communicationMethod}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-orangeDefault focus:border-orangeDefault dark:focus:ring-orangeDefault dark:focus:border-orangeDefault">
                <SelectValue
                  placeholder="Выберите способ связи"
                  className="text-gray-500 dark:text-gray-400"
                />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem
                  value="phone"
                  className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-orange-50 dark:focus:bg-orange-900/20"
                >
                  Телефонный звонок
                </SelectItem>
                <SelectItem
                  value="whatsapp"
                  className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-orange-50 dark:focus:bg-orange-900/20"
                >
                  WhatsApp
                </SelectItem>
                <SelectItem
                  value="telegram"
                  className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-orange-50 dark:focus:bg-orange-900/20"
                >
                  Telegram
                </SelectItem>
                <SelectItem
                  value="email"
                  className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-orange-50 dark:focus:bg-orange-900/20"
                >
                  Email
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Car Description */}
          <div className="space-y-2">
            <Label
              htmlFor="carDescription"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Car size={16} className="text-orangeDefault dark:text-orangeDefault" />
              Описание автомобиля
            </Label>
            <Textarea
              id="carDescription"
              name="carDescription"
              value={formData.carDescription}
              onChange={handleInputChange}
              rows={4}
              placeholder="Например: Toyota Camry 2018, пробег 80 000 км, требуется обработка днища и скрытых полостей"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-orangeDefault focus:border-orangeDefault dark:focus:ring-orangeDefault dark:focus:border-orangeDefault resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-orangeDefault hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold py-3 px-6 transition-colors shadow-md hover:shadow-lg"
          >
            Отправить заявку
          </Button>
        </form>

        {/* Privacy Note */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          `{"Нажимая кнопку \"Отправить заявку\", вы соглашаетесь на обработку персональных данных"}`
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
