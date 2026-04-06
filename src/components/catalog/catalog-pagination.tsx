import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { createCatalogQueryString } from "@/lib/catalog";
import type { CatalogSearchState } from "@/types/catalog";

type CatalogPaginationProps = {
  currentPage: number;
  totalPages: number;
  state: CatalogSearchState;
};

/**
 * Формирует массив страниц с многоточиями.
 * Возвращает числа и "..." для компактного отображения.
 * maxVisible — максимальное количество числовых кнопок (по умолчанию 8).
 */
function getPageItems(currentPage: number, totalPages: number, maxVisible = 8): (number | "ellipsis")[] {
  if (totalPages <= maxVisible + 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis")[] = [];
  const half = Math.floor((maxVisible - 2) / 2);
  let start = Math.max(2, currentPage - half);
  let end = Math.min(totalPages - 1, currentPage + half);

  // Корректируем окно, чтобы всегда было maxVisible чисел
  const windowSize = end - start + 1;
  if (windowSize < maxVisible - 2) {
    if (currentPage <= totalPages / 2) {
      end = Math.min(totalPages - 1, start + maxVisible - 3);
    } else {
      start = Math.max(2, end - maxVisible + 3);
    }
  }

  items.push(1);

  if (start > 2) {
    items.push("ellipsis");
  }

  for (let i = start; i <= end; i++) {
    items.push(i);
  }

  if (end < totalPages - 1) {
    items.push("ellipsis");
  }

  items.push(totalPages);

  return items;
}

export function CatalogPagination({
  currentPage,
  totalPages,
  state,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const pageItems = getPageItems(currentPage, totalPages, 8);

  const pageHref = (page: number) => {
    const query = createCatalogQueryString({ ...state, page });
    return query ? `/catalog?${query}` : "/catalog";
  };

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2">
      <Link
        href={pageHref(Math.max(1, currentPage - 1))}
        className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm transition-colors ${
          currentPage === 1
            ? "pointer-events-none border-slate-200 text-slate-300"
            : "border-slate-300 bg-white text-slate-700 hover:border-cyan-500 hover:text-cyan-700"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
        Назад
      </Link>

      {pageItems.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-11 min-w-11 items-center justify-center px-2 text-slate-400"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <Link
            key={item}
            href={pageHref(item)}
            className={`inline-flex h-11 min-w-11 items-center justify-center rounded-xl border px-4 text-sm transition-colors ${
              item === currentPage
                ? "border-cyan-600 bg-cyan-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-cyan-500 hover:text-cyan-700"
            }`}
          >
            {item}
          </Link>
        ),
      )}

      <Link
        href={pageHref(Math.min(totalPages, currentPage + 1))}
        className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm transition-colors ${
          currentPage === totalPages
            ? "pointer-events-none border-slate-200 text-slate-300"
            : "border-slate-300 bg-white text-slate-700 hover:border-cyan-500 hover:text-cyan-700"
        }`}
      >
        Вперед
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
