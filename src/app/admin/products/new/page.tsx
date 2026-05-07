import type { Metadata } from "next";
import { createProduct } from "@/app/admin/actions";
import { ProductForm } from "@/app/admin/products/product-form";
import { getAdminProductOptions } from "@/lib/admin-products";

export const metadata: Metadata = {
  title: "Новый товар",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewProductPage() {
  const { categories, brands } = await getAdminProductOptions();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl text-slate-950">Новый товар</h1>
        <p className="text-sm text-slate-500">Заполните основные поля и сохраните товар в каталог.</p>
      </div>
      <ProductForm action={createProduct} categories={categories} brands={brands} />
    </div>
  );
}

