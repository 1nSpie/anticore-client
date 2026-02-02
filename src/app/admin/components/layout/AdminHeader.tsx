"use client";

import { Button } from "@/shadcn/button";
import { ShieldCheck, RefreshCw, LogOut } from "lucide-react";

interface AdminHeaderProps {
  onRefresh: () => void;
  onLogout: () => void;
  loading: boolean;
}

export function AdminHeader({
  onRefresh,
  onLogout,
  loading,
}: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500/30">
          <ShieldCheck className="w-5 h-5" />
        </span>
        <div className="flex flex-col">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Админ-панель ANTICORE
          </h1>
          <p className="text-sm text-slate-300/80">
            Управление ценами, примерами работ, блогом и списком авто
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          className="border-white/20 text-slate-100 hover:bg-white/5 transition-all duration-200 hover:scale-105"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Обновить
        </Button>
        <Button
          variant="outline"
          onClick={onLogout}
          className="border-white/20 text-slate-100 hover:bg-white/5 transition-all duration-200 hover:scale-105"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Выйти
        </Button>
      </div>
    </div>
  );
}
