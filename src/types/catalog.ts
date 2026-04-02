import type { LucideIcon } from "lucide-react";

export type PrismaCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PrismaBrand = {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PrismaProductCharacteristic = {
  id: string;
  productId: string;
  name: string;
  value: string;
  createdAt: string;
};

export type PrismaProduct = {
  id: string;
  slug: string;
  sku: string;
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
  brand: PrismaBrand;
  category: PrismaCategory;
  characteristics: PrismaProductCharacteristic[];
};

export type CatalogCategory = PrismaCategory & {
  icon: LucideIcon;
  subcategories?: Array<{
    slug: string;
    name: string;
  }>;
};

export type CatalogProduct = PrismaProduct;

export type CatalogSearchState = {
  category?: string;
  subcategory: string[];
  page: number;
};

export type FilterOption = {
  slug: string;
  label: string;
  count: number;
};
