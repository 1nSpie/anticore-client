"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRightIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useScrollNavigation } from "src/lib/hooks/useScrollNavigation";

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
}

const navigationItems: NavigationItem[] = [
  { id: "hero", label: "Главная", icon: "🏠" },
  { id: "auto-price", label: "Калькулятор цен", icon: "💰" },
  { id: "tech-process", label: "Этапы работ", icon: "⚙️" },
  { id: "garanty", label: "Гарантия", icon: "🛡️" },
  { id: "reviews", label: "Материалы", icon: "📦" },
  { id: "prices", label: "Прайс-лист", icon: "📋" },
  { id: "map", label: "Контакты", icon: "📍" },
];

export default function FloatingNavigation() {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    activeSection,
    isVisible,
    scrollToSection: handleScrollToSection,
  } = useScrollNavigation(navigationItems);

  const scrollToSection = (
    e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
    sectionId: string
  ) => {
    e.stopPropagation();
    handleScrollToSection(sectionId);
  };

  // Auto-close navigation when hero section becomes active
  useEffect(() => {
    if (!isVisible) {
      setIsExpanded(false);
    }
  }, [isVisible]);

  const currentItem = navigationItems.find((item) => item.id === activeSection);

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop Version */}
      <div className="fixed left-4 top-3/4 transform -translate-y-1/2 z-40 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Compact view */}
          <AnimatePresence mode="wait">
            {!isExpanded && (
              <motion.div
                key="compact"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setIsExpanded(true)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-greenDefault rounded-full flex items-center justify-center text-white text-sm">
                    {currentItem?.icon || "📍"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {currentItem?.label || "Навигация"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Текущий раздел
                    </p>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expanded view */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="w-64"
              >
                {/* Header */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bars3Icon className="w-4 h-4 text-greenDefault" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Навигация по странице
                      </span>
                    </div>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <ChevronRightIcon className="w-4 h-4 transform rotate-180" />
                    </button>
                  </div>
                </div>

                {/* Navigation items */}
                <div className="py-2">
                  {navigationItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={(e) => scrollToSection(e, item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-200 ${
                        activeSection === item.id
                          ? "bg-teal-50 dark:bg-teal-900/20 border-r-2 border-greenDefault"
                          : "border-r-2 border-transparent"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          activeSection === item.id
                            ? "bg-greenDefault text-white"
                            : "bg-gray-200 dark:bg-gray-600"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span
                        className={`text-sm ${
                          activeSection === item.id
                            ? "text-greenDefault font-medium"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.label}
                      </span>
                      {activeSection === item.id && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-2 h-2 bg-greenDefault rounded-full"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Нажмите на раздел для перехода
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Mobile Version */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 lg:hidden">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-2 py-1"
        >
          <div className="flex items-center space-x-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                  activeSection === item.id
                    ? "bg-greenDefault text-white scale-110"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                title={item.label}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
