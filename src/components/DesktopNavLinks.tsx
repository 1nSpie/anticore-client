"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { navigationLinks } from "src/lib/contants";

const NAV_OVERFLOW_MAX_WIDTH = 1399;
const NAV_GAP_PX = 20;

export type NavLinkItem = { label: string; link: string };

const CABINET_LINK: NavLinkItem = { label: "Личный кабинет", link: "/cabinet" };

function isNavLinkActive(pathname: string, link: string): boolean {
  if (link === "/cabinet") return pathname.startsWith("/cabinet");
  if (link === "/") return pathname === "/";
  return pathname === link;
}

function linkClassName(active: boolean): string {
  return `text-sm font-medium transition-colors shrink-0 ${
    active ? "text-teal-700" : "text-gray-700 hover:text-teal-600"
  }`;
}

export default function DesktopNavLinks() {
  const pathname = usePathname();
  const items = useMemo(
    () => [...navigationLinks, CABINET_LINK],
    [],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [wideLayout, setWideLayout] = useState(true);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${NAV_OVERFLOW_MAX_WIDTH}px)`);
    const update = () => setWideLayout(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const recalcVisible = useCallback(() => {
    if (wideLayout) {
      setVisibleCount(items.length);
      return;
    }

    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const linkEls = measure.querySelectorAll<HTMLElement>("[data-nav-measure-item]");
    const moreEl = measure.querySelector<HTMLElement>("[data-nav-measure-more]");
    if (!linkEls.length) return;

    const widths = Array.from(linkEls).map((el) => el.offsetWidth);
    const moreWidth = moreEl?.offsetWidth ?? 72;
    const available = container.clientWidth;

    let best = 0;
    for (let n = items.length; n >= 0; n--) {
      const overflowCount = items.length - n;
      let total = 0;
      for (let i = 0; i < n; i++) {
        if (i > 0) total += NAV_GAP_PX;
        total += widths[i];
      }
      if (overflowCount > 0) {
        if (n > 0) total += NAV_GAP_PX;
        total += moreWidth;
      }
      if (total <= available) {
        best = n;
        break;
      }
    }
    setVisibleCount(best);
  }, [wideLayout, items.length]);

  useLayoutEffect(() => {
    recalcVisible();
  }, [recalcVisible, pathname]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => recalcVisible());
    ro.observe(container);
    window.addEventListener("resize", recalcVisible);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalcVisible);
    };
  }, [recalcVisible]);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);
  const moreHasActive = overflowItems.some((item) =>
    isNavLinkActive(pathname, item.link),
  );

  return (
    <div ref={containerRef} className="relative flex items-center justify-center gap-5 min-w-0 flex-1">
      {/* Скрытый ряд для измерения ширины ссылок */}
      <div
        ref={measureRef}
        className="pointer-events-none invisible absolute left-0 top-0 flex h-0 items-center gap-5 overflow-hidden"
        aria-hidden
      >
        {items.map((item) => (
          <span
            key={item.link}
            data-nav-measure-item
            className="text-sm font-medium whitespace-nowrap"
          >
            {item.label}
          </span>
        ))}
        <span
          data-nav-measure-more
          className="inline-flex items-center gap-1 text-sm font-medium whitespace-nowrap"
        >
          Еще
          <ChevronDown className="w-4 h-4" />
        </span>
      </div>

      {visibleItems.map((item) => (
        <Link
          key={item.link}
          href={item.link}
          prefetch={item.link === "/cabinet" ? false : undefined}
          className={linkClassName(isNavLinkActive(pathname, item.link))}
        >
          {item.label}
        </Link>
      ))}

      {overflowItems.length > 0 && (
        <div
          className="relative shrink-0"
          onMouseEnter={() => setMoreOpen(true)}
          onMouseLeave={() => setMoreOpen(false)}
        >
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
              moreHasActive
                ? "text-teal-700"
                : "text-gray-700 hover:text-teal-600"
            }`}
            aria-expanded={moreOpen}
            aria-haspopup="true"
          >
            Еще
            <ChevronDown
              className={`w-4 h-4 transition-transform ${moreOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {moreOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-1/2 z-50 mt-2 min-w-[12rem] -translate-x-1/2 rounded-xl border border-teal-200 bg-white py-2 shadow-xl"
              >
                {overflowItems.map((item) => (
                  <Link
                    key={item.link}
                    href={item.link}
                    prefetch={item.link === "/cabinet" ? false : undefined}
                    className={`block px-4 py-2.5 text-sm transition-colors ${
                      isNavLinkActive(pathname, item.link)
                        ? "bg-teal-50 font-medium text-teal-700"
                        : "text-gray-700 hover:bg-teal-50 hover:text-teal-700"
                    }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
