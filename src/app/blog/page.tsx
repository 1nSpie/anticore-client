"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { blogApiClient, BlogPost, BlogCategory } from "./blogApi";
import FeedbackLine from "../ui/ui/FeedbackLine";
import ServerImage from "../ui/ui/ServerImage";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredPosts =
    selectedCategory === "all"
      ? posts
      : posts.filter(
          (post) =>
            post.category.slug ===
            selectedCategory.toLowerCase().replace(/\s+/g, "-")
        );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsData, categoriesData, featuredData] = await Promise.all([
          blogApiClient.getPosts({ limit: 20 }),
          blogApiClient.getCategories(),
          blogApiClient.getFeaturedPost(),
        ]);

        setPosts(postsData.posts);
        setCategories([
          { id: 0, name: "Все", slug: "all", createdAt: "", updatedAt: "" },
          ...categoriesData,
        ]);
        setFeaturedPost(featuredData);
      } catch (err) {
        setError("Ошибка при загрузке данных");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);

    if (category === "all") {
      const postsData = await blogApiClient.getPosts({ limit: 20 });
      setPosts(postsData.posts);
    } else {
      const categorySlug = category.toLowerCase().replace(/\s+/g, "-");
      const postsData = await blogApiClient.getPosts({
        category: categorySlug,
        limit: 20,
      });
      setPosts(postsData.posts);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={{
          hidden: { opacity: 0, y: 10 },
          enter: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
        }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-background1 dark:bg-backgroundDark min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007478] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Загрузка статей...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={{
          hidden: { opacity: 0, y: 10 },
          enter: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
        }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-background1 dark:bg-backgroundDark min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            Ошибка загрузки
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#007478] hover:bg-[#005a5e] dark:hover:bg-[#009a9f] text-white px-6 py-3 rounded-lg transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={{
        hidden: { opacity: 0, y: 10 },
        enter: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
      }}
      transition={{ type: "spring", duration: 0.5 }}
      className="bg-gradient-to-br from-gray-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-900/20 min-h-screen "
    >
      {/* Обернул декоративные элементы в контейнер с hidden overflow */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-100/30 to-transparent dark:from-teal-900/20 dark:to-transparent" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12">
          <div className="w-64 h-64 bg-gradient-to-br from-teal-200/20 to-teal-300/20 dark:from-teal-700/20 dark:to-teal-600/20 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12">
          <div className="w-48 h-48 bg-gradient-to-br from-blue-200/20 to-blue-300/20 dark:from-blue-700/20 dark:to-blue-600/20 rounded-full blur-3xl" />
        </div>
        
        <section className="relative max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto mt-30">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl lg:leading-tight text-black dark:text-white">
              Блог об антикоррозийной защите
            </h1>
            <p className="mt-4 md:text-lg text-black dark:text-neutral-200 max-w-3xl mx-auto">
              Полезные статьи, советы экспертов и актуальная информация о защите
              автомобиля от коррозии
            </p>
          </motion.div>

          {/* Categories Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? "bg-[#007478] text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#007478]/10 dark:hover:bg-gray-600"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Featured Article */}
          {featuredPost && (
            <motion.div
              className="mb-16"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="h-auto">
                    <ServerImage
                      filePath={featuredPost.image ?? ""}
                      alt={featuredPost.title}
                      className="max-w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="bg-[#007478] text-white px-3 py-1 rounded-full text-sm font-medium">
                        Рекомендуем
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {new Date(featuredPost.date).toLocaleDateString("ru-RU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Время чтения: {featuredPost.readTime}
                      </span>
                      <Link
                        href={`/blog/${featuredPost.id}`}
                        className="bg-[#007478] hover:bg-[#005a5e] dark:hover:bg-[#009a9f] text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Читать статью
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Blog Posts Grid */}
          {filteredPosts.filter(
            (post) => featuredPost && post.id !== featuredPost.id
          ).length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-bold text-gray-500 dark:text-gray-400 mb-4">
                Статьи не найдены
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                В выбранной категории пока нет статей. Попробуйте выбрать другую
                категорию.
              </p>
              <button
                onClick={() => setSelectedCategory("Все")}
                className="bg-[#007478] hover:bg-[#005a5e] dark:hover:bg-[#009a9f] text-white px-6 py-3 rounded-lg transition-colors"
              >
                Показать все статьи
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {filteredPosts
                .filter((post) => featuredPost && post.id !== featuredPost.id)
                .map((post, index) => (
                  <motion.article
                    key={post.id}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <ServerImage
                        filePath={post.image ?? ""}
                        alt={post.title}
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                          {post.category.name}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          {new Date(post.date).toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-black dark:text-white mb-3 line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {post.readTime}
                        </span>
                        <Link
                          href={`/blog/${post.id}`}
                          className="text-[#007478] dark:text-[#00a2a6] hover:text-[#005a5e] dark:hover:text-[#00cfd5] font-medium text-sm transition-colors"
                        >
                          Читать →
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
            </div>
          )}
        </section>
      </div>
      <FeedbackLine />
    </motion.div>
  );
}