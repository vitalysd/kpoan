import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CatalogProduct } from "@/types/catalog";

type ProductCardProps = {
  product: CatalogProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-300 hover:border-cyan-500 hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-xs uppercase tracking-[0.18em] text-cyan-700">
            {product.brand.name}
          </div>
          <h2 className="mb-1 text-lg text-slate-900">{product.name}</h2>
          <div className="mb-2 text-sm text-slate-500">{product.category.name}</div>
          <p className="text-sm leading-5 text-slate-600">{product.shortDescription}</p>
        </div>

        <div className="lg:flex-none">
          <Link
            href="/#contacts"
            className="inline-flex items-center gap-2 text-sm text-cyan-700 transition-colors hover:text-cyan-900"
          >
            Запросить товар
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
