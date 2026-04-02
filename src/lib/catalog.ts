import { catalogCategories, catalogProducts } from "@/data/catalog";
import type { CatalogSearchState, FilterOption } from "@/types/catalog";

export const PRODUCTS_PER_PAGE = 12;

const parseArrayParam = (value: string | string[] | undefined) => {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
};

export const parseCatalogSearchParams = (
  searchParams: Record<string, string | string[] | undefined>,
): CatalogSearchState => {
  const rawPage = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const rawCategory = Array.isArray(searchParams.category)
    ? searchParams.category[0]
    : searchParams.category;
  const parsedPage = rawPage ? Number(rawPage) : 1;
  const page = Number.isFinite(parsedPage) ? parsedPage : 1;

  return {
    category: rawCategory || undefined,
    subcategory: parseArrayParam(searchParams.subcategory),
    page: page > 0 ? Math.floor(page) : 1,
  };
};

export const getCatalogPageData = (
  searchParams: Record<string, string | string[] | undefined>,
) => {
  const state = parseCatalogSearchParams(searchParams);

  const filtered = catalogProducts.filter((product) => {
    if (state.category && product.category.slug !== state.category) {
      return false;
    }

    return true;
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(state.page, totalPages);
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const items = filtered.slice(start, start + PRODUCTS_PER_PAGE);

  const categories: FilterOption[] = catalogCategories.map((category) => ({
    slug: category.slug,
    label: category.name,
    count: catalogProducts.filter((product) => product.category.slug === category.slug).length,
  }));

  return {
    state: { ...state, page: currentPage },
    items,
    totalItems,
    totalPages,
    currentPage,
    categories,
  };
};

export const createCatalogQueryString = (
  state: Partial<CatalogSearchState> & { page?: number },
) => {
  const params = new URLSearchParams();

  if (state.category) params.set("category", state.category);
  if (state.subcategory && state.subcategory.length > 0) {
    params.set("subcategory", state.subcategory.join(","));
  }
  if (state.page && state.page > 1) params.set("page", String(state.page));

  return params.toString();
};
