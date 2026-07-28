"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Car,
  DollarSign,
  Inbox,
  MessageSquare,
  Users,
} from "lucide-react";
import { cn } from "src/lib/utils";

const links = [
  { href: "/admin/prices", label: "Цены", icon: DollarSign },
  { href: "/admin/auto", label: "Автомобили", icon: Car },
  { href: "/admin/leads", label: "Заявки", icon: Inbox },
  { href: "/admin/calendar", label: "Календарь", icon: Calendar },
  { href: "/admin/clients", label: "Клиенты", icon: Users },
  { href: "/admin/sms", label: "SMS", icon: MessageSquare },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 overflow-x-auto pb-1">
      <div className="flex min-w-max gap-1 rounded-xl border border-white/10 bg-slate-900/60 p-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/admin/prices" && pathname.startsWith(`${href}/`));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "text-slate-300 hover:bg-white/5",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
