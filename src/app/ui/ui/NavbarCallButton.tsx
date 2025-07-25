"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneIcon } from "@heroicons/react/24/solid";
import { useMediaQuery } from "src/lib/hooks/useMediaQuery";

interface NavbarCallButtonProps {
  phoneNumber?: string;
  className?: string;
}

export default function NavbarCallButton({ 
  phoneNumber = "+7 993 245 68 82",
  className = ""
}: NavbarCallButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1024px)");

  // Don't render on desktop
  if (!isMobile) return null;

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber.replace(/\s/g, "")}`;
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsExpanded(false)}
            />
            
            {/* Dropdown card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[260px] z-50"
            >
              {/* Header */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-orangeDefault rounded-full flex items-center justify-center">
                  <PhoneIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Связаться с нами
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Готовы ответить на вопросы
                  </p>
                </div>
              </div>

              {/* Phone number */}
              <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-center text-sm font-bold text-gray-900 dark:text-white">
                  {phoneNumber}
                </p>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Ежедневно с 09:00 до 20:00
                </p>
              </div>

              {/* Call button */}
              <motion.button
                onClick={handleCall}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-orangeDefault to-orangeDefaultHover hover:from-orangeDefaultHover hover:to-orangeDefault text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
              >
                <PhoneIcon className="w-4 h-4" />
                <span>Позвонить</span>
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Navbar call button */}
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
        <PhoneIcon className="w-8 h-8 text-white relative z-10" />
      </motion.button>
    </div>
  );
}
