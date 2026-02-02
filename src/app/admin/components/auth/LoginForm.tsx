"use client";

import { Button } from "@/shadcn/button";
import { Input } from "@/shadcn/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/card";
import { Lock } from "lucide-react";

interface LoginFormProps {
  loginData: { login: string; password: string };
  loading: boolean;
  onLoginDataChange: (data: { login: string; password: string }) => void;
  onLogin: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export function LoginForm({
  loginData,
  loading,
  onLoginDataChange,
  onLogin,
  onKeyPress,
}: LoginFormProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-admin relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-xl shadow-2xl relative z-10 transform transition-all duration-300 hover:scale-[1.02]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500/30">
              <Lock className="w-5 h-5" />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-lg font-semibold">Вход в админ-панель</span>
              <span className="text-xs text-emerald-100/80">
                Доступ только для сотрудников
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Логин"
              value={loginData.login}
              onChange={(e) =>
                onLoginDataChange({ ...loginData, login: e.target.value })
              }
              className="bg-slate-900/60 border-white/10 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/50 transition-all"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Пароль"
              value={loginData.password}
              onChange={(e) =>
                onLoginDataChange({ ...loginData, password: e.target.value })
              }
              onKeyPress={onKeyPress}
              className="bg-slate-900/60 border-white/10 text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/50 transition-all"
              disabled={loading}
            />
          </div>
          <Button
            onClick={onLogin}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Вход...
              </span>
            ) : (
              "Войти"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
