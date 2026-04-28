import type { LucideIcon } from "lucide-react";

export type CategoryDTO = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BrandDTO = {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductCharacteristicDTO = {
  id: string;
  productId: string;
  name: string;
  value: string;
  createdAt: string;
};

export type ProductDTO = {
  id: string;
  slug: string;
  sku: string | null;
  name: string;
  shortDescription: string | null;
  description: string | null;
  price: number;
  oldPrice: number | null;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew: boolean;
  isPopular: boolean;
  images: string[];
  createdAt: string;
  updatedAt: string;
  brandId: string;
  categoryId: string;
  brand: BrandDTO;
  category: CategoryDTO;
  characteristics: ProductCharacteristicDTO[];
};

// Aliases для обратной совместимости
/** @deprecated Используйте CategoryDTO */
export type PrismaCategory = CategoryDTO;
/** @deprecated Используйте BrandDTO */
export type PrismaBrand = BrandDTO;
/** @deprecated Используйте ProductCharacteristicDTO */
export type PrismaProductCharacteristic = ProductCharacteristicDTO;
/** @deprecated Используйте ProductDTO */
export type PrismaProduct = ProductDTO;

export type CatalogCategory = CategoryDTO & {
  icon: LucideIcon;
};

export type CatalogProduct = ProductDTO;

export type CatalogFilters = {
  category?: string;
  brand?: string;
  search?: string;
};

export type CatalogSearchState = CatalogFilters & {
  page: number;
};

export type CatalogPageData = {
  state: CatalogSearchState;
  items: CatalogProduct[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  categories: FilterOption[];
  brands: FilterOption[];
  dataSource: "database" | "seed";
  notice?: string;
};

export type FilterOption = {
  slug: string;
  label: string;
  count: number;
};
