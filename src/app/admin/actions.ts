"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminSession, clearAdminSession, isAdminConfigured, requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/admin-slug";

const productSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  brandId: z.string().trim().min(1),
  categoryId: z.string().trim().min(1),
  shortDescription: z.string().trim().optional(),
  description: z.string().trim().optional(),
  price: z.coerce.number().min(0),
  oldPrice: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  reviewCount: z.coerce.number().int().min(0).optional(),
  inStock: z.boolean(),
  isNew: z.boolean(),
  isPopular: z.boolean(),
  images: z.string().optional(),
  characteristics: z.string().optional(),
});

const parseCheckbox = (formData: FormData, name: string) => formData.get(name) === "on";

const parseProductForm = (formData: FormData) => {
  const parsed = productSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    brandId: formData.get("brandId"),
    categoryId: formData.get("categoryId"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    price: formData.get("price"),
    oldPrice: formData.get("oldPrice") || undefined,
    rating: formData.get("rating") || undefined,
    reviewCount: formData.get("reviewCount") || undefined,
    inStock: parseCheckbox(formData, "inStock"),
    isNew: parseCheckbox(formData, "isNew"),
    isPopular: parseCheckbox(formData, "isPopular"),
    images: String(formData.get("images") ?? ""),
    characteristics: String(formData.get("characteristics") ?? ""),
  });

  const slug = parsed.slug || slugify(`${parsed.sku ? `${parsed.sku} ` : ""}${parsed.name}`);
  const images = (parsed.images ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const characteristics = (parsed.characteristics ?? "")
    .split(/\r?\n/)
    .map((line) => {
      const [name, ...valueParts] = line.split(":");
      const value = valueParts.join(":").trim();
      return { name: name?.trim() ?? "", value };
    })
    .filter((item) => item.name && item.value);

  return {
    data: {
      name: parsed.name,
      slug,
      sku: parsed.sku || null,
      brandId: parsed.brandId,
      categoryId: parsed.categoryId,
      shortDescription: parsed.shortDescription || null,
      description: parsed.description || null,
      price: parsed.price,
      oldPrice: parsed.oldPrice || null,
      rating: parsed.rating ?? 0,
      reviewCount: parsed.reviewCount ?? 0,
      inStock: parsed.inStock,
      isNew: parsed.isNew,
      isPopular: parsed.isPopular,
      images,
    },
    characteristics,
  };
};

const refreshCatalog = () => {
  revalidateTag("catalog", "max");
  revalidatePath("/catalog");
  revalidatePath("/admin/products");
};

export const loginAdmin = async (_state: { error?: string } | undefined, formData: FormData) => {
  const password = String(formData.get("password") ?? "");

  if (!isAdminConfigured()) {
    return { error: "ADMIN_PASSWORD не задан в переменных окружения." };
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "Неверный пароль." };
  }

  await createAdminSession();
  redirect("/admin/products");
};

export const logoutAdmin = async () => {
  await clearAdminSession();
  redirect("/admin/login");
};

export const createProduct = async (formData: FormData) => {
  await requireAdmin();
  const { data, characteristics } = parseProductForm(formData);
  const product = await prisma.product.create({
    data: {
      ...data,
      characteristics: {
        create: characteristics,
      },
    },
  });

  refreshCatalog();
  redirect(`/admin/products/${product.id}/edit`);
};

export const updateProduct = async (id: string, formData: FormData) => {
  await requireAdmin();
  const { data, characteristics } = parseProductForm(formData);

  await prisma.product.update({
    where: { id },
    data: {
      ...data,
      characteristics: {
        deleteMany: {},
        create: characteristics,
      },
    },
  });

  refreshCatalog();
  redirect(`/admin/products/${id}/edit?saved=1`);
};

export const deleteProduct = async (id: string) => {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  refreshCatalog();
  redirect("/admin/products");
};
