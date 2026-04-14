"use client";

import { useSearchParams } from "next/navigation";
import { useCatalogQuery } from "@/components/catalog/use-catalog-query";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export function SearchInput() {
  const searchParams = useSearchParams();
  const { setSingleValue } = useCatalogQuery();
  const initialValue = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(!!initialValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
    setIsOpen(!!initialValue);
  }, [initialValue]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = e.target.value;
      setValue(nextValue);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (!nextValue.trim()) {
        setSingleValue("q", null);
        return;
      }

      timeoutRef.current = setTimeout(() => {
        setSingleValue("q", nextValue.trim());
      }, 350);
    },
    [setSingleValue],
  );

  const handleClear = useCallback(() => {
    setValue("");
    setSingleValue("q", null);
    inputRef.current?.focus();
  }, [setSingleValue]);

  return (
    <div className="relative">
      <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-sm transition-colors focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500">
        <Search className="ml-3 h-4 w-4 shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Поиск по названию, артикулу…"
          className="w-full border-0 bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none"
          onFocus={() => setIsOpen(true)}
          aria-label="Поиск товаров"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="mr-2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Очистить поиск"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
