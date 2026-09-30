"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminSections } from "./adminSections";
import { cn } from "src/lib/utils";

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <nav aria-label="Разделы админки" className="space-y-7">
    {adminSections.map(section => <div key={section.label}>
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{section.label}</p>
      <div className="space-y-1">{section.items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined}
          className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            active ? "bg-emerald-400/10 text-emerald-300 ring-1 ring-inset ring-emerald-400/15" : "text-slate-400 hover:bg-white/5 hover:text-slate-100")}>
          <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />{label}
          {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        </Link>;
      })}</div>
    </div>)}
  </nav>;
}
