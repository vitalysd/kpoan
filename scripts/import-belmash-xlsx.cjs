/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");
const dotenv = require("dotenv");
const XLSX = require("xlsx");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.PRISMA_DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL, PRISMA_DATABASE_URL or POSTGRES_URL is required.");
}

process.env.DATABASE_URL ??= databaseUrl;

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const inputFile = process.argv[2] ?? "C:/Users/demas/Desktop/Unknown.xlsx";
const isDryRun = process.argv.includes("--dry-run");

const translitMap = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const slugify = (value) => {
  const slug = String(value)
    .trim()
    .toLowerCase()
    .replace(/[а-яё]/g, (letter) => translitMap[letter] ?? letter)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "item";
};

const text = (value) => String(value ?? "").trim();

const numberValue = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = text(value).replace(/\s+/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseProducts = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  const products = [];
  let topCategory = "";
  let pendingSection = "";

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const idCell = text(row[0]);
    const second = text(row[1]);
    const third = text(row[2]);
    const next = rows[index + 1] ?? [];
    const nextSecond = text(next[1]);
    const nextThird = text(next[2]);

    if (idCell === "00000000-0000-0000-0000-000000000000" && second && !third) {
      if (nextSecond === "Артикул" && nextThird === "Номенклатура") {
        pendingSection = second;
      } else {
        topCategory = second;
        pendingSection = "";
      }
      continue;
    }

    if (second === "Артикул" && third === "Номенклатура") continue;

    if (!idCell || idCell === "00000000-0000-0000-0000-000000000000" || !second || !third) {
      continue;
    }

    const subCategory = pendingSection || topCategory || "BELMASH";
    const retailPrice = numberValue(row[5]);
    const salePrice = numberValue(row[7]);
    const price = salePrice || retailPrice || 0;

    products.push({
      sku: second,
      name: third,
      categoryName: subCategory,
      categorySlug: slugify(`${topCategory || subCategory}-${subCategory}`),
      topCategory,
      subCategory,
      orderNote: text(row[3]),
      availability: text(row[4]),
      retailPrice,
      discountPercent: numberValue(row[6]),
      price,
      oldPrice: retailPrice > price ? retailPrice : null,
      sourceUrl: text(row[8]),
      inStock: text(row[4]) ? !/нет|отсут/i.test(text(row[4])) : true,
    });
  }

  return products;
};

async function main() {
  const products = parseProducts(inputFile);
  const categories = new Map(
    products.map((product) => [
      product.categorySlug,
      {
        slug: product.categorySlug,
        name: product.categoryName,
        description: product.topCategory && product.topCategory !== product.categoryName
          ? product.topCategory
          : null,
      },
    ]),
  );

  console.log(`Parsed ${products.length} products and ${categories.size} categories from ${inputFile}`);

  if (isDryRun) return;

  const brand = await prisma.brand.upsert({
    where: { slug: "belmash" },
    update: { name: "BELMASH" },
    create: { slug: "belmash", name: "BELMASH" },
  });

  const categoryIds = new Map();
  for (const category of categories.values()) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
      },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
      },
    });
    categoryIds.set(category.slug, saved.id);
  }

  let imported = 0;
  for (const product of products) {
    const productSlug = slugify(`belmash-${product.sku}-${product.name}`);
    const saved = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        slug: productSlug,
        name: product.name,
        shortDescription: product.topCategory
          ? `${product.topCategory}. ${product.availability || "Наличие уточняйте"}`
          : product.availability || "Наличие уточняйте",
        description: product.sourceUrl || null,
        price: product.price,
        oldPrice: product.oldPrice,
        inStock: product.inStock,
        images: [],
        brandId: brand.id,
        categoryId: categoryIds.get(product.categorySlug),
      },
      create: {
        sku: product.sku,
        slug: productSlug,
        name: product.name,
        shortDescription: product.topCategory
          ? `${product.topCategory}. ${product.availability || "Наличие уточняйте"}`
          : product.availability || "Наличие уточняйте",
        description: product.sourceUrl || null,
        price: product.price,
        oldPrice: product.oldPrice,
        inStock: product.inStock,
        images: [],
        brandId: brand.id,
        categoryId: categoryIds.get(product.categorySlug),
      },
    });

    await prisma.productCharacteristic.deleteMany({
      where: { productId: saved.id },
    });

    await prisma.productCharacteristic.createMany({
      data: [
        product.topCategory && { productId: saved.id, name: "Раздел", value: product.topCategory },
        product.subCategory && { productId: saved.id, name: "Подраздел", value: product.subCategory },
        product.availability && { productId: saved.id, name: "Наличие", value: product.availability },
        product.orderNote && { productId: saved.id, name: "Ваш заказ", value: product.orderNote },
        product.retailPrice && { productId: saved.id, name: "РРЦ", value: String(product.retailPrice) },
        product.discountPercent && {
          productId: saved.id,
          name: "Скидка до РОЦ",
          value: `${product.discountPercent}%`,
        },
        product.sourceUrl && { productId: saved.id, name: "Ссылка на сайт", value: product.sourceUrl },
      ].filter(Boolean),
    });

    imported += 1;
    if (imported % 100 === 0) {
      console.log(`Imported ${imported}/${products.length}`);
    }
  }

  console.log(`Done. Imported ${imported} BELMASH products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
