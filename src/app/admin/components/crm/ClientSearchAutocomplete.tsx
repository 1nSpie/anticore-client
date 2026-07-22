"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "src/lib/utils";
import { Input } from "@/shadcn/input";
import { adminApi } from "../../_lib/api";
import type { CrmClient, CrmClientListResponse } from "../../_lib/crmTypes";
import {
  formatPhoneRuDisplaySafe,
  phoneDigitsForSearch,
  phonesMatchRu,
} from "@/lib/phoneRu";

function clientLabel(c: Pick<CrmClient, "fio" | "phone">): string {
  const phone = formatPhoneRuDisplaySafe(c.phone);
  if (c.fio && c.fio !== c.phone) return `${c.fio} — ${phone}`;
  return phone;
}

type Props = {
  clientId: number | null;
  onClientChange: (client: CrmClient | null) => void;
  presetClient?: Pick<CrmClient, "id" | "fio" | "phone"> | null;
  /** Начальный поиск (телефон из заявки и т.п.) */
  initialQuery?: string;
  /** Текущее значение поля поиска (для быстрого создания клиента) */
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  inputClassName?: string;
  disabled?: boolean;
};

export function ClientSearchAutocomplete({
  clientId,
  onClientChange,
  presetClient,
  initialQuery,
  onQueryChange,
  placeholder = "Телефон или ФИО…",
  inputClassName,
  disabled = false,
}: Props) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CrmClient[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialSearchDoneRef = useRef(false);

  const search = useCallback(
    async (term: string, options?: { autoSelect?: boolean }) => {
      const q = term.trim();
      if (q.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const searchTerm = /^\d[\d\s+\-()]*$/.test(q)
          ? phoneDigitsForSearch(q)
          : q;
        const { data } = await adminApi.get<CrmClientListResponse>("/crm/clients", {
          params: { q: searchTerm, limit: 20 },
        });
        setResults(data.items);
        setHighlightedIndex(0);

        if (options?.autoSelect && !clientId && initialQuery) {
          const match = data.items.find((c) => phonesMatchRu(c.phone, initialQuery));
          if (match) {
            onClientChange(match);
            setQuery(clientLabel(match));
            setIsOpen(false);
          }
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [clientId, initialQuery, onClientChange],
  );

  useEffect(() => {
    initialSearchDoneRef.current = false;
  }, [initialQuery]);

  useEffect(() => {
    if (clientId && presetClient?.id === clientId) {
      setQuery(clientLabel(presetClient));
      return;
    }
    if (clientId) {
      return;
    }

    if (initialQuery) {
      setQuery(formatPhoneRuDisplaySafe(initialQuery));
      if (!initialSearchDoneRef.current) {
        initialSearchDoneRef.current = true;
        setIsOpen(true);
        void search(initialQuery, { autoSelect: true });
      }
      return;
    }

    setQuery("");
  }, [clientId, presetClient, initialQuery, search]);

  useEffect(() => {
    onQueryChange?.(query);
  }, [query, onQueryChange]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!isOpen) return;
    if (initialSearchDoneRef.current && query === formatPhoneRuDisplaySafe(initialQuery ?? "")) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      void search(query);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isOpen, search, initialQuery]);

  const select = (client: CrmClient) => {
    onClientChange(client);
    setQuery(clientLabel(client));
    setIsOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      if (clientId) {
        const fromResults = results.find((c) => c.id === clientId);
        if (fromResults) {
          setQuery(clientLabel(fromResults));
          return;
        }
        if (presetClient?.id === clientId) {
          setQuery(clientLabel(presetClient));
        }
      } else if (!query.trim()) {
        onClientChange(null);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[highlightedIndex]) select(results[highlightedIndex]);
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const showDropdown = isOpen && (loading || query.trim().length >= 2);

  return (
    <div ref={containerRef} className="relative w-full flex-1">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            initialSearchDoneRef.current = true;
            setQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value.trim()) onClientChange(null);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("pr-9", inputClassName)}
          autoComplete="off"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        ) : (
          <ChevronDown
            className={cn(
              "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-white/15 bg-slate-900 shadow-xl">
          {loading && results.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-slate-400">
              Поиск…
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-slate-400">
              {query.trim().length < 2
                ? "Введите минимум 2 символа"
                : "Клиенты не найдены"}
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto overscroll-contain p-1">
              {results.map((client, i) => (
                <button
                  key={client.id}
                  type="button"
                  className={cn(
                    "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                    client.id === clientId
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "text-slate-200 hover:bg-white/10",
                    i === highlightedIndex && client.id !== clientId && "bg-white/5",
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(client);
                  }}
                  onMouseEnter={() => setHighlightedIndex(i)}
                >
                  <span className="font-medium">{client.fio || "Без имени"}</span>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    {formatPhoneRuDisplaySafe(client.phone)}
                    {client.carModel ? ` · ${client.carModel}` : ""}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
