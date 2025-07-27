import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../lib/ThemeProvider";
import Footer from "../components/Footer";
import ClientOnly from "./ui/ui/ClientOnly";
import Navigation from "../components/Navigation";
import { Toaster } from "src/shadcn/sonner";
import { DelayedModal } from "@/components/DelayedModal";

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
        <meta name="yandex-verification" content="4b4e2a9d98dba841" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
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
