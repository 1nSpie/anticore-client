"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="bg-background1 dark:bg-backgroundDark min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <AlertCircle className="w-16 h-16 text-orangeDefault mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
              Работа не найдена
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Запрашиваемая работа не существует или была удалена
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/works')}
              className="flex items-center justify-center gap-2 w-full bg-orangeDefault hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
              Вернуться к работам
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              На главную
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
