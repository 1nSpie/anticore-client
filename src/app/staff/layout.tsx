import type { Metadata, Viewport } from "next";
import { RegisterServiceWorker } from "./_lib/RegisterServiceWorker";

export const metadata: Metadata = {
  title: "Кабинет мастера | АванКор",
  robots: { index: false, follow: false },
  manifest: "/staff.webmanifest",
  icons: { apple: "/staff-apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Мастер", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#020617" };

/** Мобильный каркас ЛК мастера: работа в цеху с телефона, тёмная тема как в CRM. */
export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 antialiased">
      <RegisterServiceWorker />
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">{children}</div>
    </div>
  );
}
