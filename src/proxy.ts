import { NextResponse, type NextRequest } from "next/server";

/** Cookie с JWT мастера; ставится на клиенте после входа (`admin/master/_lib/staffSession.ts`). */
export const STAFF_COOKIE = "staff_token";

function isExpired(token: string): boolean {
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp !== "number" || exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

/**
 * Защита роутов кабинета мастера (`/admin/master/*`): без живого токена мастера — на общий вход `/admin`.
 * Админка (`/admin/*` кроме `master`) этим не затрагивается: её защищает клиентский гвард и API.
 * Подпись здесь не проверяется (секрета на фронте нет) — это только UX-редирект без «мигания» страницы;
 * реальную проверку и блокировку делает API (`StaffJwtGuard`).
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(STAFF_COOKIE)?.value;
  if (token && !isExpired(token)) return NextResponse.next();
  return NextResponse.redirect(new URL("/admin", request.url));
}

export const config = { matcher: ["/admin/master", "/admin/master/:path*"] };
