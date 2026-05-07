import "server-only";
import { prisma } from "@/lib/prisma";

export const ADMIN_PRODUCTS_PER_PAGE = 30;

export type AdminProductFilters = {
  page: number;
  q?: string;
  brand?: string;
  category?: string;
};

export const parseAdminProductFilters = (
  searchParams: Record<string, string | string[] | undefined>,
): AdminProductFilters => {
  const rawPage = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const rawQ = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const rawBrand = Array.isArray(searchParams.brand) ? searchParams.brand[0] : searchParams.brand;
  const rawCategory = Array.isArray(searchParams.category)
    ? searchParams.category[0]
    : searchParams.category;
  const parsedPage = rawPage ? Number(rawPage) : 1;

  return {
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? Math.round(parsedPage) : 1,
    q: rawQ || undefined,
    brand: rawBrand || undefined,
    category: rawCategory || undefined,
  };
};

export const createAdminProductsQueryString = (
  filters: Partial<AdminProductFilters> & { page?: number },
) => {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.category) params.set("category", filters.category);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));

  return params.toString();
};

const buildProductsWhere = (filters: AdminProductFilters) => {
  const where: Record<string, unknown> = {};

  if (filters.brand) {
    where.brand = { slug: filters.brand };
  }

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { sku: { contains: filters.q, mode: "insensitive" } },
      { slug: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return Object.keys(where).length > 0 ? where : undefined;
};

export const getAdminProductOptions = async () => {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true },
    }),
  ]);

  return { categories, brands };
};

export const getAdminProductsPage = async (filters: AdminProductFilters) => {
  const where = buildProductsWhere(filters);
  const totalItems = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalItems / ADMIN_PRODUCTS_PER_PAGE));
  const currentPage = Math.min(filters.page, totalPages);
  const skip = (currentPage - 1) * ADMIN_PRODUCTS_PER_PAGE;

  const items = await prisma.product.findMany({
    where,
    skip,
    take: ADMIN_PRODUCTS_PER_PAGE,
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    include: {
      brand: true,
      category: true,
      characteristics: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return {
    items,
    totalItems,
    totalPages,
    currentPage,
  };
};

export const getAdminProduct = async (id: string) =>
  prisma.product.findUnique({
    where: { id },
    include: {
      characteristics: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

