export default function Loading() {
  return (
    <div className="bg-background1 dark:bg-backgroundDark min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button Skeleton */}
        <div className="mb-8">
          <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Article Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-20 h-6 bg-[#007478]/20 dark:bg-[#007478]/30 rounded-full animate-pulse"></div>
            <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="w-full h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-4/5 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-28 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>

          <div className="flex items-center space-x-4 mb-8">
            <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Featured Image Skeleton */}
        <div className="mb-8">
          <div className="w-full h-64 md:h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>

        {/* Article Content Skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 mb-12">
          <div className="space-y-4">
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>

            <div className="w-1/2 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-8"></div>

            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>

            <div className="space-y-2 mt-6">
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-4/5 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Call to Action Skeleton */}
        <div className="bg-[#007478]/10 dark:bg-[#007478]/20 rounded-lg p-8 text-center mb-12">
          <div className="w-64 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-4"></div>
          <div className="w-96 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-6"></div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="w-40 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="w-40 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
