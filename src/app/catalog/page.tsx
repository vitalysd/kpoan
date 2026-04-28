import type { Metadata } from "next";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { ProductCard } from "@/components/catalog/product-card";
import { SearchInput } from "@/components/catalog/search-input";
import { Reveal } from "@/components/reveal";
import { getCatalogPageData } from "@/lib/catalog";
import type { CatalogPageData } from "@/types/catalog";

export const dynamic = "force-dynamic";

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: CatalogPageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const category = Array.isArray(resolved.category)
    ? resolved.category[0]
    : resolved.category;
  const brand = Array.isArray(resolved.brand)
    ? resolved.brand[0]
    : resolved.brand;
  const q = Array.isArray(resolved.q)
    ? resolved.q[0]
    : resolved.q;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kpoan.ru';

  let title = "Каталог";
  if (q) {
    title = `Поиск: ${q}`;
  } else if (category && brand) {
    title = `${category} — ${brand}`;
  } else if (category) {
    title = category;
  } else if (brand) {
    title = brand;
  }

  return {
    title,
    description: q
      ? `Результаты поиска «${q}» в каталоге ООО «КПОАН»`
      : "Каталог товаров ООО «КПОАН» с фильтрацией по категориям и брендам.",
    alternates: {
      canonical: `${siteUrl}/catalog`,
    },
  };
}

export default function CatalogRoute({ searchParams }: CatalogPageProps) {
  return (
    <CatalogRouteInner searchParams={searchParams} />
  );
}

async function CatalogRouteInner({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data: CatalogPageData = await getCatalogPageData(await searchParams);

  const hasActiveFilters = data.state.search || data.state.category || data.state.brand;

  const getPageHeading = () => {
    if (data.state.search) return `Результаты поиска: «${data.state.search}»`;
    if (data.state.category && data.state.brand) return `${data.state.category} — ${data.state.brand}`;
    if (data.state.category) return data.state.category;
    if (data.state.brand) return data.state.brand;
    return "Каталог товаров";
  };

  return (
    <main className="bg-slate-950">
      <section className="bg-slate-50 pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="sr-only">
            <h1>{getPageHeading()}</h1>
          </div>
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="hidden lg:block lg:sticky lg:top-8">
              <CatalogFilters categories={data.categories} brands={data.brands} />
            </aside>

            <div className="space-y-6">
              <div className="space-y-4">
                <SearchInput />
                <Reveal className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-lg text-slate-900">
                      Найдено {data.totalItems} товаров
                    </div>
                    {hasActiveFilters && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {data.state.search && (
                          <span className="rounded-full bg-cyan-100 px-3 py-1 text-cyan-800">
                            «{data.state.search}»
                          </span>
                        )}
                        {data.state.category && (
                          <span className="rounded-full bg-cyan-100 px-3 py-1 text-cyan-800">
                            {data.state.category}
                          </span>
                        )}
                        {data.state.brand && (
                          <span className="rounded-full bg-cyan-100 px-3 py-1 text-cyan-800">
                            {data.state.brand}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Reveal>
              </div>

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
                    Попробуйте изменить поисковый запрос, фильтры или сбросить параметры поиска.
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
