export default function Loading() {
  return (
    <div className="bg-background1 dark:bg-backgroundDark min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button Skeleton */}
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-8 animate-pulse"></div>

        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          
          <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Before/After Images Skeleton */}
        <div className="mb-12">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-[4/3] animate-pulse"></div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-[4/3] animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2">
            {/* Description Skeleton */}
            <div className="mb-8">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Process Images Skeleton */}
            <div className="mb-8">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-[4/3] animate-pulse"></div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-[4/3] animate-pulse"></div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-[4/3] animate-pulse"></div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-[4/3] animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            {/* Services Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-5 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-5 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Work Details Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
              <div className="space-y-4">
                <div>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
                  <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
                  <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-1 animate-pulse"></div>
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* CTA Skeleton */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
