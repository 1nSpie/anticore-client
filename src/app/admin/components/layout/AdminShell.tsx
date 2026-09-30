"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X, ShieldCheck } from "lucide-react";
import { AdminHeader } from "./AdminHeader";
import { AdminNav } from "./AdminNav";

function Brand() {
  return <Link href="/admin/calendar" className="mb-9 flex items-center gap-3 px-3 text-slate-50">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-slate-950"><ShieldCheck className="h-6 w-6" /></span>
    <span><span className="block text-lg font-semibold tracking-tight">АванКор</span><span className="block text-xs text-slate-500">Рабочее пространство</span></span>
  </Link>;
}

type Props = { children: React.ReactNode; onLogout: () => void | Promise<void>; onRefresh?: () => void; loading?: boolean };

export function AdminShell({ children, onLogout, onRefresh, loading = false }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  async function logout() { await onLogout(); router.replace("/admin"); }
  return <div className="admin-workspace min-h-screen bg-[#0c111b] text-slate-200">
    <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-emerald-400 focus:p-3 focus:text-slate-950">Перейти к содержимому</a>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.06] bg-[#101722] px-4 py-7 lg:flex">
      <Brand /><AdminNav />
      <div className="mt-auto px-3 pt-8 text-xs leading-relaxed text-slate-500">АванКор · Панель управления</div>
    </aside>
    <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#101722] px-4 py-3 lg:hidden">
      <Link href="/admin/calendar" className="font-semibold text-slate-50">АванКор <span className="ml-2 text-xs font-normal text-slate-500">Админка</span></Link>
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Trigger aria-label="Открыть меню" className="flex h-11 items-center gap-2 rounded-lg px-3 text-sm hover:bg-white/5"><Menu className="h-5 w-5" />Разделы</Dialog.Trigger>
        <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[70] bg-black/60" />
          <Dialog.Content aria-describedby={undefined} className="admin-workspace fixed inset-y-0 left-0 z-[80] w-[min(320px,90vw)] overflow-y-auto border-r border-white/10 bg-[#101722] px-5 py-7 text-slate-200">
            <Dialog.Title className="sr-only">Разделы админки</Dialog.Title>
            <Dialog.Close aria-label="Закрыть меню" className="absolute right-3 top-3 rounded-lg p-3 text-slate-400 hover:bg-white/5"><X className="h-5 w-5" /></Dialog.Close>
            <Brand /><AdminNav onNavigate={() => setMenuOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
    <main id="admin-content" tabIndex={-1} className="min-w-0 px-4 py-6 outline-none sm:px-7 lg:ml-64 lg:px-8 lg:py-9">
      <div className="mx-auto max-w-[1500px]">
        <AdminHeader onRefresh={onRefresh ?? (() => {})} onLogout={() => void logout()} loading={loading} showRefresh={Boolean(onRefresh)} />
        {children}
      </div>
    </main>
  </div>;
}
