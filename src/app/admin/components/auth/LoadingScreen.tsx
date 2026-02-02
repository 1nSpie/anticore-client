"use client";

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-admin relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="flex flex-col items-center gap-4 relative z-10">
        <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-white text-lg font-medium">Проверка авторизации...</p>
      </div>
    </div>
  );
}
