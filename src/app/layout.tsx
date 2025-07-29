/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../lib/ThemeProvider";
import Footer from "../components/Footer";
import ClientOnly from "./ui/ui/ClientOnly";
import Navigation from "../components/Navigation";
import { Toaster } from "src/shadcn/sonner";
import { DelayedModal } from "@/components/DelayedModal";
import Script from "next/script";

export const metadata: Metadata = {
  title: "AvanCore",
  description: "Защити свой автомобиль от коррозии",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <meta name="yandex-verification" content="f4f1e7aae28f23bb" />
        <meta name="yandex-verification" content="4b4e2a9d98dba841" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        {/* Yandex.Metrika counter */}
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
        {/* /Yandex.Metrika counter */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DelayedModal />
          <Navigation />
          {children}
          <ClientOnly />
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
