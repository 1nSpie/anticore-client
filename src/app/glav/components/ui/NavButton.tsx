// components/NavigationButton.tsx
"use client";

import { useState, memo } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { navigationLinks } from "src/lib/contants";

// Оригинальные стили
const buttonStyles =
  "p-3 text-black dark:text-white hover:text-orangeDefault dark:hover:text-orangeLight transition-colors duration-300 bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-full hover:bg-white/20 dark:hover:bg-white/5";
const linkStyles =
  "block text-4xl lg:text-6xl font-light text-black dark:text-white hover:text-orangeDefault dark:hover:text-orangeLight transition-all duration-500 hover:scale-105 transform";
const linkStyleObject = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  letterSpacing: "0.1em",
};

const NavigationButton = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <button
        onClick={toggleMenu}
        className={buttonStyles}
        aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
      >
        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Фон */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-md"
            onClick={closeMenu}
          />

          {/* Контент меню с кнопкой закрытия */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {/* Кнопка закрытия в правом верхнем углу */}
            <div className="absolute right-6 top-6 z-10">
              <button
                onClick={closeMenu}
                className={`${buttonStyles} mt-3.5`}
                aria-label="Закрыть меню"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Основной контент */}
            <div
              className="flex flex-col items-center justify-center h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Навигация */}
              <nav className="text-center space-y-8">
                {navigationLinks.map((link) => (
                  <div key={link.label}>
                    <Link
                      href={link.link}
                      onClick={closeMenu}
                      className={linkStyles}
                      style={linkStyleObject}
                    >
                      {link.label}
                    </Link>
                  </div>
                ))}
              </nav>

              {/* Телефон */}
              <div className="mt-12">
                <Link
                  href="tel:+79932456882"
                  onClick={closeMenu}
                  className="block text-black dark:text-white hover:text-orangeDefault dark:hover:text-orangeLight transition-colors text-xl"
                >
                  +7 (993) 245-68-82
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
});

NavigationButton.displayName = "NavigationButton";

export default NavigationButton;
