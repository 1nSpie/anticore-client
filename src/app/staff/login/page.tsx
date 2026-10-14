"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Label } from "@/shadcn/label";
import { saveStaffSession, staffApi, type StaffUser } from "../_lib/staffSession";

function LoginForm() {
  const params = useSearchParams();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password) {
      toast.error("Введите логин и пароль");
      return;
    }
    setBusy(true);
    try {
      const { data } = await staffApi.post<{ token: string; staff: StaffUser }>("/staff/auth/login", {
        login: login.trim(),
        password,
      });
      saveStaffSession(data.token);
      const next = params.get("next");
      // Только внутренние пути ЛК мастера — защита от open redirect
      window.location.replace(next && /^\/staff(\/|$)/.test(next) ? next : "/staff");
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.message : undefined;
      toast.error(typeof msg === "string" ? msg : "Не удалось войти");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="login">Логин</Label>
        <Input id="login" autoComplete="username" autoCapitalize="none" value={login}
          onChange={(e) => setLogin(e.target.value)} className="h-12 text-base" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" type="password" autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} className="h-12 text-base" />
      </div>
      <Button type="submit" disabled={busy} className="h-12 w-full text-base">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Войти"}
      </Button>
      <p className="text-center text-xs text-slate-500">
        Учётную запись выдаёт администратор. Забыли пароль — обратитесь к нему.
      </p>
    </form>
  );
}

export default function StaffLoginPage() {
  return (
    <main className="flex flex-1 flex-col justify-center px-6 py-10">
      <h1 className="mb-1 text-2xl font-semibold">Кабинет мастера</h1>
      <p className="mb-8 text-sm text-slate-400">АванКор</p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
