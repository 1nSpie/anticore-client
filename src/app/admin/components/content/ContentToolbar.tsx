"use client";
import { Search, X } from "lucide-react";

export type PublicationFilter = "all" | "published" | "draft";
export function ContentToolbar({ query, onQuery, filter, onFilter, total, published }: {
  query: string; onQuery: (value: string) => void; filter: PublicationFilter;
  onFilter: (value: PublicationFilter) => void; total: number; published: number;
}) {
  return <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
    <div className="flex flex-wrap gap-1 rounded-xl bg-slate-950/40 p-1" role="group" aria-label="Публикация">
      {([['all', 'Все', total], ['published', 'На сайте', published], ['draft', 'Черновики', total - published]] as const).map(([value, label, count]) =>
        <button key={value} type="button" aria-pressed={filter === value} onClick={() => onFilter(value)} className={`min-h-10 rounded-lg px-3 text-sm transition-colors ${filter === value ? 'bg-slate-700/60 text-white' : 'text-slate-400 hover:text-slate-200'}`}>{label}<span className="ml-2 text-xs opacity-60">{count}</span></button>)}
    </div>
    <div className="relative w-full sm:w-72"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
      <input type="search" aria-label="Поиск по названию" placeholder="Найти по названию…" value={query} onChange={event => onQuery(event.target.value)} className="h-10 w-full rounded-xl border border-white/10 bg-slate-950/30 pl-10 pr-9 text-sm text-slate-100 placeholder:text-slate-500" />
      {query && <button type="button" onClick={() => onQuery('')} aria-label="Очистить поиск" className="absolute right-1 top-1 rounded-lg p-2 text-slate-400"><X className="h-4 w-4" /></button>}
    </div>
  </div>;
}
