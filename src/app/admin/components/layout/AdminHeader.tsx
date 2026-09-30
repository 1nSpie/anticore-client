"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/shadcn/button";
import { RefreshCw, LogOut, ArrowUpRight } from "lucide-react";
import { adminSection } from "./adminSections";

interface AdminHeaderProps {
  onRefresh: () => void;
  onLogout: () => void;
  loading: boolean;
  showRefresh?: boolean;
}

export function AdminHeader({ onRefresh, onLogout, loading, showRefresh = true }: AdminHeaderProps) {
  const section = adminSection(usePathname());
  return <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
    <div>
      <p className="mb-2 text-xs font-medium text-emerald-400">{section?.group ?? "Рабочее пространство"}</p>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">{section?.label ?? "Админка АванКор"}</h1>
      <p className="mb-0 max-w-xl text-sm leading-relaxed text-slate-400">{section?.description ?? "Всё для ежедневной работы сервиса в одном месте."}</p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" asChild className="border-white/10 bg-transparent text-slate-300"><a href="/" target="_blank" rel="noopener noreferrer">Открыть сайт<ArrowUpRight className="h-4 w-4" /></a></Button>
      {showRefresh && <Button variant="outline" onClick={onRefresh} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} />Обновить</Button>}
      <Button variant="ghost" onClick={onLogout} className="text-slate-400 hover:text-slate-50"><LogOut className="h-4 w-4" />Выйти</Button>
    </div>
  </header>;
}
