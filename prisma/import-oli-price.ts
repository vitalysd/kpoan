import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";

loadEnv({ path: ".env.local" });

const prisma = new PrismaClient();

const EXCEL_PATH = "C:\\Users\\demas\\Desktop\\66D0~1\\01-01-~1.XLS";

interface ProductRow {
  name: string;
  sku: string;
  price: number;
  oldPrice?: number;
  category: string;
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);
}

function createSkuHash(name: string): string {
  const hash = require("crypto").createHash("md5").update(name).digest("hex").substring(0, 8).toUpperCase();
  return `OLI-${hash}`;
}

function parseExcel(): ProductRow[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const products: ProductRow[] = [];

  console.log(`Листов в файле: ${wb.SheetNames.length}`);

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
    let sheetProducts = 0;

    if (sheetName === "Мех-кие вибраторы") {
      // Формат: [0]=Фото, [1]=Наименование, [2]=Артикул, [3]=Дилер, [4]=Розница, [5]=Комментарии
      for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[1] || !row[2]) continue;

        const name = row[1].toString().trim();
        const sku = row[2].toString().trim();
        const dealerPrice = parseFloat(row[3]) || 0;
        const retailPrice = parseFloat(row[4]) || 0;
        const price = dealerPrice > 0 ? dealerPrice : retailPrice;

        if (name && sku && price > 0) {
          products.push({ name, sku, price, category: sheetName });
          sheetProducts++;
        }
      }
    } else if (sheetName === "Высокочастот. VHN-EWO-MVE") {
      // Формат: [1]=Наименование, [7]=Дилер, [8]=МРЦ, [9]=РРЦ, [10]=Акция
      for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[1]) continue;

        const name = row[1].toString().trim();
        const actionPrice = parseFloat(row[10]) || 0;
        const mrcPrice = parseFloat(row[8]) || 0;
        const price = actionPrice > 0 ? actionPrice : mrcPrice;
        const oldPrice = (actionPrice > 0 && mrcPrice > actionPrice) ? mrcPrice : undefined;
        const sku = name.replace(/\s+/g, "-").substring(0, 50);

        if (name && price > 0) {
          products.push({ name, sku, price, oldPrice, category: sheetName });
          sheetProducts++;
        }
      }
    } else if (sheetName === "Площ. вибраторы") {
      // Формат: [1]=Модель, [2]=Цена
      for (let i = 3; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[1]) continue;
        if (row[1].toString().startsWith("серия")) continue; // Пропускаем заголовки серий

        const name = row[1].toString().trim();
        const price = parseFloat(row[2]) || 0;
        const sku = createSkuHash(name);

        if (name && price > 0) {
          products.push({ name, sku, price, category: sheetName });
          sheetProducts++;
        }
      }
    } else if (sheetName === "Электрон. преоб. частоты") {
      // Формат: данные начинаются со строки 7, [1]=Наименование, [3]=Цена
      for (let i = 7; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[1]) continue;

        const name = row[1].toString().trim();
        const price = parseFloat(row[3]) || 0;
        const sku = name.replace(/\s+/g, "-").substring(0, 50);

        if (name && price > 0) {
          products.push({ name, sku, price, category: sheetName });
          sheetProducts++;
        }
      }
    } else if (sheetName === "Преобраз. частоты") {
      // Формат: [1]=Наименование (CMM11), [6]=Дилер, [7]=РРЦ, [9]=Акция
      for (let i = 3; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[1]) continue;
        if (row[1].toString().startsWith("СМ")) continue; // Пропускаем заголовки

        const name = row[1].toString().trim();
        const actionPrice = parseFloat(row[9]) || 0;
        const dealerPrice = parseFloat(row[6]) || 0;
        const price = actionPrice > 0 ? actionPrice : dealerPrice;
        const sku = name.replace(/\s+/g, "-").substring(0, 50);

        if (name && price > 0) {
          products.push({ name, sku, price, category: sheetName });
          sheetProducts++;
        }
      }
    }

    console.log(`Лист "${sheetName}": ${sheetProducts} товаров`);
  }

  return products;
}

async function getOrCreateCategory(name: string): Promise<string> {
  const slug = createSlug(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return existing.id;

  const category = await prisma.category.create({ data: { slug, name } });
  return category.id;
}

async function getOrCreateBrand(name: string): Promise<string> {
  const slug = createSlug(name);
  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) return existing.id;

  const brand = await prisma.brand.create({ data: { slug, name } });
  return brand.id;
}

async function importProducts() {
  const products = parseExcel();
  console.log(`\nВсего товаров: ${products.length}`);

  // Бренд OLI
  let brandId = await getOrCreateBrand("OLI");
  console.log(`Бренд OLI ID: ${brandId}`);

  // Кэш категорий
  const categoryCache = new Map<string, string>();
  const categories = await prisma.category.findMany();
  categories.forEach((c) => categoryCache.set(c.slug, c.id));

  // Предзагружаем существующие SKU
  const existingProducts = await prisma.product.findMany({ select: { sku: true } });
  const existingSkuSet = new Set(existingProducts.map((p) => p.sku));

  const productsToUpdate: ProductRow[] = [];
  const productsToCreate: ProductRow[] = [];

  for (const product of products) {
    const catSlug = createSlug(product.category);
    if (!categoryCache.has(catSlug)) {
      const catId = await getOrCreateCategory(product.category);
      categoryCache.set(catSlug, catId);
    }

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
          oldPrice: product.oldPrice || null,
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
  console.log("Начинаем импорт товаров из OLI Excel (01-01-2026)...");
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
