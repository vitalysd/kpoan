import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";
import { createHash } from "crypto";

// Загружаем переменные окружения из .env.local
loadEnv({ path: ".env.local" });

const prisma = new PrismaClient();

// Путь к Excel файлу (по умолчанию)
let EXCEL_PATH = "C:/Users/demas/Desktop/прайсы/ptk-pricelist-08-04-2026.xlsx";

// Проверяем аргументы командной строки
if (process.argv[2]) {
  EXCEL_PATH = process.argv[2];
}

// Типы категорий
type CategoryLevel = "main" | "sub";

interface ProductRow {
  name: string;
  sku: string;
  price: number;
  oldPrice?: number;
  category: string;
  subCategory?: string;
}

interface CategoryHierarchy {
  name: string;
  level: CategoryLevel;
  rowIndex: number;
}

/**
 * Создаём slug из названия
 */
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);
}

/**
 * Создаём уникальный ID из строки
 */
function createId(name: string): string {
  return createHash("md5").update(name).digest("hex").substring(0, 8);
}

/**
 * Парсим Excel файл и возвращаем категории и товары
 */
function parseExcel(): {
  categories: CategoryHierarchy[];
  products: ProductRow[];
} {
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets["Worksheet"];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  const categories: CategoryHierarchy[] = [];
  const products: ProductRow[] = [];

  let currentCategory: string | null = null;
  let currentSubCategory: string | null = null;

  // Пропускаем первые 2 строки (заголовок и инфо)
  for (let i = 2; i < data.length; i++) {
    const row = data[i];

    // Проверяем, является ли строка категорией
    // Категория: есть значение в первой колонке, нет во второй (Артикул)
    if (row[0] && (!row[1] || row[1] === null || row[1] === undefined)) {
      const categoryName = row[0].toString().trim();
      if (categoryName) {
        // Определяем уровень категории
        // Главная категория обычно короткая и без отступов
        const isMainCategory = !row[0].toString().startsWith("     ");

        categories.push({
          name: categoryName,
          level: isMainCategory ? "main" : "sub",
          rowIndex: i,
        });

        if (isMainCategory) {
          currentCategory = categoryName;
          currentSubCategory = null;
        } else {
          currentSubCategory = categoryName;
        }
      }
      continue;
    }

    // Проверяем, является ли строка товаром
    // Товар: есть Название (колонка 0) и Артикул (колонка 1)
    if (row[0] && row[1]) {
      const name = row[0].toString().trim();
      const sku = row[1].toString().trim();
      const price = parseFloat(row[2]) || 0; // РРЦ с НДС
      const oldPrice = row[5] ? parseFloat(row[5]) : undefined; // Цена товаров по акции

      if (name && sku && price > 0 && currentCategory) {
        products.push({
          name,
          sku,
          price,
          oldPrice,
          category: currentCategory,
          subCategory: currentSubCategory || undefined,
        });
      }
    }
  }

  return { categories, products };
}

/**
 * Создаём или находим категорию
 */
async function getOrCreateCategory(
  name: string,
  description?: string,
): Promise<string> {
  const slug = createSlug(name);

  const existing = await prisma.category.findUnique({
    where: { slug },
  });

  if (existing) {
    return existing.id;
  }

  const category = await prisma.category.create({
    data: {
      slug,
      name,
      description,
    },
  });

  return category.id;
}

/**
 * Создаём или находим бренд (для ПТК используем "ПТК")
 */
async function getOrCreateBrand(name: string): Promise<string> {
  // Определяем бренд из названия товара
  let brandName = "ПТК";
  if (name.includes("RILON")) {
    brandName = "RILON";
  } else if (name.includes("ПРОФИ")) {
    brandName = "ПРОФИ";
  } else if (name.includes("МАСТЕР")) {
    brandName = "МАСТЕР";
  }

  const slug = createSlug(brandName);

  const existing = await prisma.brand.findUnique({
    where: { slug },
  });

  if (existing) {
    return existing.id;
  }

  const brand = await prisma.brand.create({
    data: {
      slug,
      name: brandName,
    },
  });

  return brand.id;
}

/**
 * Импортируем товары в базу
 */
async function importProducts() {
  const { categories, products } = parseExcel();

  console.log(`Найдено категорий: ${categories.length}`);
  console.log(`Найдено товаров: ${products.length}`);

  // Создаём кэш категорий
  const categoryCache = new Map<string, string>();
  const subCategoryCache = new Map<string, string>();

  // Создаём главные категории
  const mainCategories = categories.filter((c) => c.level === "main");
  for (const cat of mainCategories) {
    const id = await getOrCreateCategory(cat.name);
    categoryCache.set(cat.name, id);
    console.log(`✓ Категория: ${cat.name}`);
  }

  // Создаём подкатегории
  const subCategories = categories.filter((c) => c.level === "sub");
  for (const cat of subCategories) {
    // Подкатегория привязывается к последней главной категории
    const parentId = Array.from(categoryCache.entries()).pop()?.[1];
    if (!parentId) continue;

    const id = await getOrCreateCategory(cat.name);
    subCategoryCache.set(cat.name, id);
  }

  // Кэш брендов
  const brandCache = new Map<string, string>();

  // Предзагружаем все бренды
  const brands = await prisma.brand.findMany();
  brands.forEach((b) => brandCache.set(b.name, b.id));

  // Предварительно загружаем все существующие SKU
  const existingProducts = await prisma.product.findMany({
    select: { sku: true, id: true },
  });
  const existingSkuMap = new Map<string, string>();
  existingProducts.forEach((p) => existingSkuMap.set(p.sku, p.id));

  console.log(`\nСуществующих товаров: ${existingProducts.length}`);
  console.log(`Загружено брендов: ${brandCache.size}`);

  // Разделяем товары на новые и для обновления
  const productsToUpdate: ProductRow[] = [];
  const productsToCreate: ProductRow[] = [];

  for (const product of products) {
    const categoryId =
      subCategoryCache.get(product.subCategory || "") ||
      categoryCache.get(product.category);

    if (!categoryId) {
      console.warn(`⚠ Пропущено: ${product.name} (нет категории)`);
      continue;
    }

    // Определяем бренд
    let brandName = "ПТК";
    if (product.name.includes("RILON")) brandName = "RILON";
    else if (product.name.includes("ПРОФИ")) brandName = "ПРОФИ";
    else if (product.name.includes("МАСТЕР")) brandName = "МАСТЕР";

    if (!brandCache.has(brandName)) {
      const brandId = await getOrCreateBrand(brandName);
      brandCache.set(brandName, brandId);
    }

    if (existingSkuMap.has(product.sku)) {
      productsToUpdate.push(product);
    } else {
      productsToCreate.push(product);
    }
  }

  console.log(`Новых товаров: ${productsToCreate.length}`);
  console.log(`Товаров для обновления: ${productsToUpdate.length}`);

  // Пакетное обновление существующих товаров
  let successCount = 0;
  let errorCount = 0;
  const BATCH_SIZE = 100;

  console.log("\nОбновление существующих товаров...");
  for (let i = 0; i < productsToUpdate.length; i += BATCH_SIZE) {
    const batch = productsToUpdate.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (product) => {
      const categoryId =
        subCategoryCache.get(product.subCategory || "") ||
        categoryCache.get(product.category);

      let brandName = "ПТК";
      if (product.name.includes("RILON")) brandName = "RILON";
      else if (product.name.includes("ПРОФИ")) brandName = "ПРОФИ";
      else if (product.name.includes("МАСТЕР")) brandName = "МАСТЕР";

      const brandId = brandCache.get(brandName)!;
      const cleanName = product.name.replace(/\s+/g, " ").trim();

      return prisma.product.update({
        where: { sku: product.sku },
        data: {
          name: cleanName,
          price: product.price,
          oldPrice: product.oldPrice || null,
          brandId,
          categoryId,
        },
      });
    });

    await Promise.all(promises);
    successCount += batch.length;
    console.log(`✓ Обновлено: ${successCount}/${productsToUpdate.length}`);
  }

  // Пакетное создание новых товаров
  console.log("\nСоздание новых товаров...");
  for (let i = 0; i < productsToCreate.length; i += BATCH_SIZE) {
    const batch = productsToCreate.slice(i, i + BATCH_SIZE);
    const createData = batch.map((product) => {
      const categoryId =
        subCategoryCache.get(product.subCategory || "") ||
        categoryCache.get(product.category);

      let brandName = "ПТК";
      if (product.name.includes("RILON")) brandName = "RILON";
      else if (product.name.includes("ПРОФИ")) brandName = "ПРОФИ";
      else if (product.name.includes("МАСТЕР")) brandName = "МАСТЕР";

      const brandId = brandCache.get(brandName)!;
      const cleanName = product.name.replace(/\s+/g, " ").trim();
      const slug = `${createSlug(product.name)}-${product.sku}`;

      return {
        slug,
        sku: product.sku,
        name: cleanName,
        price: product.price,
        oldPrice: product.oldPrice || null,
        inStock: true,
        brandId,
        categoryId,
      };
    });

    await prisma.product.createMany({
      data: createData,
      skipDuplicates: true,
    });

    successCount += batch.length;
    console.log(`✓ Создано: ${successCount - productsToUpdate.length}/${productsToCreate.length}`);
  }

  console.log(`\n=== Итоги импорта ===`);
  console.log(`✓ Обновлено: ${productsToUpdate.length}`);
  console.log(`✓ Создано: ${productsToCreate.length}`);
  console.log(`Всего обработано: ${products.length}`);
}

async function main() {
  console.log("Начинаем импорт товаров из Excel...");
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
