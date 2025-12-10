/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../lib/ThemeProvider";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import { Toaster } from "src/shadcn/sonner";
import { DelayedModal } from "@/components/DelayedModal";
import { ModalProvider } from "../lib/ModalContext";
import Script from "next/script";
import FloatingContactButton from "./ui/ui/FloatingContactButton";

export const metadata: Metadata = {
  title: "АванКор",
  description:
    "Профессиональная антикоррозийная обработка автомобилей в Жуковском, Раменском, Люберцах, Балашихе, Бронницах, Коломне, Воскресенске и Москве. Лазерное удаление ржавчины, защита кузова, обработка скрытых полостей. Комплексная антикоррозийная защита для иномарок, грузовиков и седанов.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isWorkYandexMetrics = process.env.USE_YANDEX_METRICS === "true";
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicon-180x180.png" />
        <meta name="geo.placename" content="Жуковский, Московская область" />
        <meta name="geo.placename" content="Раменское, Московская область" />
        <meta name="geo.placename" content="Коломна, Московская область" />
        <meta
          name="description"
          content="Профессиональная антикоррозийная обработка автомобилей в Жуковском, Раменском, Люберцах, Балашихе, Бронницах, Коломне, Воскресенске и Москве. Лазерное удаление ржавчины, защита кузова, обработка скрытых полостей. Комплексная антикоррозийная защита для иномарок, грузовиков и седанов."
        />
        <meta name="geo.region" content="RU-MOS" />
        <meta name="yandex-verification" content="f4f1e7aae28f23bb" />
        <meta name="yandex-verification" content="4b4e2a9d98dba841" />
        <meta
          name="google-site-verification"
          content="UQ7pCkrtwsBXJAya8CbV4kDqlryAa_Lq2rc-pGQDE9Y"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        {/* Yandex.Metrika counter */}
        {isWorkYandexMetrics ? (
          <>
            <Script
              id="yandex-metrika"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=103518836", "ym");

              ym(103518836, "init", {
                ssr: true,
                webvisor: true,
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
                ecommerce: "dataLayer"
              });
            `,
              }}
            />
            <noscript>
              <div style={{ position: "absolute", left: "-9999px" }}>
                <img src="https://mc.yandex.ru/watch/103518836" alt="" />
              </div>
            </noscript>
          </>
        ) : (
          <></>
        )}
        {/* /Yandex.Metrika counter */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ModalProvider>
            <span className="text-[0px] hidden">
              {" "}
              антикоррозийная обработка автомобиля антикор автомобиля обработка
              кузова от коррозии антикоррозийное покрытие защита от ржавчины
              удаление коррозии с кузова комплексная антикоррозийная защита
              обработка скрытых полостей антикоррозийная обработка иномарок
              антикор грузовиков и фургонов антикоррозийная обработка седанов
              защита внедорожников антикор днища автомобиля защита от коррозии
              после аварии лазерное удаление ржавчины механическая обработка
              ржавчины удаление ржавчины без покраски обработка кузова антикором
              автосервис антикоррозийной обработки антикор в Жуковском
              антикоррозийная обработка Жуковский лазерное удаление ржавчины
              Жуковский антикор иномарок Жуковский антикор седанов Жуковский
              антикоррозийная обработка авто Жуковский антикор в Раменском
              защита от коррозии Раменское антикоррозийная обработка Раменский
              округ удаление ржавчины недорого Раменское защита кузова Раменское
              антикор днища Раменское антикор автомобиля в Раменском антикор в
              Люберцах антикоррозийная обработка Люберцы обработка кузова
              Люберцы антикор днища автомобиля Люберцы антикор в мкрн. Кратово
              антикор в Балашихе удаление ржавчины Балашиха обработка скрытых
              полостей Балашиха антикоррозийная защита Балашиха антикор
              грузовиков Балашиха антикор центр Балашиха антикор в Бронницах
              антикоррозийная обработка Бронницы защита кузова Бронницы удаление
              коррозии Бронницы антикор в Коломне антикор автомобиля Коломна
              антикор в Воскресенске антикоррозийная обработка Москва антикор
              автомобиля Москва обработка кузова от коррозии Москва
              антикоррозийное покрытие Москва антикор днища автомобиля Москва
              антикоррозийная обработка в Москве обработка кузова автомобиля от
              коррозии цена антикоррозийное покрытие автомобиля антикоррозионная
              обработка автомобиля антикоррозийная защита антикоррозийная
              обработка цены коррозийная обработка автомобиля цена сделать
              антикор на автомобиль обработка машины от коррозии цена обработка
              кузова антикоррозией где сделать антикоррозийную обработку
            </span>

            <DelayedModal />
            <Navigation />
            {children}
            <FloatingContactButton />
            <Footer />
            <Toaster />
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
