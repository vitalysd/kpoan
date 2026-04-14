"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { BrandsFilter } from "@/components/catalog/brands-filter";
import { CategoriesFilter } from "@/components/catalog/categories-filter";
import { useCatalogQuery } from "@/components/catalog/use-catalog-query";
import type { FilterOption } from "@/types/catalog";

type CatalogFiltersProps = {
  categories: FilterOption[];
  brands: FilterOption[];
};

function FiltersContent({ categories, brands }: CatalogFiltersProps) {
  const { clearAll } = useCatalogQuery();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div>
          <div className="text-base text-slate-900">Фильтры</div>
        </div>
        <button
          type="button"
          onClick={clearAll}
          className="text-sm cursor-pointer text-cyan-700 transition-colors hover:text-cyan-900"
        >
          Сбросить
        </button>
      </div>
      <CategoriesFilter options={categories} />
      <BrandsFilter options={brands} />
    </div>
  );
}

export function CatalogFilters(props: CatalogFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Фильтры
        </button>
      </div>
      <div className="hidden lg:block">
        <FiltersContent {...props} />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setIsOpen(false); }}
            className="absolute inset-0 bg-slate-950/60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            aria-label="Закрыть фильтры"
          />
          <div className="absolute left-0 top-0 h-full w-[88vw] max-w-sm overflow-y-auto bg-slate-50 p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-4 text-white">
              <div>
                <div className="text-base">Фильтры каталога</div>
                <div className="text-sm text-slate-300">Категории и бренды товаров</div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-white/10 p-2"
                aria-label="Закрыть панель"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FiltersContent {...props} />
          </div>
        </div>
      )}
    </>
  );
}
