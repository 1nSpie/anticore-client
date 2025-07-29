import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-background1 dark:bg-backgroundDark min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-orangeDefault mb-4">404</h1>
          <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
            Статья не найдена
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            Извините, но запрашиваемая статья не существует или была удалена. 
            Возможно, вы перешли по неправильной ссылке.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/blog" 
            className="bg-orangeDefault hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            Вернуться к блогу
          </Link>
          <Link 
            href="/" 
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
