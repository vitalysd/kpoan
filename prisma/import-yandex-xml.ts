import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { createInterface } from "readline";

loadEnv({ path: ".env.local" });

const prisma = new PrismaClient();

const XML_PATH = "C:\\Users\\demas\\Desktop\\66D0~1\\YANDEX~1.XML";

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);
}

interface CategoryData {
  id: string;
  name: string;
  parentId?: string;
}

interface OfferData {
  id: string;
  name: string;
  price: number;
  vendorCode?: string;
  categoryId: string;
  images: string[];
  inStock: boolean;
}

async function importProducts() {
  console.log("Чтение XML файла...");
  const content = fs.readFileSync(XML_PATH, "utf-8");

  // Парсим категории
  const categories: CategoryData[] = [];
  const catRegex = /<category\s+id="(\d+)"(?:\s+parentId="(\d+)")?\s*>([^<]+)<\/category>/g;
  let match;
  while ((match = catRegex.exec(content)) !== null) {
    categories.push({
      id: match[1],
      name: match[3].trim(),
      parentId: match[2] || undefined,
    });
  }

  console.log(`Категорий: ${categories.length}`);

  // Парсим товары
  const offers: OfferData[] = [];
  const offerRegex = /<offer\s+id="(\d+)"[^>]*>([\s\S]*?)<\/offer>/g;
  let offerMatch;

  while ((offerMatch = offerRegex.exec(content)) !== null) {
    const offerId = offerMatch[1];
    const offerBody = offerMatch[2];

    const nameMatch = /<name>([^<]+)<\/name>/.exec(offerBody);
    const priceMatch = /<price>([^<]+)<\/price>/.exec(offerBody);
    const vendorCodeMatch = /<vendorCode>([^<]+)<\/vendorCode>/.exec(offerBody);
    const categoryIdMatch = /<categoryId>([^<]+)<\/categoryId>/.exec(offerBody);
    const countMatch = /<count>([^<]+)<\/count>/.exec(offerBody);

    if (!nameMatch || !priceMatch) continue;

    const name = nameMatch[1].trim();
    const price = parseFloat(priceMatch[1]);
    const vendorCode = vendorCodeMatch?.[1]?.trim();
    const categoryId = categoryIdMatch?.[1] || "";
    const count = parseInt(countMatch?.[1] || "0") || 0;

    // Картинки
    const images: string[] = [];
    const picRegex = /<picture>([^<]+)<\/picture>/g;
    let picMatch;
    while ((picMatch = picRegex.exec(offerBody)) !== null) {
      images.push(picMatch[1].trim());
    }

    if (name && price > 0) {
      offers.push({
        id: offerId,
        name,
        price,
        vendorCode,
        categoryId,
        images,
        inStock: count > 0,
      });
    }
  }

  console.log(`Товаров: ${offers.length}`);

  // Создаём карту категорий XML ID -> Prisma ID
  const categoryMap = new Map<string, string>();
  const existingCategories = await prisma.category.findMany();
  const existingCategorySlugs = new Map<string, string>();
  existingCategories.forEach((c) => existingCategorySlugs.set(c.slug, c.id));

  // Создаём категории
  console.log("\nСоздание категорий...");
  let createdCats = 0;
  for (const cat of categories) {
    const slug = createSlug(cat.name);

    if (existingCategorySlugs.has(slug)) {
      categoryMap.set(cat.id, existingCategorySlugs.get(slug)!);
      continue;
    }

    const parentId = cat.parentId ? categoryMap.get(cat.parentId) : undefined;

    try {
      const newCategory = await prisma.category.create({
        data: {
          slug,
          name: cat.name,
          parentId: parentId || null,
        },
      });

      categoryMap.set(cat.id, newCategory.id);
      existingCategorySlugs.set(slug, newCategory.id);
      createdCats++;
    } catch (e: any) {
      // Если категория уже существует (slug конфликт)
      if (e.code === "P2002") {
        const existing = await prisma.category.findUnique({ where: { slug } });
        if (existing) {
          categoryMap.set(cat.id, existing.id);
          existingCategorySlugs.set(slug, existing.id);
        }
      } else {
        console.error(`Ошибка создания категории ${cat.name}:`, e.message);
      }
    }
  }

  console.log(`Создано категорий: ${createdCats}`);

  // Предзагружаем существующие SKU
  const existingProducts = await prisma.product.findMany({ select: { sku: true } });
  const existingSkuSet = new Set(existingProducts.map((p) => p.sku));

  // Бренд АнтиТок
  let brandId: string;
  const existingBrand = await prisma.brand.findUnique({ where: { slug: createSlug("АнтиТок") } });
  if (existingBrand) {
    brandId = existingBrand.id;
  } else {
    const newBrand = await prisma.brand.create({
      data: { slug: createSlug("АнтиТок"), name: "АнтиТок" },
    });
    brandId = newBrand.id;
  }

  console.log(`Бренд АнтиТок ID: ${brandId}`);

  // Разделяем на новые и для обновления
  const productsToUpdate = offers.filter((p) => {
    const sku = p.vendorCode ? `ANTITOK-${p.vendorCode}` : `ANTITOK-${p.id}`;
    return existingSkuSet.has(sku);
  });

  const productsToCreate = offers.filter((p) => {
    const sku = p.vendorCode ? `ANTITOK-${p.vendorCode}` : `ANTITOK-${p.id}`;
    return !existingSkuSet.has(sku);
  });

  console.log(`\nНовых товаров: ${productsToCreate.length}`);
  console.log(`Товаров для обновления: ${productsToUpdate.length}`);

  const BATCH_SIZE = 200;

  // Обновление
  if (productsToUpdate.length > 0) {
    console.log("\nОбновление существующих товаров...");
    let successCount = 0;
    for (let i = 0; i < productsToUpdate.length; i += BATCH_SIZE) {
      const batch = productsToUpdate.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (product) => {
        const sku = product.vendorCode ? `ANTITOK-${product.vendorCode}` : `ANTITOK-${product.id}`;
        const prismaCategoryId = product.categoryId ? categoryMap.get(product.categoryId) : undefined;

        return prisma.product.update({
          where: { sku },
          data: {
            name: product.name,
            price: product.price,
            images: product.images.length > 0 ? product.images : undefined,
            inStock: product.inStock,
            categoryId: prismaCategoryId || undefined,
            brandId,
          },
        });
      });

      await Promise.allSettled(promises);
      successCount += batch.length;
      console.log(`✓ Обновлено: ${successCount}/${productsToUpdate.length}`);
    }
  }

  // Создание
  if (productsToCreate.length > 0) {
    console.log("\nСоздание новых товаров...");
    let successCount = 0;
    for (let i = 0; i < productsToCreate.length; i += BATCH_SIZE) {
      const batch = productsToCreate.slice(i, i + BATCH_SIZE);
      const createData = batch.map((product) => {
        const sku = product.vendorCode ? `ANTITOK-${product.vendorCode}` : `ANTITOK-${product.id}`;
        const prismaCategoryId = product.categoryId ? categoryMap.get(product.categoryId) : undefined;
        const slug = `${createSlug(product.name).substring(0, 50)}-${sku}`;

        return {
          slug,
          sku,
          name: product.name,
          price: product.price,
          images: product.images.length > 0 ? product.images : undefined,
          inStock: product.inStock,
          brandId,
          categoryId: prismaCategoryId || undefined,
        };
      });

      await prisma.product.createMany({ data: createData, skipDuplicates: true });

      successCount += batch.length;
      console.log(`✓ Создано: ${successCount}/${productsToCreate.length}`);
    }
  }

  console.log(`\n=== Итоги импорта ===`);
  console.log(`✓ Обновлено: ${productsToUpdate.length}`);
  console.log(`✓ Создано: ${productsToCreate.length}`);
  console.log(`Всего обработано: ${offers.length}`);
}

async function main() {
  console.log("Начинаем импорт Yandex Market XML (АнтиТок)...\n");
  await importProducts();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\nИмпорт завершён!");
  })
  .catch(async (error) => {
    console.error("Ошибка импорта:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
