"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { worksApi, Work, WorkCategory } from "./worksApi";
import Link from "next/link";
import ServerImage from "../ui/ui/ServerImage";

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
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
          {filtering && (
            <div className="absolute inset-0 bg-background1 dark:bg-backgroundDark bg-opacity-50 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orangeDefault mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Фильтрация работ...</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <AnimatePresence mode="wait">
              {works.map((work, index) => (
                <motion.div
                  key={`${work.id}-${selectedCategory || 'all'}`}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: filtering ? 0 : index * 0.05,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleWorkClick(work)}
                >
              {/* Before/After Images */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-600">
                    <ServerImage
                      filePath={work.beforeImage ?? ""}
                      alt={`${work.title} - До обработки`}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      quality={90}
                      priority={index < 6}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium shadow-sm">
                      До
                    </div>
                  </div>
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-600">
                    <ServerImage
                      filePath={work.afterImage ?? ""}
                      alt={`${work.title} - После обработки`}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      quality={90}
                      priority={index < 6}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium shadow-sm">
                      После
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className="bg-orangeDefault text-white px-2 py-1 rounded text-xs font-medium">
                    {work.year}
                  </span>
                  {work.featured && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      ★
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pt-6 h-72">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-orange-600 dark:text-orangeDefault font-medium">
                    {work.category.name}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">
                    {work.carBrand} {work.carModel}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-black dark:text-white mb-2">
                  {work.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {work.description}
                </p>

                {/* Services */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Выполненные работы:
                  </h4>
                  <ul className="space-y-1">
                    {work.services.slice(0, 3).map((service) => (
                      <li
                        key={service.id}
                        className="flex items-center text-xs text-gray-600 dark:text-gray-300"
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
                      </li>
                    ))}
                    {work.services.length > 3 && (
                      <li className="text-xs text-gray-500 dark:text-gray-400 ml-5 ">
                        +{work.services.length - 3} еще...
                      </li>
                    )}
                  </ul>
                </div>
              </div>
              <div className="flex items-center justify-between p-6">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Время работы: {work.duration}
                </span>
                <button className="text-orangeDefault hover:text-orange-600 font-medium text-sm transition-colors">
                  Подробнее →
                </button>
              </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Empty State */}
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

        {/* CTA Section */}
      </section>
        <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Готовы защитить свой автомобиль?
              </h3>
              <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                Свяжитесь с нами для получения персональной консультации и
                расчета стоимости
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="tel:+79161456882"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-orange-600 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Позвонить сейчас
                </Link>
                <Link
                  href="/glav#auto-price"
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-2xl border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all duration-200"
                >
                  Рассчитать стоимость
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
    </motion.div>
  );
}
