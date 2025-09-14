// components/NavigationButton.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { navigationLinks } from "src/lib/contants";

export default function NavigationButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMenuOpen(true)}
        className="p-3 text-black dark:text-white hover:text-orangeDefault dark:hover:text-orangeLight transition-colors duration-300 bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-full hover:bg-white/20 dark:hover:bg-white/5"
      >
        <Menu className="w-5 h-5" />
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: isMenuOpen ? 1 : 0,
          pointerEvents: isMenuOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md"
      >
        <div className="flex flex-col min-h-screen">
          <div className="flex items-center justify-between p-6 lg:p-8">
            <div className="w-12 h-12"></div> {/* Пустой элемент для баланса */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={closeMenu}
              className="p-3 mt-3.5 text-black dark:text-white hover:text-orangeDefault dark:hover:text-orangeLight transition-colors duration-300 bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10 rounded-full hover:bg-white/20 dark:hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
          {/* Navigation Links */}
          <div className="flex-1 flex items-center justify-center">
            <nav className="text-center space-y-8">
              {navigationLinks.map((link, index) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{
                    opacity: isMenuOpen ? 1 : 0,
                    x: isMenuOpen ? 0 : -50,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: isMenuOpen ? index * 0.1 : 0,
                  }}
                >
                  <Link
                    href={link.link}
                    onClick={closeMenu}
                    className="block text-4xl lg:text-6xl font-light text-black dark:text-white hover:text-orangeDefault dark:hover:text-orangeLight transition-all duration-500 hover:scale-105 transform"
                    style={{
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: isMenuOpen ? 1 : 0,
              y: isMenuOpen ? 0 : 50,
            }}
            transition={{ duration: 0.5, delay: isMenuOpen ? 0.6 : 0 }}
            className="p-6 lg:p-8 text-center"
          >
            <div className="space-y-2">
              <Link
                href="tel:+79932456882"
                className="block text-black dark:text-white hover:text-orangeDefault dark:hover:text-orangeLight transition-colors text-xl"
                onClick={closeMenu}
              >
                +7 (993) 245-68-82
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
