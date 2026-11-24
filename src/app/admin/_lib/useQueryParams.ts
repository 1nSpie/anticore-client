"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Состояние страницы в адресной строке (вкладка, открытая позиция…): по прямой ссылке страница
 * открывается в том же виде. Обновление без прокрутки и без записи в историю на каждый клик.
 * `undefined`/`null`/"" убирают параметр.
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const set = useCallback(
    (patch: Record<string, string | number | null | undefined>, opts?: { push?: boolean }) => {
      const next = new URLSearchParams(search.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === null || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      const qs = next.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (opts?.push) router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [pathname, router, search],
  );

  return { params: search, pathname, set };
}

/** Ссылка на ту же страницу с другими параметрами (для <Link>). */
export function withQuery(
  pathname: string,
  current: URLSearchParams,
  patch: Record<string, string | number | null | undefined>,
): string {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === null || value === "") next.delete(key);
    else next.set(key, String(value));
  }
  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
