"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, History, Bell, Lock, LogOut, Home, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { cabinetLogout } from "../_lib/api";
import {
  cabinetCard,
  cabinetNavActive,
  cabinetNavIdle,
  cabinetEyebrow,
} from "../_lib/cabinetUi";

const links = [
  { href: "/cabinet/profile", label: "Профиль", icon: User, desc: "Данные и авто" },
  { href: "/cabinet/applications", label: "Заявки", icon: ClipboardList, desc: "Статусы" },
  { href: "/cabinet/history", label: "История", icon: History, desc: "Визиты" },
  { href: "/cabinet/notifications", label: "Уведомления", icon: Bell, desc: "SMS" },
  { href: "/cabinet/security", label: "Безопасность", icon: Lock, desc: "Пароль" },
];

type Props = {
  variant?: "bar" | "sidebar";
};

export function CabinetNav({ variant = "sidebar" }: Props) {
  const pathname = usePathname();

  const linkClass = (active: boolean, sidebar: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl text-sm font-medium transition-all",
      sidebar ? "px-3 py-2.5 w-full" : "px-3 py-2",
      active ? cabinetNavActive : cabinetNavIdle,
    );

  if (variant === "bar") {
    return (
      <nav
        className={cn(
          cabinetCard,
          "py-3 px-3 mb-6 flex flex-wrap gap-2 items-center justify-between",
        )}
        aria-label="Разделы кабинета"
      >
        <div className="flex flex-wrap gap-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              prefetch={false}
              aria-current={pathname === href ? "page" : undefined}
              className={linkClass(pathname === href, false)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>
        <NavActions compact />
      </nav>
    );
  }

  return (
    <nav className={cn(cabinetCard, "p-3 lg:p-4 sticky top-28")} aria-label="Разделы кабинета">
      <p className={`${cabinetEyebrow} px-2 mb-3 hidden lg:block`}>Меню</p>
      <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 -mx-1 px-1 lg:mx-0 lg:px-0">
        {links.map(({ href, label, icon: Icon, desc }) => {
          const active = pathname === href;
          return (
            <li key={href} className="shrink-0 lg:shrink">
              <Link
                href={href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={linkClass(active, true)}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                <span className="flex flex-col min-w-0">
                  <span>{label}</span>
                  <span className="hidden lg:block text-[11px] font-normal text-slate-500 truncate">
                    {desc}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="hidden lg:block mt-4 pt-4 border-t border-white/10">
        <NavActions />
      </div>
    </nav>
  );
}

function NavActions({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("flex gap-2", compact ? "flex-wrap" : "flex-col")}>
      <Link
        href="/"
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm",
          cabinetNavIdle,
          !compact && "w-full",
        )}
      >
        <Home className="h-4 w-4" />
        На сайт
      </Link>
      <button
        type="button"
        onClick={async () => {
          await cabinetLogout();
          window.location.href = "/cabinet/login";
        }}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-red-300/90 border border-red-500/25 hover:bg-red-950/30 transition-colors",
          !compact && "w-full",
        )}
      >
        <LogOut className="h-4 w-4" />
        Выйти
      </button>
    </div>
  );
}
