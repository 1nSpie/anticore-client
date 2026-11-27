import type { Metadata, Viewport } from "next";
import "./admin.css";
import { RegisterAdminServiceWorker } from "./_lib/RegisterAdminServiceWorker";

// Манифест подключается только здесь: публичный сайт не предлагает установку
export const metadata: Metadata = {
  title: "Админка | АванКор",
  robots: { index: false, follow: false },
  manifest: "/admin.webmanifest", // scope внутри — /admin; у кабинета мастера свой манифест
  icons: { apple: "/staff-apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "АванКор", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#020617" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RegisterAdminServiceWorker />
      {children}
    </>
  );
}
