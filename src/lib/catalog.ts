import { unstable_cache } from "next/cache";
import { getCategoryIcon } from "@/lib/catalog-icons";
import { prisma } from "@/lib/prisma";
import type {
  CatalogCategory,
  CatalogPageData,
  CatalogProduct,
  CatalogSearchState,
  FilterOption,
} from "@/types/catalog";

// Типы для «сырых» данных из Prisma (Date вместо string, Decimal вместо number)
type RawCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type RawBrand = {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type RawCharacteristic = {
  id: string;
  productId: string;
  name: string;
  value: string;
  createdAt: Date;
};

type RawProduct = {
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
  brand: RawBrand;
  category: RawCategory;
  characteristics: RawCharacteristic[];
};

export const PRODUCTS_PER_PAGE = 12;

export const parseCatalogSearchParams = (
  searchParams: Record<string, string | string[] | undefined>,
): CatalogSearchState => {
  const rawPage = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const rawCategory = Array.isArray(searchParams.category)
    ? searchParams.category[0]
    : searchParams.category;
  const rawBrand = Array.isArray(searchParams.brand)
    ? searchParams.brand[0]
    : searchParams.brand;
  const parsedPage = rawPage ? Number(rawPage) : 1;
  const page = Number.isFinite(parsedPage) ? parsedPage : 1;

  return {
    category: rawCategory || undefined,
    brand: rawBrand || undefined,
    page: page > 0 ? Math.floor(page) : 1,
  };
};

const mapCategory = (category: RawCategory): CatalogCategory => ({
  id: category.id,
  slug: category.slug,
  name: category.name,
  description: category.description,
  image: category.image,
  createdAt: category.createdAt.toISOString(),
  updatedAt: category.updatedAt.toISOString(),
  icon: getCategoryIcon(category.slug),
});

const mapProduct = (product: RawProduct): CatalogProduct => ({
  id: product.id,
  slug: product.slug,
  sku: product.sku,
  name: product.name,
  shortDescription: product.shortDescription,
  description: product.description,
  price: Number(product.price.toString()),
  oldPrice: product.oldPrice ? Number(product.oldPrice.toString()) : null,
  rating: product.rating,
  reviewCount: product.reviewCount,
  inStock: product.inStock,
  isNew: product.isNew,
  isPopular: product.isPopular,
  images: product.images,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
  brandId: product.brandId,
  categoryId: product.categoryId,
  brand: {
    id: product.brand.id,
    slug: product.brand.slug,
    name: product.brand.name,
    logo: product.brand.logo,
    createdAt: product.brand.createdAt.toISOString(),
    updatedAt: product.brand.updatedAt.toISOString(),
  },
  category: {
    id: product.category.id,
    slug: product.category.slug,
    name: product.category.name,
    description: product.category.description,
    image: product.category.image,
    createdAt: product.category.createdAt.toISOString(),
    updatedAt: product.category.updatedAt.toISOString(),
  },
  characteristics: product.characteristics.map((char) => ({
    id: char.id,
    productId: char.productId,
    name: char.name,
    value: char.value,
    createdAt: char.createdAt.toISOString(),
  })),
});

export const getCatalogCategories = async (): Promise<CatalogCategory[]> => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return categories.map(mapCategory);
};

/**
 * Внутренняя функция получения данных каталога.
 * Оборачивается в unstable_cache для кэширования.
 */
const _getCatalogPageData = async (
  searchParams: Record<string, string | string[] | undefined>,
): Promise<CatalogPageData> => {
  const state = parseCatalogSearchParams(searchParams);

  const where: Record<string, unknown> = {};
  if (state.category) {
    where.category = { slug: state.category };
  }
  if (state.brand) {
    where.brand = { slug: state.brand };
  }

  const hasFilters = Object.keys(where).length > 0;
  const totalItems = await prisma.product.count({
    where: hasFilters ? where : undefined,
  });
  const totalPages = Math.max(1, Math.ceil(totalItems / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(state.page, totalPages);
  const skip = (currentPage - 1) * PRODUCTS_PER_PAGE;

  const [items, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: hasFilters ? where : undefined,
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
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: {
        slug: true,
        name: true,
        _count: {
          select: {
            products: {
              where: hasFilters && state.category
                ? { category: { slug: state.category } }
                : undefined,
            },
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
    brands: brands.map((brand): FilterOption => ({
      slug: brand.slug,
      label: brand.name,
      count: brand._count.products,
    })),
  };
};

/**
 * Кэшированная версия получения данных каталога.
 * Кэш обновляется каждые 1 час.
 */
export const getCatalogPageData = unstable_cache(
  _getCatalogPageData,
  ["catalog-page"],
  { revalidate: 3600, tags: ["catalog"] },
);

export const createCatalogQueryString = (
  state: Partial<CatalogSearchState> & { page?: number },
) => {
  const params = new URLSearchParams();

  if (state.category) params.set("category", state.category);
  if (state.brand) params.set("brand", state.brand);
  if (state.page && state.page > 1) params.set("page", String(state.page));

  return params.toString();
};
