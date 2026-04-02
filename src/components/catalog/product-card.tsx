import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CatalogProduct } from "@/types/catalog";

type ProductCardProps = {
  product: CatalogProduct;
};

const characteristic = (product: CatalogProduct, key: string) =>
  product.characteristics.find((item) => item.name === key)?.value;

export function ProductCard({ product }: ProductCardProps) {
  const powerSource = characteristic(product, "powerSource");
  const purpose = characteristic(product, "purpose");

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500 hover:shadow-xl">
      <div className="relative border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-5">
        <div className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
          {product.inStock ? "В наличии" : "Под заказ"}
        </div>
        <div className="flex min-h-40 items-end">
          <div>
            <div className="mb-3 text-xs uppercase tracking-[0.18em] text-cyan-200">
              {product.brand.name}
            </div>
            <div className="max-w-[15rem] text-xl text-white">{product.name}</div>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 text-sm text-slate-500">{product.category.name}</div>

        <p className="mb-4 min-h-12 text-sm text-slate-600">{product.shortDescription}</p>

        <div className="mb-5 rounded-2xl bg-slate-50 p-4">
          <div className="mb-3 text-sm uppercase tracking-[0.18em] text-slate-500">
            Характеристики
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            {powerSource ? <li>Тип питания: {powerSource}</li> : null}
            {purpose ? <li>Назначение: {purpose}</li> : null}
            <li>{product.isNew ? "Новинка каталога" : "Проверенная позиция"}</li>
          </ul>
        </div>

        <Link
          href="/#contacts"
          className="inline-flex items-center gap-2 text-sm text-cyan-700 transition-colors hover:text-cyan-900"
        >
          Запросить товар
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
