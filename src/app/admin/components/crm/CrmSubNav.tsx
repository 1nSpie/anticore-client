"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Calendar, Settings, Users } from "lucide-react";
import { Button } from "@/shadcn/button";

const links = [
  { href: "/admin/crm", label: "Календарь", icon: Calendar, exact: true },
  { href: "/admin/crm/clients", label: "Клиенты", icon: Users },
  { href: "/admin/crm/settings", label: "Настройки SMS", icon: Settings },
];

export function CrmSubNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild className="border-white/20 text-slate-100">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Админка
          </Link>
        </Button>
        <h1 className="text-xl font-bold text-white">CRM — записи</h1>
      </div>
      <nav className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-slate-900/60 p-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
