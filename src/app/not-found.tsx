export default function Custom404() {
  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full">
        <body class="h-full">
        ```
      */}
      <main className="h-svh place-items-center bg-background1 dark:bg-backgroundDark px-6 py-24 sm:py-32 lg:px-8 ">
        <div className="text-center flex-col">
          <p className="text-base font-semibold text-orange">404</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 dark:text-white sm:text-7xl">
            Страница не найдена
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
            К сожалению, мы не смогли найти страницу, которую вы ищете.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/glav"
              className="rounded-md bg-orange px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:orangeDefault focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            >
              Вернуться на главную
            </a>
            <a
              href="/glav"
              className="text-sm font-semibold text-gray-900 dark:text-white"
            >
              Contact support <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
