import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import fs from "fs";

loadEnv({ path: ".env.local" });

const prisma = new PrismaClient();

const FILES = [
  { path: "C:\\Users\\demas\\Desktop\\66D0~1\\-1871B~1.DOC", name: "пневмоинструмент" },
  { path: "C:\\Users\\demas\\Desktop\\66D0~1\\-24882~1.DOC", name: "запчасти" },
  { path: "C:\\Users\\demas\\Desktop\\66D0~1\\-3CBCB~1.DOC", name: "вибраторы" },
  { path: "C:\\Users\\demas\\Desktop\\66D0~1\\-4AD1A~1.DOC", name: "вращательный" },
];

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);
}

function sanitizeText(text: string): string {
  return text
    .replace(/[\uD800-\uDFFF]/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/[\u{10000}-\u{10FFFF}]/gu, "")
    .trim();
}

function extractTextFromDoc(buffer: Buffer): string {
  let text = "";
  let currentWord = "";
  
  for (let i = 512; i < buffer.length - 1; i += 2) {
    const charCode = buffer.readUInt16LE(i);
    
    if (charCode === 0) continue;
    if (charCode === 13 || charCode === 10) {
      if (currentWord.length > 1) text += currentWord + "\n";
      currentWord = "";
      continue;
    }
    if (charCode === 7) {
      if (currentWord.length > 1) text += currentWord + "\n";
      currentWord = "";
      continue;
    }
    if (charCode === 32) {
      currentWord += " ";
      continue;
    }
    // Только ASCII и базовые символы
    if (charCode >= 32 && charCode <= 0x04FF) {
      currentWord += String.fromCharCode(charCode);
    }
  }
  
  if (currentWord.length > 1) text += currentWord;
  return text;
}

function isCleanText(text: string): boolean {
  const badChars = /[䬀倀儀愀瀀琀开伀ෲ෴฼฾຺ຸퟤퟤ]/;
  if (badChars.test(text)) return false;
  const cleaned = sanitizeText(text);
  if (cleaned.length < 5) return false;
  if (/^(Heading|Normal|Table|CompObj|Summary)/i.test(cleaned)) return false;
  return true;
}

function isCategoryLine(text: string): boolean {
  return (
    (/Раздел\s+\d+\.\d+/i.test(text)) ||
    (/Запасные части к отбойным/i.test(text)) ||
    (/- Вибраторы/i.test(text)) ||
    (/Вибраторы глубинные/i.test(text))
  );
}

function parseDocProducts(buffer: Buffer): { category: string; products: string[] }[] {
  const rawText = extractTextFromDoc(buffer);
  const text = sanitizeText(rawText);
  
  const lines = text.split("\n")
    .map(l => l.replace(/\s+/g, " ").trim())
    .filter(l => isCleanText(l));

  const uniqueLines: string[] = [];
  let prev = "";
  for (const line of lines) {
    if (line !== prev) {
      uniqueLines.push(line);
      prev = line;
    }
  }

  const sections: { category: string; products: string[] }[] = [];
  let currentSection: { category: string; products: string[] } | null = null;
  let inHeader = true;

  for (const line of uniqueLines) {
    if (line === "Наименование товара, его характеристики") {
      inHeader = false;
      continue;
    }
    if (line === "Запасные части к отбойным молоткам МО-1Б,МО-2Б,МО-3Б,МО-4Б, МОП-2,3,4") {
      continue;
    }

    if (isCategoryLine(line)) {
      // Очищаем имя категории от мусора
      const cleanCategory = sanitizeText(line);
      if (currentSection && currentSection.products.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { category: cleanCategory, products: [] };
      inHeader = false;
      continue;
    }

    if (currentSection && !inHeader) {
      currentSection.products.push(sanitizeText(line));
    }
  }

  if (currentSection && currentSection.products.length > 0) {
    sections.push(currentSection);
  }

  return sections;
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

function createHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

async function importProducts() {
  console.log("Парсинг .doc файлов...\n");

  const allProducts: { name: string; sku: string; category: string }[] = [];

  for (const file of FILES) {
    try {
      const buffer = fs.readFileSync(file.path);
      const sections = parseDocProducts(buffer);

      console.log(`📄 ${file.name}:`);
      for (const section of sections) {
        console.log(`  📁 ${section.category}: ${section.products.length} товаров`);
        for (const product of section.products) {
          const sku = `DOC-${createHash(product)}`;
          allProducts.push({
            name: product,
            sku,
            category: section.category,
          });
        }
      }
      console.log("");
    } catch (e: any) {
      console.log(`📄 ${file.name}: ОШИБКА — ${e.message}\n`);
    }
  }

  console.log(`\nВсего товаров: ${allProducts.length}`);

  // Кэш категорий
  const categoryCache = new Map<string, string>();
  const existingCategories = await prisma.category.findMany();
  existingCategories.forEach((c) => categoryCache.set(c.slug, c.id));

  // Создаём категории
  const uniqueCategories = new Set(allProducts.map((p) => p.category));
  for (const cat of uniqueCategories) {
    const catSlug = createSlug(cat);
    if (!categoryCache.has(catSlug)) {
      const catId = await getOrCreateCategory(cat);
      categoryCache.set(catSlug, catId);
      console.log(`✓ Категория: ${cat.substring(0, 60)}`);
    }
  }

  // Бренд
  let brandId = await getOrCreateBrand("Пневмоинструмент");
  console.log(`\nБренд ID: ${brandId}`);

  // Предзагружаем существующие SKU
  const existingProducts = await prisma.product.findMany({ select: { sku: true } });
  const existingSkuSet = new Set(existingProducts.map((p) => p.sku));

  const productsToCreate = allProducts.filter((p) => !existingSkuSet.has(p.sku));
  console.log(`Новых товаров: ${productsToCreate.length}`);

  // Создание (цены нет, ставим 0) — по одному за раз для надёжности
  if (productsToCreate.length > 0) {
    console.log("\nСоздание товаров...");
    let successCount = 0;

    for (const product of productsToCreate) {
      try {
        const categoryId = categoryCache.get(createSlug(product.category))!;
        const slug = `${createSlug(product.name).substring(0, 50)}-${product.sku}`;

        await prisma.product.create({
          data: {
            slug,
            sku: product.sku,
            name: product.name,
            price: 0,
            inStock: true,
            brandId,
            categoryId,
          },
        });

        successCount++;
        if (successCount % 20 === 0) {
          console.log(`✓ Создано: ${successCount}/${productsToCreate.length}`);
        }
      } catch (e: any) {
        // Пропускаем ошибки дубликатов
        if (e.code !== "P2002") {
          console.error(`  Ошибка: ${product.name.substring(0, 50)} — ${e.message}`);
        }
      }
    }
    console.log(`✓ Создано: ${successCount}/${productsToCreate.length}`);
  }

  console.log(`\n=== Итоги импорта ===`);
  console.log(`✓ Создано: ${productsToCreate.length}`);
  console.log(`Всего обработано: ${allProducts.length}`);
}

async function main() {
  console.log("Начинаем импорт пневмоинструмента из .doc...\n");
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
