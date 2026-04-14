import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Транслитерация кириллицы в латиницу
function transliterate(text: string): string {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  };
  return text.split('').map(c => map[c] ?? c).join('');
}

function makeSlug(text: string): string {
  return transliterate(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/--+/g, '-');
}

async function main() {
  console.log("=== Product Cleanup ===\n");

  // 1. Удалить corrupted товары (имя содержит мусорные символы, длина > 200)
  console.log("--- 1. Deleting corrupted products ---");
  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true },
  });

  const corrupted = allProducts.filter(
    (p) => p.name.length > 200 && /[\u0240-\u02AF\u0100-\u017F\x80-\xFF]/.test(p.name)
  );

  console.log(`Found ${corrupted.length} corrupted products`);
  if (corrupted.length > 0) {
    for (const p of corrupted) {
      console.log(`  Deleting: id=${p.id}, name="${p.name.substring(0, 60)}..."`);
    }
    const result = await prisma.product.deleteMany({
      where: { id: { in: corrupted.map((p) => p.id) } },
    });
    console.log(`Deleted ${result.count} corrupted products`);
  }

  // 2. Почистить двойные пробелы
  console.log("\n--- 2. Fixing double spaces in names ---");
  let skip = 0;
  const batchSize = 10000;
  let fixedSpaces = 0;

  // Собираем ID товаров с двойными пробелами
  const doubleSpaceProducts: { id: string; name: string }[] = [];
  while (skip < (await prisma.product.count())) {
    const batch = await prisma.product.findMany({
      select: { id: true, name: true },
      skip,
      take: batchSize,
    });
    for (const p of batch) {
      if (p.name.includes("  ")) {
        doubleSpaceProducts.push({ id: p.id, name: p.name });
      }
    }
    skip += batchSize;
  }

  if (doubleSpaceProducts.length > 0) {
    for (const p of doubleSpaceProducts) {
      const newName = p.name.replace(/\s+/g, " ").trim();
      await prisma.product.update({
        where: { id: p.id },
        data: { name: newName },
      });
      console.log(`  Fixed: "${p.name.substring(0, 60)}..." -> "${newName.substring(0, 60)}..."`);
      fixedSpaces++;
    }
    console.log(`Fixed ${fixedSpaces} products`);
  } else {
    console.log("No double spaces found");
  }

  // 3. Транслитерировать slug с кириллицей
  console.log("\n--- 3. Transliterating non-ASCII slugs ---");
  let nonAsciiProducts: { id: string; slug: string; name: string }[] = [];
  skip = 0;
  const totalAfterCleanup = await prisma.product.count();

  while (skip < totalAfterCleanup) {
    const batch = await prisma.product.findMany({
      select: { id: true, slug: true, name: true },
      skip,
      take: batchSize,
    });
    for (const p of batch) {
      if (p.slug && /[^\x00-\x7F]/.test(p.slug)) {
        nonAsciiProducts.push(p);
      }
    }
    skip += batchSize;
  }

  console.log(`Found ${nonAsciiProducts.length} products with non-ASCII slugs`);

  let fixedSlugs = 0;
  let skippedSlugs = 0;
  for (const p of nonAsciiProducts) {
    const newSlug = makeSlug(p.name);
    if (!newSlug || newSlug.length < 2) {
      console.log(`  Skip (empty slug): "${p.name.substring(0, 50)}" [${p.slug}]`);
      skippedSlugs++;
      continue;
    }

    // Проверяем нет ли уже такого slug
    const exists = await prisma.product.findUnique({ where: { slug: newSlug } });
    if (exists) {
      // Добавляем суффикс чтобы избежать дубликатов
      const uniqueSlug = `${newSlug}-${p.id.slice(-6)}`;
      await prisma.product.update({
        where: { id: p.id },
        data: { slug: uniqueSlug },
      });
      console.log(`  Fixed: [${p.slug}] -> [${uniqueSlug}]`);
    } else {
      await prisma.product.update({
        where: { id: p.id },
        data: { slug: newSlug },
      });
      console.log(`  Fixed: [${p.slug}] -> [${newSlug}]`);
    }
    fixedSlugs++;
  }

  console.log(`Fixed ${fixedSlugs} slugs, skipped ${skippedSlugs}`);

  console.log("\n=== Cleanup Complete ===");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
