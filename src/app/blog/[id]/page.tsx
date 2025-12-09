"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import blogApiClient, { BlogPost } from "../blogApi";
import { ChevronLeft, Clock, Calendar, User } from "lucide-react";
import FeedbackLine from "src/app/ui/ui/FeedbackLine";
import ServerImage from "src/app/ui/ui/ServerImage";

// Анимация для всей страницы
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

export default function BlogPostPage() {
  const params = useParams();
  const postId = parseInt(params.id as string);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const [postData, relatedData] = await Promise.all([
          blogApiClient.getPostById(postId),
          blogApiClient.getRelatedPosts(postId),
        ]);
        setPost(postData);
        setRelatedPosts(relatedData);
      } catch (err) {
        setError("Ошибка при загрузке статьи");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPostData();
  }, [postId]);

  if (loading) {
    return (
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.5 }}
        className="bg-background1 dark:bg-backgroundDark min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007478] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Загрузка статьи...</p>
        </div>
      </motion.div>
    );
  }

  if (error || !post) {
    return (
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ duration: 0.5 }}
        className="bg-background1 dark:bg-backgroundDark min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            Ошибка загрузки
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error || "Запрашиваемая статья не найдена"}
          </p>
          <Link
            href="/blog"
            className="bg-[#007478] hover:bg-[#005a5e] dark:hover:bg-[#009a9f] text-white px-6 py-3 rounded-lg transition-colors"
          >
            Вернуться к блогу
          </Link>
        </div>
      </motion.div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
      className=" min-h-screen"
      style={{
        background:
          "radial-gradient(900px circle at 20% 18%, rgba(0, 148, 151, 0.12), transparent 55%), radial-gradient(1100px circle at 80% 12%, rgba(15, 23, 42, 0.12), transparent 60%), linear-gradient(180deg, rgba(13, 22, 36, 0.94), rgba(13, 22, 36, 0.82))",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-8 pt-25">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative z-10"
        >
          <Link
            href="/blog"
            className="inline-flex items-center text-[#007478] dark:text-[#00a2a6] hover:text-[#005a5e] dark:hover:text-[#00cfd5] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Назад к блогу
          </Link>
        </motion.div>

        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-2 mb-4 flex-wrap">
            <span className="bg-[#007478] text-white px-3 py-1 rounded-full text-sm font-medium mt-2">
              {post.category.name}
            </span>
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-200 mt-2 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs"
              >
                #{tag.name}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300 mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{post.readTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="text-sm">{post.author}</span>
            </div>
          </div>
        </motion.header>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="relative rounded-lg overflow-hidden flex justify-center">
            <ServerImage
              filePath={post.image ?? ""}
              alt={post.title}
              className="object-cover rounded-lg"
            />
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-12 prose dark:prose-invert max-w-none prose-headings:text-black dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-black dark:prose-strong:text-white prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-6 prose-h2:mt-8 prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-4 prose-h3:mt-6 prose-ul:mb-6 prose-ol:mb-6 prose-li:mb-2 prose-p:mb-4 prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Call to Action */}

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-black dark:text-white mb-8">
              Похожие статьи
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
                >
                  <div className="relative overflow-hidden">
                    <ServerImage
                      filePath={relatedPost.image ?? ""}
                      alt={relatedPost.title}
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                        {relatedPost.category.name}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {relatedPost.readTime}
                      </span>
                    </div>
                    <h3 className="font-semibold text-black dark:text-white mb-2 line-clamp-2 group-hover:text-[#007478] dark:group-hover:text-[#00a2a6] transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </div>
      <FeedbackLine />
    </motion.div>
  );
}
