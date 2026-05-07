import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteProduct, updateProduct } from "@/app/admin/actions";
import { ProductForm } from "@/app/admin/products/product-form";
import { getAdminProduct, getAdminProductOptions } from "@/lib/admin-products";

export const metadata: Metadata = {
  title: "Редактирование товара",
  robots: {
    index: false,
    follow: false,
  },
};

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditProductPage({ params, searchParams }: EditProductPageProps) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const [{ categories, brands }, product] = await Promise.all([
    getAdminProductOptions(),
    getAdminProduct(id),
  ]);

  if (!product) {
    notFound();
  }

  const updateAction = updateProduct.bind(null, product.id);
  const deleteAction = deleteProduct.bind(null, product.id);
  const saved = resolvedSearchParams.saved === "1";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl text-slate-950">Редактирование товара</h1>
        <p className="text-sm text-slate-500">{product.name}</p>
      </div>
      <ProductForm
        product={product}
        action={updateAction}
        deleteAction={deleteAction}
        categories={categories}
        brands={brands}
        saved={saved}
      />
    </div>
  );
}

