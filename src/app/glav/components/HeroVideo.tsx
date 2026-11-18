"use client";

import { useEffect, useState } from "react";
import { mediaUrl } from "@/lib/media";

const VIDEO_SRC = mediaUrl("video/videoStart-720.mp4");
const POSTER_SRC = mediaUrl("video/videoStart-poster.jpg");

/**
 * Фоновое видео героя. Постер показывается сразу; сам файл (~5 МБ) грузится только
 * на широком экране, без режима экономии трафика и после загрузки страницы,
 * чтобы не отбирать канал у картинок и скриптов.
 */
export default function HeroVideo({ className = "" }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData || !window.matchMedia("(min-width: 768px)").matches) return;
    const start = () => setEnabled(true);
    if (document.readyState === "complete") {
      start();
      return;
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  if (!enabled) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={POSTER_SRC} alt="" fetchPriority="high" className={className} />
    );
  }

  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      poster={POSTER_SRC}
      preload="metadata"
      className={className}
    >
      <source src={VIDEO_SRC} type="video/mp4" />
    </video>
  );
}
