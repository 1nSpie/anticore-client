"use client";

import Link from "next/link";
import { ShieldCheck, History, Bell } from "lucide-react";
import {
  CABINET_PAGE_BACKGROUND,
  cabinetEyebrow,
  cabinetH1,
  cabinetMuted,
} from "../_lib/cabinetUi";

const perks = [
  { icon: History, text: "История визитов и обслуживания" },
  { icon: Bell, text: "SMS-напоминания по вашим настройкам" },
  { icon: ShieldCheck, text: "Безопасный доступ к данным автомобиля" },
];

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div
      className="min-h-[calc(100vh-6rem)] flex flex-col lg:flex-row lg:items-stretch gap-8 lg:gap-12 max-w-5xl mx-auto"
    >
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-center pr-4">
        <Link
          href="/"
          className={`${cabinetEyebrow} mb-6 hover:text-teal-300 transition-colors w-fit`}
        >
          АванКор · личный кабинет
        </Link>
        <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight tracking-tight">
          Ваш автомобиль
          <span className="block text-teal-400/90 mt-1">под контролем</span>
        </h1>
        <p className={`${cabinetMuted} mt-4 max-w-sm`}>
          Профиль, история антикоррозийной обработки и уведомления — в одном месте.
        </p>
        <ul className="mt-8 space-y-4">
          {perks.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-slate-300 text-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20">
                <Icon className="h-4 w-4 text-teal-400" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="lg:hidden mb-6 text-center">
          <Link href="/" className={cabinetEyebrow}>
            АванКор
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-black/40 p-6 sm:p-8">
          <header className="mb-6 sm:mb-8">
            <h2 className={cabinetH1}>{title}</h2>
            <p className={`${cabinetMuted} mt-2`}>{subtitle}</p>
          </header>
          {children}
          {footer ? <div className="mt-6 pt-6 border-t border-white/10">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

/** Decorative orb behind auth (optional wrapper in layout) */
export function CabinetAuthBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ background: CABINET_PAGE_BACKGROUND }}
      aria-hidden
    />
  );
}
