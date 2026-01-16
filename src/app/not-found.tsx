
import Link from "next/link";
import ReactPlayer from "react-player";


const API_BASE_URL = process.env.NEXT_PUBLIC_S3_URL;

export default function Custom404() {

  return (
    <main className="h-screen flex items-center justify-center px-6 py-24 sm:py-32 lg:px-8"
      style={{
        background:
          "radial-gradient(900px circle at 20% 18%, rgba(0, 148, 151, 0.12), transparent 55%), radial-gradient(1100px circle at 80% 12%, rgba(15, 23, 42, 0.12), transparent 60%), linear-gradient(180deg, rgba(13, 22, 36, 0.94), rgba(13, 22, 36, 0.82))",
      }}>
      <ReactPlayer
        src={`${API_BASE_URL}/video/video1.mp4`}
        controls
        className="w-full h-full object-contain"
        width={"auto"}
        height={"auto"}
      >
        Ваш браузер не поддерживает воспроизведение видео.
      </ReactPlayer>
      <div className="text-center max-w-2xl w-full">
        {/* Код ошибки */}
        <p className="text-base font-semibold text-[#007478] ">
          404
        </p>

        {/* Заголовок */}
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900  sm:text-5xl lg:text-7xl">
          Страница не найдена
        </h1>

        {/* Описание */}
        <p className="mt-6 text-lg text-gray-600  sm:text-xl">
          К сожалению, мы не смогли найти страницу, которую вы ищете.
        </p>

        {/* Кнопки */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Основная кнопка */}
          <Link
            href="/"
            className="rounded-md bg-[#007478] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#005a5e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#005a5e] transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </main>
  );
}
