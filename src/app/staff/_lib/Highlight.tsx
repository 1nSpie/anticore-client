import { Fragment } from "react";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Подсвечивает совпадения запроса в тексте (без учёта регистра). Без `dangerouslySetInnerHTML`. */
export function Highlight({ text, q }: { text: string; q: string }) {
  const query = q.trim();
  if (query.length < 2) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escape(query)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-amber-300/30 px-0.5 text-amber-100">{part}</mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
