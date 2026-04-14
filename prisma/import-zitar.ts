import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";

loadEnv({ path: ".env.local" });

const prisma = new PrismaClient();

const EXCEL_PATH = "C:\\Users\\demas\\Desktop\\66D0~1\\______~2.XLS";

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
  let mainCategory = "МЕТИЗЫ";
  let subCategory = "";

  for (let i = 15; i < data.length; i++) {
    const row = data[i];
    if (!row) continue;

    const hasCode = row[0] && row[0].toString().trim();
    const hasArticle = row[4] && row[4].toString().trim();
    const hasPrice = row[8] && !isNaN(parseFloat(row[8]));
    const hasName = row[5] && row[5].toString().trim();

    // Категория: есть код, но нет артикула, цены и названия
    if (hasCode && !hasArticle && !hasPrice && !hasName) {
      const catName = row[0].toString().trim();
      // Определяем уровень категории по длине названия
      if (catName.length <= 15 && !catName.includes("ГОСТ") && !catName.includes("DIN")) {
        mainCategory = catName;
        subCategory = "";
      } else if (catName.includes("ГОСТ") || catName.includes("DIN") || catName.includes("к.п.")) {
        subCategory = catName;
      }
      continue;
    }

    // Товар: есть артикул и цена
    if (hasArticle && hasPrice) {
      const name = row[5].toString().trim();
      const sku = row[4].toString().trim();
      const price = parseFloat(row[8]) || 0;

      if (name && sku && price > 0) {
        products.push({
          name,
          sku,
          price,
          category: mainCategory,
          subCategory: subCategory || undefined,
        });
      }
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

  // Бренд ЮЖУРАЛ-ЗИТАР
  let brandId = await getOrCreateBrand("ЮЖУРАЛ-ЗИТАР");
  console.log(`Бренд ID: ${brandId}`);

  // Кэш категорий
  const categoryCache = new Map<string, string>();
  const existingCategories = await prisma.category.findMany();
  existingCategories.forEach((c) => categoryCache.set(c.slug, c.id));

  // Предзагружаем существующие SKU
  const existingProducts = await prisma.product.findMany({ select: { sku: true } });
  const existingSkuSet = new Set(existingProducts.map((p) => p.sku));

  const productsToUpdate: ProductRow[] = [];
  const productsToCreate: ProductRow[] = [];

  // Группируем товары по категории для batch-создания категорий
  const categoryMap = new Map<string, ProductRow[]>();
  for (const product of products) {
    const catSlug = createSlug(product.category);
    if (!categoryMap.has(catSlug)) {
      categoryMap.set(catSlug, []);
    }
    categoryMap.get(catSlug)!.push(product);
  }

  // Создаём категории
  for (const [catSlug, catProducts] of categoryMap) {
    if (!categoryCache.has(catSlug)) {
      const catId = await getOrCreateCategory(catProducts[0].category);
      categoryCache.set(catSlug, catId);
      console.log(`✓ Категория: ${catProducts[0].category}`);
    }
  }

  // Разделяем на новые и для обновления
  for (const product of products) {
    if (existingSkuSet.has(product.sku)) {
      productsToUpdate.push(product);
    } else {
      productsToCreate.push(product);
    }
  }

  console.log(`\nНовых товаров: ${productsToCreate.length}`);
  console.log(`Товаров для обновления: ${productsToUpdate.length}`);

  const BATCH_SIZE = 100;
  let successCount = 0;

  // Обновление
  if (productsToUpdate.length > 0) {
    console.log("\nОбновление существующих товаров...");
    for (let i = 0; i < productsToUpdate.length; i += BATCH_SIZE) {
      const batch = productsToUpdate.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (product) => {
        const categoryId = categoryCache.get(createSlug(product.category))!;
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

        return {
          slug,
          sku: product.sku,
          name: product.name,
          price: product.price,
          inStock: true,
          brandId,
          categoryId,
        };
      });

      await prisma.product.createMany({ data: createData, skipDuplicates: true });

      successCount += batch.length;
      console.log(`✓ Создано: ${successCount - productsToUpdate.length}/${productsToCreate.length}`);
    }
  }

  console.log(`\n=== Итоги импорта ===`);
  console.log(`✓ Обновлено: ${productsToUpdate.length}`);
  console.log(`✓ Создано: ${productsToCreate.length}`);
  console.log(`Всего обработано: ${products.length}`);
}

async function main() {
  console.log("Начинаем импорт метизов ЮЖУРАЛ-ЗИТАР...");
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
