import { PrismaClient } from "@prisma/client";
import { catalogCategories, catalogProducts } from "../src/data/catalog";

const prisma = new PrismaClient();

async function seedCategories() {
  const categories = new Map<string, string>();

  for (const category of catalogCategories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        image: category.image,
      },
      create: {
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description,
        image: category.image,
      },
    });

    categories.set(record.slug, record.id);
  }

  return categories;
}

async function seedBrands() {
  const brands = new Map<string, string>();
  const uniqueBrands = new Map(
    catalogProducts.map((product) => [product.brand.slug, product.brand]),
  );

  for (const brand of uniqueBrands.values()) {
    const record = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        logo: brand.logo,
      },
      create: {
        id: brand.id,
        slug: brand.slug,
        name: brand.name,
        logo: brand.logo,
      },
    });

    brands.set(record.slug, record.id);
  }

  return brands;
}

async function seedProducts(
  categoryIds: Map<string, string>,
  brandIds: Map<string, string>,
) {
  for (const product of catalogProducts) {
    const categoryId = categoryIds.get(product.category.slug);
    const brandId = brandIds.get(product.brand.slug);

    if (!categoryId || !brandId) {
      throw new Error(`Missing relation for product: ${product.slug}`);
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        sku: product.sku,
        name: product.name,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice,
        rating: product.rating,
        reviewCount: product.reviewCount,
        inStock: product.inStock,
        isNew: product.isNew,
        isPopular: product.isPopular,
        images: product.images,
        brand: { connect: { id: brandId } },
        category: { connect: { id: categoryId } },
        characteristics: {
          deleteMany: {},
          create: product.characteristics.map((characteristic) => ({
            name: characteristic.name,
            value: characteristic.value,
          })),
        },
      },
      create: {
        id: product.id,
        slug: product.slug,
        sku: product.sku,
        name: product.name,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        oldPrice: product.oldPrice,
        rating: product.rating,
        reviewCount: product.reviewCount,
        inStock: product.inStock,
        isNew: product.isNew,
        isPopular: product.isPopular,
        images: product.images,
        brand: { connect: { id: brandId } },
        category: { connect: { id: categoryId } },
        characteristics: {
          create: product.characteristics.map((characteristic) => ({
            name: characteristic.name,
            value: characteristic.value,
          })),
        },
      },
    });
  }
}

async function main() {
  const categoryIds = await seedCategories();
  const brandIds = await seedBrands();
  await seedProducts(categoryIds, brandIds);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
