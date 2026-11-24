"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const fieldCls = "h-9 rounded-md border border-white/15 bg-slate-900 px-2 text-sm text-slate-100 placeholder:text-slate-500";

export function PageTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-50">{title}</h1>
      {hint && <p className="mt-1 text-sm text-slate-400">{hint}</p>}
    </div>
  );
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string }[] }) {
  return (
    <div role="tablist" className="mb-5 flex flex-wrap gap-1 border-b border-white/10">
      {items.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "-mb-px min-h-11 border-b-2 px-4 text-sm font-medium",
            value === t.id ? "border-emerald-400 text-emerald-300" : "border-transparent text-slate-400 hover:text-slate-100",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1 text-xs text-slate-400", className)}>
      {label}
      {children}
    </label>
  );
}

export function Stat({ label, value, tone }: { label: string; value: string; tone?: "in" | "out" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#101722] p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={cn("mt-1 text-xl font-semibold", tone === "in" ? "text-emerald-300" : tone === "out" ? "text-rose-300" : "text-slate-50")}>{value}</p>
    </div>
  );
}

export const tableCls = "w-full min-w-[640px] text-left text-sm";
export const thCls = "px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-500";
export const tdCls = "px-3 py-2 align-top text-slate-200";
