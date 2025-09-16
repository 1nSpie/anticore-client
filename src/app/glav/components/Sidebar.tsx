"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FaWrench,
  FaCogs,
  FaRegLightbulb,
  FaRegCommentDots,
  FaTags,
  FaMapMarkedAlt,
} from "react-icons/fa";

export default function Sidebar() {
  const navItems = useMemo(
    () => [
      { label: "Услуги", href: "#auto-price", icon: <FaWrench /> },
      { label: "Технология", href: "#tech-process", icon: <FaCogs /> },
      { label: "Гарантия", href: "#garanty", icon: <FaRegLightbulb /> },
      { label: "Отзывы", href: "#reviews", icon: <FaRegCommentDots /> },
      { label: "Цены", href: "#prices", icon: <FaTags /> },
      { label: "Контакты", href: "#map", icon: <FaMapMarkedAlt /> },
    ],
    []
  );

  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -60% 0px",
        threshold: 0.5,
      }
    );

    const sections = navItems.map((item) =>
      document.getElementById(item.href.replace("#", ""))
    );

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, [navItems]);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <aside
      className="w-64 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl p-6 rounded-lg transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-700"
      style={{ position: "absolute", top: "80px", left: "0" }}
    >
      <ul className="space-y-2">
        {navItems.map((item) => {
          const id = item.href.replace("#", "");
          const isActive = activeId === id;

          return (
            <li key={id}>
              <Link
                href={item.href}
                onClick={(e) => handleScroll(e, id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-greenDefault text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-700"
                }`}
              >
                <span
                  className={`text-lg ${
                    isActive ? "text-white" : "text-greenDefault"
                  }`}
                >
                  {item.icon}
                </span>
                <span className={isActive ? "font-semibold" : ""}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Декоративная линия */}
      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent dark:via-teal-600"></div>
      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Следуйте за нами на странице
      </p>
    </aside>
  );
}
