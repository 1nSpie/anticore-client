"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";

interface LoginFormProps {
  loginData: { login: string; password: string };
  loading: boolean;
  onLoginDataChange: (data: { login: string; password: string }) => void;
  onLogin: () => void | Promise<void>;
}

export function LoginForm({ loginData, loading, onLoginDataChange, onLogin }: LoginFormProps) {
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef(false);
  const busy = loading || submitting;
  return <main className="admin-workspace flex min-h-screen items-center justify-center bg-[#0c111b] px-5 py-12 text-slate-100">
    <div className="w-full max-w-md">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100"><ArrowLeft className="h-4 w-4" />На сайт АванКор</Link>
      <div className="rounded-2xl border border-white/10 bg-[#131c2a] p-7 sm:p-9">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300"><ShieldCheck className="h-7 w-7" /></div>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Добро пожаловать</h1>
        <p className="mb-7 text-sm leading-relaxed text-slate-400">Войдите, чтобы работать с клиентами и управлять сайтом.</p>
        <form className="space-y-5" onSubmit={async event => {
          event.preventDefault(); if (pending.current || loading) return;
          pending.current = true; setSubmitting(true);
          try { await onLogin(); } finally { pending.current = false; setSubmitting(false); }
        }}>
          <div className="space-y-2"><label htmlFor="admin-login" className="text-sm font-medium">Логин</label>
            <Input id="admin-login" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required disabled={busy}
              value={loginData.login} onChange={e => onLoginDataChange({ ...loginData, login: e.target.value })}
              className="h-12 border-white/10 bg-slate-950/40 text-white" placeholder="Введите логин" /></div>
          <div className="space-y-2"><label htmlFor="admin-password" className="text-sm font-medium">Пароль</label>
            <div className="relative"><Input id="admin-password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required disabled={busy}
              value={loginData.password} onChange={e => onLoginDataChange({ ...loginData, password: e.target.value })}
              className="h-12 border-white/10 bg-slate-950/40 pr-12 text-white" placeholder="Введите пароль" />
              <button type="button" disabled={busy} aria-label={visible ? "Скрыть пароль" : "Показать пароль"} aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-lg text-slate-400 hover:text-slate-100">{visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
            </div></div>
          <Button type="submit" disabled={busy} className="h-12 w-full bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300">{busy ? <><Loader2 className="h-4 w-4 animate-spin" />Входим…</> : "Войти в рабочее пространство"}</Button>
        </form>
      </div>
      <p className="mt-6 text-center text-xs text-slate-500">Нет доступа? Обратитесь к администратору сервиса.</p>
    </div>
  </main>;
}
