import type { Metadata } from "next";
import Link from "next/link";
import { Edit, Plus, Search } from "lucide-react";
import {
  createAdminProductsQueryString,
  getAdminProductOptions,
  getAdminProductsPage,
  parseAdminProductFilters,
} from "@/lib/admin-products";

export const metadata: Metadata = {
  title: "Товары",
  robots: {
    index: false,
    follow: false,
  },
};

type AdminProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const formatPrice = (value: { toString(): string }) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Number(value.toString()));

const pageHref = (
  page: number,
  filters: ReturnType<typeof parseAdminProductFilters>,
) => {
  const query = createAdminProductsQueryString({ ...filters, page });
  return query ? `/admin/products?${query}` : "/admin/products";
};

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const filters = parseAdminProductFilters(await searchParams);
  const [{ categories, brands }, data] = await Promise.all([
    getAdminProductOptions(),
    getAdminProductsPage(filters),
  ]);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <form className="grid gap-4 md:grid-cols-[1fr_220px_220px_auto]" action="/admin/products">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Поиск</span>
            <input
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder="Название, SKU или slug"
              className="w-full rounded border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Бренд</span>
            <select
              name="brand"
              defaultValue={filters.brand ?? ""}
              className="w-full rounded border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            >
              <option value="">Все бренды</option>
              {brands.map((brand) => (
                <option key={brand.slug} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-slate-700">Категория</span>
            <select
              name="category"
              defaultValue={filters.category ?? ""}
              className="w-full rounded border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600"
            >
              <option value="">Все категории</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex h-[50px] items-center gap-2 rounded bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              <Search className="h-4 w-4" />
              Найти
            </button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl text-slate-950">Товары</h1>
            <p className="text-sm text-slate-500">
              Найдено: {data.totalItems}. Страница {data.currentPage} из {data.totalPages}.
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-700"
          >
            <Plus className="h-4 w-4" />
            Добавить товар
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Товар</th>
                <th className="px-5 py-3 font-medium">Бренд</th>
                <th className="px-5 py-3 font-medium">Категория</th>
                <th className="px-5 py-3 font-medium">Цена</th>
                <th className="px-5 py-3 font-medium">Статус</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((product) => (
                <tr key={product.id} className="align-top">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-950">{product.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{product.sku || product.slug}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{product.brand.name}</td>
                  <td className="px-5 py-4 text-slate-700">{product.category.name}</td>
                  <td className="px-5 py-4 text-slate-900">{formatPrice(product.price)}</td>
                  <td className="px-5 py-4">
                    <span className={product.inStock ? "text-green-700" : "text-red-700"}>
                      {product.inStock ? "В наличии" : "Нет в наличии"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700"
                    >
                      <Edit className="h-4 w-4" />
                      Изменить
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.items.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">Товары не найдены.</div>
        )}
      </section>

      {data.totalPages > 1 && (
        <nav className="flex flex-wrap justify-center gap-2">
          <Link
            href={pageHref(Math.max(1, data.currentPage - 1), filters)}
            className={`rounded border px-4 py-2 text-sm ${
              data.currentPage === 1
                ? "pointer-events-none border-slate-200 text-slate-300"
                : "border-slate-300 bg-white text-slate-700 hover:border-cyan-500"
            }`}
          >
            Назад
          </Link>
          <span className="rounded border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
            {data.currentPage} / {data.totalPages}
          </span>
          <Link
            href={pageHref(Math.min(data.totalPages, data.currentPage + 1), filters)}
            className={`rounded border px-4 py-2 text-sm ${
              data.currentPage === data.totalPages
                ? "pointer-events-none border-slate-200 text-slate-300"
                : "border-slate-300 bg-white text-slate-700 hover:border-cyan-500"
            }`}
          >
            Вперед
          </Link>
        </nav>
      )}
    </div>
  );
}

