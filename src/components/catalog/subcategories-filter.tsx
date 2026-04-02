"use client";

import { FilterSection } from "@/components/catalog/filter-section";
import { useCatalogQuery } from "@/components/catalog/use-catalog-query";

type SubcategoriesFilterProps = {
  options: Array<{
    slug: string;
    name: string;
  }>;
};

export function SubcategoriesFilter({ options }: SubcategoriesFilterProps) {
  const { searchParams, toggleMultiValue } = useCatalogQuery();
  const active = new Set(
    (searchParams.get("subcategory") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );

  return (
    <FilterSection title="">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = active.has(option.slug);

          return (
            <button
              key={option.slug}
              type="button"
              onClick={() => toggleMultiValue("subcategory", option.slug)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                isActive
                  ? "border-cyan-600 bg-cyan-600 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-cyan-500 hover:text-cyan-700"
              }`}
            >
              {option.name}
            </button>
          );
        })}
      </div>
    </FilterSection>
  );
}
