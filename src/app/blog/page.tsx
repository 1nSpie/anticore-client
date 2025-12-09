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
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "radial-gradient(1100px circle at 14% 16%, rgba(0,148,151,0.14), transparent 55%), radial-gradient(950px circle at 82% 10%, rgba(255,255,255,0.05), transparent 55%), linear-gradient(180deg, #0b1220, #0f172a)",
      }}
    >
      <div className="relative overflow-hidden">
        <section className="relative max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto mt-30 section-surface rounded-3xl">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl lg:leading-tight text-white">
              Блог об антикоррозийной защите
            </h1>
            <p className="mt-4 md:text-lg text-gray-200 max-w-3xl mx-auto">
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
                    ? "bg-teal-600 text-white shadow-lg"
                    : "bg-white/5 text-gray-200 hover:bg-white/10"
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
              <div className="section-surface rounded-2xl overflow-hidden shadow-lg border border-white/5">
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
                        <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Рекомендуем
                      </span>
                        <span className="text-gray-400 text-sm">
                        {new Date(featuredPost.date).toLocaleDateString("ru-RU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-300 mb-6">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">
                        Время чтения: {featuredPost.readTime}
                      </span>
                      <Link
                        href={`/blog/${featuredPost.id}`}
                          className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2 rounded-lg transition-colors"
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
                    className="section-surface rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-white/5"
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
                        <span className="bg-white/5 text-gray-200 px-3 py-1 rounded-full text-xs font-medium">
                          {post.category.name}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {new Date(post.date).toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {post.readTime}
                        </span>
                        <Link
                          href={`/blog/${post.id}`}
                          className="text-teal-300 hover:text-teal-200 font-medium text-sm transition-colors"
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