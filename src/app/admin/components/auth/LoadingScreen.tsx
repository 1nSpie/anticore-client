"use client";
import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return <div className="admin-workspace flex min-h-screen items-center justify-center bg-[#0c111b]">
    <div role="status" className="flex items-center gap-3 text-sm text-slate-400"><Loader2 className="h-5 w-5 animate-spin text-emerald-400" />Открываем рабочее пространство…</div>
  </div>;
}
