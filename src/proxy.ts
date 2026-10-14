import { NextResponse, type NextRequest } from "next/server";

/** Cookie с JWT сотрудника; ставится на клиенте после входа (`staff/_lib/staffSession.ts`). */
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
 * Защита роутов ЛК мастера: без живого токена — на /staff/login.
 * Подпись здесь не проверяется (секрета на фронте нет) — это только UX-редирект;
 * реальную проверку и блокировку делает API (`StaffJwtGuard`).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(STAFF_COOKIE)?.value;
  const authed = !!token && !isExpired(token);

  if (pathname === "/staff/login") {
    return authed ? NextResponse.redirect(new URL("/staff", request.url)) : NextResponse.next();
  }
  if (!authed) {
    const url = new URL("/staff/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/staff", "/staff/:path*"] };
