import type { Metadata } from "next";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { ProductCard } from "@/components/catalog/product-card";
import { Reveal } from "@/components/reveal";
import { getCatalogPageData } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Каталог инструментов | ООО «КПОАН»",
  description:
    "Каталог товаров ООО «КПОАН» с фильтрацией и данными из PostgreSQL через Prisma.",
};

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CatalogRoute({ searchParams }: CatalogPageProps) {
  const resolvedSearchParams = await searchParams;
  const data = await getCatalogPageData(resolvedSearchParams);

  return (
    <main className="bg-slate-950">
      <section className="bg-slate-50 pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <CatalogFilters categories={data.categories} />

            <div className="space-y-6">
              <Reveal className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-lg text-slate-900">Найдено {data.totalItems} товаров</div>
              </Reveal>

              {data.items.length > 0 ? (
                <div className="space-y-4">
                  {data.items.map((product, index) => (
                    <Reveal key={product.id} delay={index * 45}>
                      <ProductCard product={product} />
                    </Reveal>
                  ))}
                </div>
              ) : (
                <Reveal className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                  <div className="mb-3 text-2xl text-slate-900">Товары не найдены</div>
                  <p className="mx-auto max-w-xl text-slate-600">
                    Попробуйте изменить фильтры или сбросить параметры поиска.
                    Страница сохраняет состояние в URL, поэтому ссылку с
                    выбранными фильтрами можно отправлять коллегам.
                  </p>
                </Reveal>
              )}

              <Reveal delay={120}>
                <CatalogPagination
                  currentPage={data.currentPage}
                  totalPages={data.totalPages}
                  state={data.state}
                />
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
