"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BookOpen, LogOut } from "lucide-react";
import { Button } from "@/shadcn/button";
import type { RegStatus } from "@/app/admin/_lib/regulationTypes";
import { StaffRealtimeProvider, useStaffNotificationEvents, useStaffRealtime } from "../_lib/StaffRealtime";
import { clearStaffSession, staffApi, type StaffUser } from "../_lib/staffSession";

/**
 * Оболочка авторизованной зоны: подтверждает сессию на API (учитывает блокировку) и определяет роль.
 * Страницы и WebSocket монтируются только для мастера — эндпоинты кабинета закрыты для остальных ролей (403).
 */
export default function StaffAppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);

  useEffect(() => {
    // 401 обрабатывается интерцептором (сброс сессии + редирект на вход)
    staffApi.get<StaffUser>("/staff/auth/me").then((r) => setUser(r.data)).catch(() => undefined);
  }, []);

  if (!user) return <div className="flex flex-1 items-center justify-center text-sm text-slate-500">Загрузка…</div>;
  if (user.role !== "MASTER") return <NotMasterNotice user={user} />;

  return (
    <StaffRealtimeProvider>
      <StaffShell user={user}>{children}</StaffShell>
    </StaffRealtimeProvider>
  );
}

async function logoutStaff() {
  try {
    await staffApi.post("/staff/auth/logout");
  } finally {
    clearStaffSession();
    window.location.replace("/staff/login");
  }
}

/** Учётка с ролью «Администратор» вошла в кабинет мастера: показывать здесь нечего, управление — в админке. */
function NotMasterNotice({ user }: { user: StaffUser }) {
  return (
    <main className="flex flex-1 flex-col justify-center gap-4 px-6 py-10">
      <h1 className="text-xl font-semibold">Это кабинет мастера</h1>
      <p className="text-sm leading-relaxed text-slate-400">
        Вы вошли как «{user.fullName}» с ролью «Администратор». Расписание, чекин и задачи доступны только мастерам.
        Управлять сотрудниками, задачами и регламентом можно в админ-панели.
      </p>
      <Button asChild className="h-12 text-base">
        <Link href="/admin">Открыть админ-панель</Link>
      </Button>
      <Button variant="ghost" onClick={logoutStaff} className="h-12">
        Выйти
      </Button>
    </main>
  );
}

function StaffShell({ user, children }: { user: StaffUser; children: React.ReactNode }) {
  const { unread } = useStaffRealtime();
  const [ackRequired, setAckRequired] = useState(false);
  const [statusTick, setStatusTick] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  // «Регламент изменён» пришёл по WebSocket — сразу перепроверяем, не заблокирована ли работа
  useStaffNotificationEvents(
    useCallback((n) => {
      if (n.type === "REGULATION") setStatusTick((t) => t + 1);
    }, []),
  );

  // Не ознакомился с актуальным регламентом — открыт только экран регламента
  useEffect(() => {
    staffApi
      .get<RegStatus>("/staff/regulation/status")
      .then((r) => setAckRequired(r.data.ackRequired))
      .catch(() => undefined);
  }, [pathname, statusTick]);

  useEffect(() => {
    if (ackRequired && !pathname.startsWith("/staff/regulation")) router.replace("/staff/regulation");
  }, [ackRequired, pathname, router]);

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur">
        <Link href="/staff" className="flex flex-col gap-0.5">
          <span className="text-sm font-medium leading-tight">{user.fullName}</span>
          <span className="text-xs leading-tight text-slate-500">Мастер</span>
        </Link>
        <div className="flex">
          {/* Пока регламент не подтверждён, открыт только его экран (D17) — ссылка на ленту была бы мёртвой */}
          {!ackRequired && (
            <Button asChild variant="ghost" size="icon" className="relative h-11 w-11">
              <Link href="/staff/notifications" aria-label={unread ? `Уведомления, непрочитанных: ${unread}` : "Уведомления"}>
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-bold text-slate-950">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="icon" className="h-11 w-11">
            <Link href="/staff/regulation" aria-label="Регламент"><BookOpen className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={logoutStaff} aria-label="Выйти" className="h-11 w-11">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <main className="flex-1 px-4 py-5">{children}</main>
    </>
  );
}
