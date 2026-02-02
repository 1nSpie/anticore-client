"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import NavigationButton from "@/app/glav/components/ui/NavButton";
import { Phone, MapPin, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { navigationLinks } from "src/lib/contants";

const ADDRESSES = [
  { name: "Жуковский", address: "Речной проезд, 14", link: "/#map" },
  { name: "Коломна", address: "село Чанки, ул. Центральная 152", link: "/#map" },
];

const PRICE_RANGE = "Цены";

export default function Navigation() {
  const pathname = usePathname();
  const [showAddresses, setShowAddresses] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isHome = pathname === "/";
  const showFullNav = !isHome || isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 ${
        showFullNav ? "border-b border-teal-200/50" : "border-b border-transparent"
      }`}
      style={{
        background: showFullNav
          ? "linear-gradient(90deg, #F0FDFA 0%, #CBFBF1 100%)"
          : "transparent",
        transition: "background 0.4s ease, border-color 0.4s ease",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full gap-4">
          {/* Логотип слева */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/trans_bg1.svg"
              alt="АванКор"
              width={180}
              height={48}
              className="object-contain"
              priority
            />
          </Link>

          {/* Навигационные ссылки (десктоп) */}
          {showFullNav ? (
            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:flex items-center gap-5 xl:gap-6 flex-1 justify-center min-w-0"
            >
              {navigationLinks.map((link) => (
                <Link
                  key={link.link}
                  href={link.link}
                  className={`text-sm font-medium transition-colors shrink-0 ${
                    pathname === link.link ||
                    (link.link === "/" && pathname === "/")
                      ? "text-teal-700"
                      : "text-gray-700 hover:text-teal-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </motion.nav>
          ) : (
            <div className="hidden lg:block flex-1 min-w-0" aria-hidden />
          )}

          {/* Правая часть */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            {showFullNav && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="contents"
              >
                <Link
                  href="/#prices"
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:text-teal-600 hover:bg-teal-100/50 transition-all duration-200"
                >
                  <span className="text-sm font-medium">{PRICE_RANGE}</span>
                </Link>

                <div className="relative hidden lg:block">
                  <button
                    onClick={() => setShowAddresses(!showAddresses)}
                    onMouseEnter={() => setShowAddresses(true)}
                    onMouseLeave={() => setShowAddresses(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:text-teal-600 hover:bg-teal-100/50 transition-all duration-200"
                  >
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">Адреса</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showAddresses ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showAddresses && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        onMouseEnter={() => setShowAddresses(true)}
                        onMouseLeave={() => setShowAddresses(false)}
                        className="absolute top-full mt-1 right-0 w-72 py-2 bg-white rounded-xl border border-teal-200 shadow-xl"
                      >
                        {ADDRESSES.map((addr) => (
                          <Link
                            key={addr.name}
                            href={addr.link}
                            className="block px-4 py-2.5 text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                          >
                            <div className="font-medium text-sm">
                              {addr.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {addr.address}
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href="tel:+79932456882"
                  className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-teal-600 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">+7 (993) 245-68-82</span>
                </Link>
              </motion.div>
            )}

            <div className={showFullNav ? "lg:hidden" : ""}>
              <NavigationButton variant="light" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
