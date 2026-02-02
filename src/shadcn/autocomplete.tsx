"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "src/lib/utils";
import { Input } from "./input";

export interface AutocompleteOption {
  value: string;
  label: string;
}

interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  inputClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  filter?: (option: AutocompleteOption, query: string) => boolean;
}

const defaultFilter = (option: AutocompleteOption, query: string) => {
  if (!query.trim()) return true;
  return option.label.toLowerCase().includes(query.toLowerCase());
};

export function Autocomplete({
  options,
  value,
  onChange,
  placeholder = "Введите для поиска...",
  emptyMessage = "Ничего не найдено",
  className,
  inputClassName,
  dropdownClassName,
  disabled = false,
  filter = defaultFilter,
}: AutocompleteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(
    () => options.filter((opt) => filter(opt, query)),
    [options, query, filter]
  );

  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [filtered]);

  const select = (opt: AutocompleteOption) => {
    onChange(opt.value);
    setQuery(opt.label);
    setIsOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      if (!query.trim()) {
        onChange("");
        setQuery("");
        return;
      }
      const match = options.find((o) => o.label.toLowerCase() === query.trim().toLowerCase());
      if (match) {
        onChange(match.value);
        setQuery(match.label);
      } else if (value) {
        const current = options.find((o) => o.value === value);
        setQuery(current?.label ?? value);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlightedIndex]) {
          select(filtered[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  React.useEffect(() => {
    const el = listRef.current;
    if (!el || highlightedIndex < 0) return;
    const item = el.children[highlightedIndex] as HTMLElement;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn("pr-9", inputClassName)}
          autoComplete="off"
        />
        <ChevronDown
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {isOpen && (
        <div className={cn("absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden rounded-xl shadow-lg border border-orange-600 bg-white", dropdownClassName)}>
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              {emptyMessage}
            </div>
          ) : (
            <div ref={listRef} className="max-h-60 overflow-y-auto overscroll-contain p-1">
              {filtered.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors block text-gray-900",
                    opt.value === value
                      ? "bg-orange-100 text-orange-600"
                      : "hover:bg-orange-50",
                    i === highlightedIndex && "bg-orange-50"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    select(opt);
                  }}
                  onMouseEnter={() => setHighlightedIndex(i)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
