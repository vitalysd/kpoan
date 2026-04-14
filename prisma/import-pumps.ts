import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";

loadEnv({ path: ".env.local" });

const prisma = new PrismaClient();

const EXCEL_PATH = "C:\\Users\\demas\\Desktop\\66D0~1\\010120~1.XLS";

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

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  const str = priceStr.toString().trim();
  if (str.toLowerCase().includes("договор")) return 0;
  // Формат: "74 895-80" -> 74895.80
  const cleaned = str.replace(/\s/g, "").replace(/-/g, ".");
  return parseFloat(cleaned) || 0;
}

function parseExcel(): ProductRow[] {
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets["РФ"];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

  const products: ProductRow[] = [];
  let currentCategory = "Насосы";
  let currentSubCategory = "";

  // Структура:
  // Строка 6: "Центробежные насосы" - главная категория
  // Строка 7, 35, 42, 56, 66, 74, 82: подкатегории ("1. Для светлых...", "2. Для воды...")
  // Строка 8, 46, 57, 67, 75, 83: заголовки (пропускаем)
  // Строка 9+: данные

  for (let i = 6; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0 || !row[0]) continue;

    const firstCell = row[0].toString().trim();

    // Определяем, это категория/подкатегория или товар
    // Подкатегории начинаются с цифры и точки: "1. Для...", "2. Для..."
    if (/^\d+\.\s/.test(firstCell)) {
      currentSubCategory = firstCell;
      continue;
    }

    // Главная категория
    if (firstCell === "Центробежные насосы") {
      currentCategory = firstCell;
      continue;
    }

    // Заголовки таблиц (пропускаем)
    if (firstCell === "Марка насоса" || firstCell === "Марка нагнетателя") {
      continue;
    }

    // Пропускаем примечания и контактную информацию
    if (
      firstCell.startsWith("**") ||
      firstCell.startsWith("Примечание") ||
      firstCell.startsWith("1.") ||
      firstCell.startsWith("2.") ||
      firstCell.startsWith("3.") ||
      firstCell.startsWith("4.") ||
      firstCell.startsWith("КМ ") ||
      firstCell.startsWith("Прайс-лист") ||
      firstCell.startsWith("Для приобретения") ||
      firstCell.startsWith("Адрес:") ||
      firstCell.startsWith("Менеджер") ||
      firstCell.startsWith("тел") ||
      firstCell.startsWith("e-mail")
    ) {
      continue;
    }

    // Это товар
    // Колонки: [0]=Марка, [1]=Подача, [2]=Напор, [3]=Материал, [4]=Мощность, [5]=Напряжение, [6]=Габариты, [7]=Масса, [8]=КПД, [9]=Цена
    const price = parsePrice(row[9]);
    if (price > 0) {
      const name = firstCell.replace(/\s+/g, " ").trim();
      // SKU из названия (убираем лишнее)
      const sku = `ADONIS-${name.substring(0, 30).replace(/[^\w]/g, "").toUpperCase()}`;

      products.push({
        name,
        sku,
        price,
        category: currentCategory,
        subCategory: currentSubCategory || undefined,
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
  const products = parseExcel();
  console.log(`\nВсего товаров: ${products.length}`);

  // Бренд АД ОНИС
  let brandId = await getOrCreateBrand("АД ОНИС");
  console.log(`Бренд АД ОНИС ID: ${brandId}`);

  // Категории
  const categoryCache = new Map<string, string>();
  const subCategoryCache = new Map<string, string>();

  // Главная категория
  const mainCatId = await getOrCreateCategory("Насосы", "Промышленные насосы и оборудование");
  categoryCache.set(createSlug("Насосы"), mainCatId);

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

    const categoryId = categoryCache.get(catSlug)!;

    if (existingSkuSet.has(product.sku)) {
      productsToUpdate.push(product);
    } else {
      productsToCreate.push({ ...product, category: categoryId });
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
        const slug = `${createSlug(product.name).substring(0, 50)}-${product.sku}`;

        return {
          slug,
          sku: product.sku,
          name: product.name,
          price: product.price,
          inStock: true,
          brandId,
          categoryId: product.category as any,
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
  console.log("Начинаем импорт насосов АД ОНИС...");
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
