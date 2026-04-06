import { getCategoryIcon } from "@/lib/catalog-icons";
import { prisma } from "@/lib/prisma";
import type {
  CatalogCategory,
  CatalogProduct,
  CatalogSearchState,
  FilterOption,
} from "@/types/catalog";

export const PRODUCTS_PER_PAGE = 12;

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
    page: page > 0 ? Math.floor(page) : 1,
  };
};

const mapCategory = (category: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}): CatalogCategory => ({
  ...category,
  createdAt: category.createdAt.toISOString(),
  updatedAt: category.updatedAt.toISOString(),
  icon: getCategoryIcon(category.slug),
});

const mapProduct = (product: {
  id: string;
  slug: string;
  sku: string | null;
  name: string;
  shortDescription: string | null;
  description: string | null;
  price: { toString(): string };
  oldPrice: { toString(): string } | null;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew: boolean;
  isPopular: boolean;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  brandId: string;
  categoryId: string;
  brand: {
    id: string;
    slug: string;
    name: string;
    logo: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  category: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  characteristics: Array<{
    id: string;
    productId: string;
    name: string;
    value: string;
    createdAt: Date;
  }>;
}): CatalogProduct => ({
  ...product,
  price: Number(product.price.toString()),
  oldPrice: product.oldPrice ? Number(product.oldPrice.toString()) : null,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
  brand: {
    ...product.brand,
    createdAt: product.brand.createdAt.toISOString(),
    updatedAt: product.brand.updatedAt.toISOString(),
  },
  category: {
    ...product.category,
    createdAt: product.category.createdAt.toISOString(),
    updatedAt: product.category.updatedAt.toISOString(),
  },
  characteristics: product.characteristics.map((characteristic) => ({
    ...characteristic,
    createdAt: characteristic.createdAt.toISOString(),
  })),
});

export const getCatalogCategories = async (): Promise<CatalogCategory[]> => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return categories.map(mapCategory);
};

export const getCatalogPageData = async (
  searchParams: Record<string, string | string[] | undefined>,
) => {
  const state = parseCatalogSearchParams(searchParams);
  const where = state.category
    ? {
        category: {
          slug: state.category,
        },
      }
    : undefined;

  const totalItems = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalItems / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(state.page, totalPages);
  const skip = (currentPage - 1) * PRODUCTS_PER_PAGE;

  const [items, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: PRODUCTS_PER_PAGE,
      orderBy: [{ isPopular: "desc" }, { createdAt: "desc" }],
      include: {
        brand: true,
        category: true,
        characteristics: {
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        slug: true,
        name: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    }),
  ]);

  return {
    state: { ...state, page: currentPage },
    items: items.map(mapProduct),
    totalItems,
    totalPages,
    currentPage,
    categories: categories.map((category): FilterOption => ({
      slug: category.slug,
      label: category.name,
      count: category._count.products,
    })),
  };
};

export const createCatalogQueryString = (
  state: Partial<CatalogSearchState> & { page?: number },
) => {
  const params = new URLSearchParams();

  if (state.category) params.set("category", state.category);
  if (state.page && state.page > 1) params.set("page", String(state.page));

  return params.toString();
};
