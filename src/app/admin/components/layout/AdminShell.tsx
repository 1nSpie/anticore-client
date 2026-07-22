"use client";

import { AdminHeader } from "./AdminHeader";
import { AdminNav } from "./AdminNav";

type Props = {
  children: React.ReactNode;
  onLogout: () => void;
  onRefresh?: () => void;
  loading?: boolean;
};

export function AdminShell({
  children,
  onLogout,
  onRefresh,
  loading = false,
}: Props) {
  return (
    <div className="min-h-screen bg-gradient-admin relative overflow-hidden pt-24 sm:pt-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 animate-pulse rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 animate-pulse rounded-full bg-teal-500/10 blur-3xl delay-1000" />
      </div>
      <div className="relative mx-auto max-w-[1600px] px-3 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-8">
          <AdminHeader
            onRefresh={onRefresh ?? (() => {})}
            onLogout={onLogout}
            loading={loading}
            showRefresh={Boolean(onRefresh)}
          />
          <AdminNav />
          {children}
        </div>
      </div>
    </div>
  );
}
