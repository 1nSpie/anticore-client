// components/NavigationButton.tsx
"use client";

import { useState, memo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { navigationLinks } from "src/lib/contants";

const buttonStyles = {
  light:
    "p-3 text-gray-800 hover:text-teal-600 transition-colors duration-300 bg-teal-100/80 border border-teal-200 rounded-full hover:bg-teal-200/80",
  dark:
    "p-3 text-black dark:text-white hover:text-orangeDefault dark:hover:text-orangeLight transition-colors duration-300 bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-full hover:bg-white/20 dark:hover:bg-white/5",
};
const linkStyles = {
  light:
    "block text-4xl lg:text-6xl font-light text-gray-800 hover:text-teal-600 transition-all duration-500 hover:scale-105 transform",
  dark:
    "block text-4xl lg:text-6xl font-light text-black dark:text-white hover:text-orangeDefault dark:hover:text-orangeLight transition-all duration-500 hover:scale-105 transform",
};
const linkStyleObject = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  letterSpacing: "0.1em",
};

const NavigationButton = memo(({ variant = "dark" }: { variant?: "light" | "dark" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Блокируем скролл при открытом меню
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  return (
    <>
      {/* Кнопка открытия меню */}
      <button
        onClick={toggleMenu}
        className={buttonStyles[variant]}
        aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
      >
        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Полноэкранное меню */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] w-screen h-screen"
          >
            {/* Фон с блюром */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 w-full h-full backdrop-blur-md ${
                variant === "light" ? "bg-teal-900/20" : "bg-black/40 dark:bg-black/60"
              }`}
              onClick={closeMenu}
            />

            {/* Контент меню */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 200,
              }}
              className={`absolute top-0 left-0 right-0 w-full h-full backdrop-blur-xl shadow-2xl overflow-hidden ${
                variant === "dark" ? "bg-white/95 dark:bg-gray-900/95" : ""
              }`}
              style={variant === "light" ? { background: "linear-gradient(180deg, #F0FDFA 0%, #CBFBF1 100%)" } : undefined}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Хедер меню с кнопкой закрытия */}
              <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${
                variant === "light" ? "border-teal-200/60" : "border-gray-200/50 dark:border-gray-700/50"
              }`}>
                <div className={`text-sm ${
                  variant === "light" ? "text-gray-600" : "text-gray-500 dark:text-gray-400"
                }`}>
                  Навигация по сайту
                </div>
                <button
                  onClick={closeMenu}
                  className={buttonStyles[variant]}
                  aria-label="Закрыть меню"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Основной контент */}
              <div className="w-full h-[calc(100vh-80px)] overflow-y-auto">
                <div className="flex flex-col items-center justify-center min-h-full px-4 sm:px-6 py-10 sm:py-16">
                  {/* Навигация */}
                  <nav className="text-center space-y-6 sm:space-y-8 w-full max-w-4xl">
                    {navigationLinks.map((link, index) => (
                      <motion.div
                        key={link.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: index * 0.1,
                          duration: 0.4,
                          ease: "easeOut",
                        }}
                      >
                        <Link
                          href={link.link}
                          onClick={closeMenu}
                          className={`${linkStyles[variant]} block w-full`}
                          style={linkStyleObject}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                  </nav>

                  {/* Контакты и дополнительные действия */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: navigationLinks.length * 0.1 + 0.2,
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                    className={`mt-12 sm:mt-16 pt-8 sm:pt-12 border-t w-full max-w-4xl ${
                      variant === "light" ? "border-teal-200/60" : "border-gray-200/50 dark:border-gray-700/50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div>
                        <h3 className={`text-lg font-semibold mb-3 ${
                          variant === "light" ? "text-gray-800" : "text-gray-800 dark:text-gray-200"
                        }`}>
                          Контакты
                        </h3>
                        <Link
                          href="tel:+79932456882"
                          onClick={closeMenu}
                          className={`text-2xl sm:text-3xl transition-colors block ${
                            variant === "light"
                              ? "text-gray-800 hover:text-teal-600"
                              : "text-black dark:text-white hover:text-orangeDefault dark:hover:text-orangeLight"
                          }`}
                        >
                          +7 (993) 245-68-82
                        </Link>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Link
                          href="/#auto-price"
                          onClick={closeMenu}
                          className="px-6 py-3 bg-orangeDefault hover:bg-orangeDefaultHover text-white rounded-lg font-medium transition-colors text-center"
                        >
                          Узнать стоимость
                        </Link>
                        <Link
                          href="/#map"
                          onClick={closeMenu}
                          className={`px-6 py-3 border rounded-lg font-medium transition-colors text-center ${
                            variant === "light"
                              ? "border-teal-300 text-gray-800 hover:bg-teal-100"
                              : "border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          Написать нам
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

NavigationButton.displayName = "NavigationButton";

export default NavigationButton;
