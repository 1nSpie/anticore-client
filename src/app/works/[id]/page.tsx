"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Calendar, Car, CheckCircle } from "lucide-react";
import { worksApi, Work, WorkImage } from "../worksApi";
import ServerImage from "src/app/ui/ui/ServerImage";
import FeedbackLine from "src/app/ui/ui/FeedbackLine";

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export default function WorkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<WorkImage | null>(null);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        setLoading(true);
        const id = parseInt(params.id as string);
        const workData = await worksApi.getWorkById(id);
        setWork(workData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load work");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchWork();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div
        className=" min-h-screen flex items-center justify-center"
        style={{
          background:
            "radial-gradient(900px circle at 20% 18%, rgba(0, 148, 151, 0.12), transparent 55%), radial-gradient(1100px circle at 80% 12%, rgba(15, 23, 42, 0.12), transparent 60%), linear-gradient(180deg, rgba(13, 22, 36, 0.94), rgba(13, 22, 36, 0.82))",
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007478] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div
        className=" min-h-screen flex items-center justify-center"
        style={{
          background:
            "radial-gradient(900px circle at 20% 18%, rgba(0, 148, 151, 0.12), transparent 55%), radial-gradient(1100px circle at 80% 12%, rgba(15, 23, 42, 0.12), transparent 60%), linear-gradient(180deg, rgba(13, 22, 36, 0.94), rgba(13, 22, 36, 0.82))",
        }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ошибка</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error || "Работа не найдена"}
          </p>
          <button
            onClick={() => router.push("/works")}
            className="bg-[#007478] hover:bg-[#005a5e] dark:hover:bg-[#009a9f] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Вернуться к работам
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        transition={{ type: "spring", duration: 0.5 }}
        className="min-h-screen pt-20"
        style={{
          background:
            "radial-gradient(900px circle at 20% 18%, rgba(0, 148, 151, 0.12), transparent 55%), radial-gradient(1100px circle at 80% 12%, rgba(15, 23, 42, 0.12), transparent 60%), linear-gradient(180deg, rgba(13, 22, 36, 0.94), rgba(13, 22, 36, 0.82))",
        }}
      >
        {/* Background decoration */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => router.push("/works")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-[#007478] dark:hover:text-[#00a2a6] mb-8 transition-colors z-10 relative"
          >
            <ArrowLeft size={20} />
            Назад к работам
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#007478] text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                {work.category.name}
              </span>
              <span className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm border border-gray-200/50 dark:border-gray-700/50">
                {work.year}
              </span>
              {work.featured && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                  Рекомендуемая
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-teal-700 dark:from-white dark:via-gray-100 dark:to-teal-300 bg-clip-text text-transparent mb-4">
              {work.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Car size={18} />
                <span>
                  {work.carBrand} {work.carModel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{work.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>
                  {new Date(work.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Before/After Images */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Результат работы
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {work.beforeImage && (
                <div className="group">
                  <div className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 aspect-[4/3] shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                    <ServerImage
                      filePath={work.beforeImage ?? ""}
                      alt={`${work.title} - До обработки`}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={95}
                      priority
                    />
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      До
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              )}

              {work.afterImage && (
                <div className="group">
                  <div className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 aspect-[4/3] shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                    <ServerImage
                      filePath={work.afterImage ?? ""}
                      alt={`${work.title} - После обработки`}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      quality={95}
                      priority
                    />
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      После
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Описание работы
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {work.description}
                </p>
              </motion.div>

              {/* Process Images */}
              {work.images && work.images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Процесс выполнения
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {work.images.map((image, index) => (
                      <motion.div
                        key={image.id}
                        variants={imageVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="group cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      >
                        <div className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 aspect-[4/3] shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
                          <ServerImage
                            filePath={image.url ?? ""}
                            alt={`${work.title} - Процесс выполнения ${
                              index + 1
                            }`}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            quality={90}
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                            {index + 1} / {work.images.length}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Services */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-200/50 dark:border-gray-700/50"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Выполненные услуги
                </h3>
                <ul className="space-y-3">
                  {work.services.map((service) => (
                    <li
                      key={service.id}
                      className="flex items-center gap-3 text-gray-600 dark:text-gray-300"
                    >
                      <CheckCircle
                        size={18}
                        className="text-[#007478] dark:text-[#00a2a6] flex-shrink-0"
                      />
                      <span>{service.name}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Work Details */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-200/50 dark:border-gray-700/50"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Детали работы
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Автомобиль
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {work.carBrand} {work.carModel}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Время выполнения
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {work.duration}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Год работы
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {work.year}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Категория
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {work.category.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <button
                className="absolute -top-10 right-0 text-white hover:text-gray-300 text-xl z-10"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg relative overflow-hidden max-w-4xl max-h-[90vh] w-full h-auto shadow-2xl">
                <div className="relative aspect-[4/3] w-full">
                  <ServerImage
                    filePath={selectedImage.url ?? ""}
                    alt={`${work.title} - Увеличенное изображение`}
                    className="object-contain object-center"
                    sizes="90vw"
                    quality={95}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <FeedbackLine />
      </motion.div>
    </>
  );
}
