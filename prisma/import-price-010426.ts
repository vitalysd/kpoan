import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";

loadEnv({ path: ".env.local" });

const prisma = new PrismaClient();

const EXCEL_PATH = "C:\\Users\\demas\\Desktop\\66D0~1\\010426~1.XLS";

interface ProductRow {
  name: string;
  sku: string;
  price: number;
  category: string;
  subCategory?: string;
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);
}

function parseExcel(): ProductRow[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets["TDSheet"];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  const products: ProductRow[] = [];
  let mainCategory = "";
  let subCategory = "";

  // Данные начинаются со строки 6
  for (let i = 6; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;

    const article = row[0]?.toString().trim();
    const brand = row[4]?.toString().trim();
    const name = row[14]?.toString().trim();
    const price = parseFloat(row[15]) || 0;

    if (!article) continue;

    // Определяем, это категория или товар
    const parts = article.split("/");

    if (parts.length <= 2 && !brand && price > 0 && name) {
      // Это категория (например "72" или "72/24")
      if (parts.length === 1) {
        mainCategory = name.replace(/,\s*$/, "").trim();
        subCategory = "";
      } else if (parts.length === 2) {
        subCategory = name.replace(/,\s*$/, "").trim();
      }
      continue;
    }

    // Это товар (article типа "72/24/2")
    if (brand && name && price > 0) {
      const cleanName = name.replace(/,\s*$/, "").trim();
      const sku = `ART-${article.replace(/\//g, "-")}`;

      products.push({
        name: cleanName,
        sku,
        price,
        category: mainCategory || "Инструмент",
        subCategory: subCategory || undefined,
      });
    }
  }

  return products;
}

async function getOrCreateCategory(name: string, description?: string): Promise<string> {
  const slug = createSlug(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return existing.id;

  const category = await prisma.category.create({
    data: { slug, name, description },
  });
  return category.id;
}

async function getOrCreateBrand(name: string): Promise<string> {
  const slug = createSlug(name);
  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) return existing.id;

  const brand = await prisma.brand.create({
    data: { slug, name },
  });
  return brand.id;
}

async function importProducts() {
  console.log("Парсинг Excel...");
  const products = parseExcel();
  console.log(`Всего товаров: ${products.length}`);

  // Кэш брендов и категорий
  const brandCache = new Map<string, string>();
  const categoryCache = new Map<string, string>();

  const existingBrands = await prisma.brand.findMany();
  existingBrands.forEach((b) => brandCache.set(b.slug, b.id));

  const existingCategories = await prisma.category.findMany();
  existingCategories.forEach((c) => categoryCache.set(c.slug, c.id));

  // Создаём категории
  const uniqueCategories = new Set(products.map((p) => p.category));
  for (const cat of uniqueCategories) {
    const catSlug = createSlug(cat);
    if (!categoryCache.has(catSlug)) {
      const catId = await getOrCreateCategory(cat);
      categoryCache.set(catSlug, catId);
      console.log(`✓ Категория: ${cat}`);
    }
  }

  // Предзагружаем существующие SKU
  const existingProducts = await prisma.product.findMany({ select: { sku: true } });
  const existingSkuSet = new Set(existingProducts.map((p) => p.sku));

  const productsToUpdate: ProductRow[] = [];
  const productsToCreate: ProductRow[] = [];

  for (const product of products) {
    if (existingSkuSet.has(product.sku)) {
      productsToUpdate.push(product);
    } else {
      productsToCreate.push(product);
    }
  }

  console.log(`\nНовых товаров: ${productsToCreate.length}`);
  console.log(`Товаров для обновления: ${productsToUpdate.length}`);

  const BATCH_SIZE = 200;
  let successCount = 0;

  // Обновление
  if (productsToUpdate.length > 0) {
    console.log("\nОбновление существующих товаров...");
    for (let i = 0; i < productsToUpdate.length; i += BATCH_SIZE) {
      const batch = productsToUpdate.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (product) => {
        const categoryId = categoryCache.get(createSlug(product.category))!;

        // Бренд
        const brandMatch = product.name.match(/(Вихрь|Makita|Bosch|Metabo|Интерскол)/i);
        let brandId = brandCache.get(createSlug("Вихрь"));
        if (!brandId) {
          brandId = await getOrCreateBrand("Вихрь");
          brandCache.set(createSlug("Вихрь"), brandId);
        }
        if (brandMatch) {
          const brandName = brandMatch[1];
          let bId = brandCache.get(createSlug(brandName));
          if (!bId) {
            bId = await getOrCreateBrand(brandName);
            brandCache.set(createSlug(brandName), bId);
          }
          brandId = bId;
        }

        return prisma.product.update({
          where: { sku: product.sku },
          data: {
            name: product.name,
            price: product.price,
            brandId,
            categoryId,
          },
        });
      });

      await Promise.all(promises);
      successCount += batch.length;
      console.log(`✓ Обновлено: ${successCount}/${productsToUpdate.length}`);
    }
  }

  // Создание
  if (productsToCreate.length > 0) {
    console.log("\nСоздание новых товаров...");
    for (let i = 0; i < productsToCreate.length; i += BATCH_SIZE) {
      const batch = productsToCreate.slice(i, i + BATCH_SIZE);
      const createData = batch.map((product) => {
        const categoryId = categoryCache.get(createSlug(product.category))!;
        const slug = `${createSlug(product.name).substring(0, 50)}-${product.sku}`;

        // Определяем бренд из названия
        const brandMatch = product.name.match(/(Вихрь|Makita|Bosch|Metabo|Интерскол)/i);
        let brandId = brandCache.get(createSlug("Вихрь"));
        if (brandMatch) {
          const brandName = brandMatch[1];
          let bId = brandCache.get(createSlug(brandName));
          if (!bId) {
            bId = brandCache.get(createSlug("Вихрь")); // fallback
          }
          brandId = bId;
        }

        return {
          slug,
          sku: product.sku,
          name: product.name,
          price: product.price,
          inStock: true,
          brandId: brandId || undefined,
          categoryId,
        };
      });

      await prisma.product.createMany({ data: createData, skipDuplicates: true });

      successCount += batch.length;
      console.log(`✓ Создано: ${successCount - (productsToUpdate.length > 0 ? productsToUpdate.length : 0)}/${productsToCreate.length}`);
    }
  }

  console.log(`\n=== Итоги импорта ===`);
  console.log(`✓ Обновлено: ${productsToUpdate.length}`);
  console.log(`✓ Создано: ${productsToCreate.length}`);
  console.log(`Всего обработано: ${products.length}`);
}

async function main() {
  console.log("Начинаем импорт прайса 01.04.26...\n");
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
