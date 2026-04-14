import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";

loadEnv({ path: ".env.local" });

const prisma = new PrismaClient();

const EXCEL_PATH = "C:\\Users\\demas\\Desktop\\66D0~1\\______~1.XLS";

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

function parsePrice(val: any): number {
  if (!val) return 0;
  const str = val.toString().trim().replace(/\s/g, "");
  return parseFloat(str) || 0;
}

function parseInstrument(): ProductRow[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets["Инструмент"];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  const products: ProductRow[] = [];

  // Строка 6: заголовки, строка 7+: данные
  // [4]=Модель, [5]=Описание, [6]=Цена, [1]=Группа, [2]=Подгруппа
  for (let i = 7; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[4] || !row[5]) continue;

    const model = row[4].toString().trim();
    const description = row[5].toString().trim();
    const price = parsePrice(row[6]);
    const group = row[1]?.toString().trim() || "Инструмент";
    const subgroup = row[2]?.toString().trim() || "";

    if (model && price > 0) {
      const name = `${model} — ${description}`;
      const sku = `MAKITA-${model}`;

      products.push({
        name,
        sku,
        price,
        category: group,
        subCategory: subgroup || undefined,
      });
    }
  }

  return products;
}

function parseAccessories(): ProductRow[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets["Аксессуары"];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  const products: ProductRow[] = [];

  // Строка 6: заголовки, строка 7+: данные
  // [0]=Артикул, [1]=Категория, [2]=Подкатегория, [3]=Наименование, [4]=Цена
  for (let i = 7; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0] || !row[3]) continue;

    const sku = row[0].toString().trim();
    const category = row[1]?.toString().trim() || "Аксессуары";
    const subCategory = row[2]?.toString().trim() || "";
    const name = row[3].toString().trim();
    const price = parsePrice(row[4]);

    if (sku && name && price > 0) {
      products.push({
        name,
        sku: `MAKITA-${sku}`,
        price,
        category,
        subCategory: subCategory || undefined,
      });
    }
  }

  return products;
}

function parseSpareParts(): ProductRow[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets["Зап части"];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  const products: ProductRow[] = [];

  // Строка 6: заголовки, строка 7+: данные
  // [0]=Артикул, [1]=Наименование, [2]=Цена
  for (let i = 7; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[0] || !row[1]) continue;

    const sku = row[0].toString().trim();
    const name = row[1].toString().trim();
    const price = parsePrice(row[2]);

    if (sku && name && price > 0) {
      products.push({
        name,
        sku: `MAKITA-PART-${sku}`,
        price,
        category: "Запчасти",
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
  console.log("Парсинг Excel...\n");

  console.log("1. Инструмент...");
  const instrument = parseInstrument();
  console.log(`   Найдено: ${instrument.length}`);

  console.log("2. Аксессуары...");
  const accessories = parseAccessories();
  console.log(`   Найдено: ${accessories.length}`);

  console.log("3. Запчасти...");
  const spareParts = parseSpareParts();
  console.log(`   Найдено: ${spareParts.length}`);

  const allProducts = [...instrument, ...accessories, ...spareParts];
  console.log(`\nВсего товаров: ${allProducts.length}`);

  // Бренд Makita
  let brandId = await getOrCreateBrand("Makita");
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

  // Создаём категории
  const uniqueCategories = new Set(allProducts.map((p) => p.category));
  for (const cat of uniqueCategories) {
    const catSlug = createSlug(cat);
    if (!categoryCache.has(catSlug)) {
      const catId = await getOrCreateCategory(cat);
      categoryCache.set(catSlug, catId);
      console.log(`✓ Категория: ${cat}`);
    }
  }

  // Разделяем на новые и для обновления
  for (const product of allProducts) {
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
      const created = successCount - (productsToUpdate.length > 0 ? productsToUpdate.length : 0);
      console.log(`✓ Создано: ${created}/${productsToCreate.length}`);
    }
  }

  console.log(`\n=== Итоги импорта ===`);
  console.log(`✓ Обновлено: ${productsToUpdate.length}`);
  console.log(`✓ Создано: ${productsToCreate.length}`);
  console.log(`Всего обработано: ${allProducts.length}`);
}

async function main() {
  console.log("Начинаем импорт Makita...\n");
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
