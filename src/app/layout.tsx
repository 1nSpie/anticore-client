import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../lib/ThemeProvider";
import { FeedbackModalProvider } from "../lib/FeedbackModalProvider";
import Footer from "../components/Footer";
import ClientOnly from "./ui/ui/ClientOnly";
import Navigation from "../components/Navigation";
import { Toaster } from "@/shadcn/sonner";

export const metadata: Metadata = {
  title: "AvanCore",
  description: "Защити свой автомобиль от коррозииyes",
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
           <FeedbackModalProvider delay={30000} cooldownHours={24}>
            <Navigation />
            {children}
            <ClientOnly />
            <Footer />
          </FeedbackModalProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
