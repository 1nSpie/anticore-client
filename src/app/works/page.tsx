"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { worksApi, Work, WorkCategory } from "./worksApi";
import ServerImage from "../ui/ui/ServerImage";
import FeedbackLine from "../ui/ui/FeedbackLine";

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// Animation variants for the cards grid
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      duration: 0.3,
    },
  },
};

// Animation variants for individual cards
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 60,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.8,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

export default function WorksPage() {
  const router = useRouter();
  const [works, setWorks] = useState<Work[]>([]);
  const [categories, setCategories] = useState<WorkCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [worksData, categoriesData] = await Promise.all([
          worksApi.getWorks(),
          worksApi.getWorkCategories(),
        ]);
        setWorks(worksData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load works");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryFilter = async (categoryId: number | null) => {
    try {
      setFiltering(true);
      setSelectedCategory(categoryId);
      const filteredWorks = await worksApi.getWorks({
        categoryId: categoryId || undefined,
        published: true,
      });
      setWorks(filteredWorks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter works");
    } finally {
      setFiltering(false);
    }
  };

  const handleWorkClick = (work: Work) => {
    router.push(`/works/${work.id}`);
  };

  if (loading) {
    return (
      <div className="bg-background1 dark:bg-backgroundDark min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orangeDefault mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Загрузка работ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background1 dark:bg-backgroundDark min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orangeDefault hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={pageVariants}
      transition={{ type: "spring", duration: 0.5 }}
      className="bg-background1 dark:bg-backgroundDark min-h-screen"
    >
      <section className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl lg:leading-tight text-black dark:text-white">
            Наши работы
          </h1>
          <p className="mt-4 md:text-lg text-black dark:text-neutral-200 max-w-3xl mx-auto">
            Примеры выполненных проектов по антикоррозийной обработке
            автомобилей разных марок и моделей
          </p>
        </motion.div>

        {/* Categories Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => handleCategoryFilter(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? "bg-orangeDefault text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-600"
            }`}
          >
            Все работы
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryFilter(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-orangeDefault text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-gray-600"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Works Grid */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {filtering ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background1 dark:bg-backgroundDark bg-opacity-50 flex items-center justify-center z-10"
              >
                <div className="text-center">
                  <motion.div
                    className="w-8 h-8 border-b-2 border-orangeDefault mx-auto mb-2 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.p
                    className="text-gray-600 dark:text-gray-300 text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Фильтрация работ...
                  </motion.p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="works-grid"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {works.map((work, index) => (
                  <motion.article
                    key={work.id}
                    layoutId={`work-${work.id}`}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg cursor-pointer transform-gpu perspective-1000"
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => handleWorkClick(work)}
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Before/After Images */}
                    <motion.div
                      className="relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="grid grid-cols-2 gap-0.5">
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-600">
                          <ServerImage
                            filePath={work.beforeImage ?? ""}
                            alt={`${work.title} - До обработки`}
                            fill
                            className="object-cover object-center transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                            quality={90}
                            priority={index < 6}
                          />
                          <motion.div
                            className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium shadow-sm"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            До
                          </motion.div>
                        </div>
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-600">
                          <ServerImage
                            filePath={work.afterImage ?? ""}
                            alt={`${work.title} - После обработки`}
                            fill
                            className="object-cover object-center transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                            quality={90}
                            priority={index < 6}
                          />
                          <motion.div
                            className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium shadow-sm"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                          >
                            После
                          </motion.div>
                        </div>
                      </div>
                      <motion.div
                        className="absolute top-2 right-2 flex gap-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <span className="bg-orangeDefault text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                          {work.year}
                        </span>
                        {work.featured && (
                          <motion.span
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3,
                            }}
                          >
                            ★
                          </motion.span>
                        )}
                      </motion.div>
                    </motion.div>

                    {/* Content */}
                    <div className="px-6 pt-6 h-72">
                      <motion.div
                        className="flex items-center gap-2 mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <span className="text-xs text-orange-600 dark:text-orangeDefault font-medium">
                          {work.category.name}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {work.carBrand} {work.carModel}
                        </span>
                      </motion.div>

                      <motion.h3
                        className="text-lg font-bold text-black dark:text-white mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        {work.title}
                      </motion.h3>
                      <motion.p
                        className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        {work.description}
                      </motion.p>

                      {/* Services */}
                      <motion.div
                        className="mb-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Выполненные работы:
                        </h4>
                        <ul className="space-y-1">
                          {work.services
                            .slice(0, 3)
                            .map((service, serviceIndex) => (
                              <motion.li
                                key={service.id}
                                className="flex items-center text-xs text-gray-600 dark:text-gray-300"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: 0.8 + index * 0.1 + serviceIndex * 0.1,
                                }}
                              >
                                <svg
                                  className="w-3 h-3 text-greenDefault mr-2 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {service.name}
                              </motion.li>
                            ))}
                          {work.services.length > 3 && (
                            <li className="text-xs text-gray-500 dark:text-gray-400 ml-5">
                              +{work.services.length - 3} еще...
                            </li>
                          )}
                        </ul>
                      </motion.div>
                    </div>
                    <motion.div
                      className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-gray-700"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Время работы: {work.duration}
                      </span>
                      <motion.button
                        className="text-orangeDefault hover:text-orange-600 font-medium text-sm transition-colors flex items-center gap-1"
                        whileHover={{ x: 5 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        Подробнее
                        <motion.span
                          animate={{ x: [0, 3, 0] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                        >
                          →
                        </motion.span>
                      </motion.button>
                    </motion.div>
                  </motion.article>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {works.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              Работы не найдены
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Попробуйте выбрать другую категорию или обновите страницу
            </p>
          </div>
        )}
      </section>
    <FeedbackLine />
    </motion.div>
  );
}
