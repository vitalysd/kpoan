"use client";

import { useRef } from "react";
import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCatalogQuery } from "@/components/catalog/use-catalog-query";

export function SearchInput() {
  const searchParams = useSearchParams();
  const { setSingleValue } = useCatalogQuery();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialValue = searchParams.get("q") ?? "";

  const handleSubmit = (formData: FormData) => {
    const value = String(formData.get("q") ?? "").trim();
    setSingleValue("q", value || null);
  };

  const handleClear = () => {
    formRef.current?.reset();
    setSingleValue("q", null);
    inputRef.current?.focus();
  };

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="relative"
      key={initialValue}
    >
      <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-sm transition-colors focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500">
        <Search className="ml-3 h-4 w-4 shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          name="q"
          defaultValue={initialValue}
          placeholder="Поиск по названию, артикулу…"
          className="w-full border-0 bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none"
          aria-label="Поиск товаров"
        />
        {initialValue ? (
          <button
            type="button"
            onClick={handleClear}
            className="mr-2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Очистить поиск"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <button
          type="submit"
          className="mr-2 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-cyan-700"
        >
          Найти
        </button>
      </div>
    </form>
  );
}
