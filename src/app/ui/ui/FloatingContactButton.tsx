import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import telegramIcon from "public/icons8-телеграм.svg";
import whatsappIcon from "public/icons8-whatsapp.svg";
import { PhoneIcon } from "@heroicons/react/24/solid";

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleExpanded = () => {
    setIsOpen(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 md:block hidden">
      <motion.button
        onClick={toggleExpanded}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className="relative p-2 bg-gradient-to-r from-orangeDefault to-orangeDefaultHover hover:from-orangeDefaultHover hover:to-orangeDefault rounded-full shadow-lg flex items-center justify-center group"
      >
        {/* Pulse effect */}
        <motion.div
          className="absolute inset-0 bg-orangeDefault rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Icon */}
        <PhoneIcon className="w-10 h-10 text-white relative z-10" />
      </motion.button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`absolute bottom-20 right-0 space-y-3 transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Link
          href="https://api.whatsapp.com/send/?phone=79932456882&text=Добрый+день!+Хочу+записаться+на+обработку&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          className="flex"
        >
          <div
            className="w-12 h-12 bg-orangeDefault hover:bg-orangeDefaultHover rounded-full flex items-center justify-center shadow-md transition-transform duration-500 hover:scale-110"
            title="WhatsApp"
          >
            <Image
              src={whatsappIcon}
              alt="Contact via WhatsApp"
              width={24}
              height={24}
            />
          </div>
        </Link>

        <Link
          href="https://t.me/+79932456882"
          target="_blank"
          rel="noopener noreferrer"
          className="flex"
        >
          <div
            className="w-12 h-12 bg-orangeDefault hover:bg-orangeDefaultHover rounded-full flex items-center justify-center shadow-md transition-transform duration-500 hover:scale-110"
            title="Telegram"
          >
            <Image
              src={telegramIcon}
              alt="Contact via Telegram"
              width={24}
              height={24}
            />
          </div>
        </Link>

        <a href="tel:+7 993 245 68 82" className="flex">
          <div
            className="w-12 h-12 bg-orangeDefault hover:bg-orangeDefaultHover rounded-full flex items-center justify-center shadow-md transition-transform duration-500 hover:scale-110"
            title="Call us"
          >
            <PhoneIcon className="h-8 w-8 text-white" />
          </div>
        </a>
      </div>
    </div>
  );
}
