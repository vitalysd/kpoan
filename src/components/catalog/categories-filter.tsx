"use client";

import { FilterSection } from "@/components/catalog/filter-section";
import { useCatalogQuery } from "@/components/catalog/use-catalog-query";
import type { FilterOption } from "@/types/catalog";

type CategoriesFilterProps = {
  options: FilterOption[];
};

export function CategoriesFilter({ options }: CategoriesFilterProps) {
  const { searchParams, setManyValues } = useCatalogQuery();
  const active = searchParams.get("category") ?? "";

  return (
    <FilterSection title="Категории">
      <div className="grid gap-2">
        {options.map((option) => {
          const isActive = active === option.slug;

          return (
            <button
              key={option.slug}
              type="button"
              onClick={() =>
                setManyValues({
                  category: isActive ? null : option.slug,
                  subcategory: option.slug === "instrument" ? searchParams.get("subcategory") : null,
                })
              }
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                isActive
                  ? "border-cyan-600 bg-cyan-600 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-500 hover:text-cyan-700"
              }`}
            >
              <span>{option.label}</span>
              <span className={isActive ? "text-white/80" : "text-slate-400"}>{option.count}</span>
            </button>
          );
        })}
      </div>
    </FilterSection>
  );
}
