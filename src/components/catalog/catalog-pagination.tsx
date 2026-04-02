import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createCatalogQueryString } from "@/lib/catalog";
import type { CatalogSearchState } from "@/types/catalog";

type CatalogPaginationProps = {
  currentPage: number;
  totalPages: number;
  state: CatalogSearchState;
};

export function CatalogPagination({
  currentPage,
  totalPages,
  state,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

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

      {pageNumbers.map((page) => (
        <Link
          key={page}
          href={pageHref(page)}
          className={`inline-flex h-11 min-w-11 items-center justify-center rounded-xl border px-4 text-sm transition-colors ${
            page === currentPage
              ? "border-cyan-600 bg-cyan-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:border-cyan-500 hover:text-cyan-700"
          }`}
        >
          {page}
        </Link>
      ))}

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
