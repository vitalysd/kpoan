import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";

loadEnv({ path: ".env.local" });
const prisma = new PrismaClient();

async function cleanCategories() {
  // Находим все категории
  const cats = await prisma.category.findMany();
  let cleaned = 0;

  console.log(`Всего категорий: ${cats.length}`);

  for (const cat of cats) {
    // Проверяем наличие мусорных символов в начале
    // Ищем первую русскую букву или цифру
    const match = cat.name.match(/[\dа-яА-ЯёЁ\w]/);
    if (!match) continue;
    
    const firstGoodIndex = match.index!;
    const cleanName = cat.name.substring(firstGoodIndex).replace(/-$/, "").trim();
    const cleanSlug = cleanName.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    
    console.log(`"${cat.name}" -> "${cleanName}"`);

    // Проверяем, нет ли уже такой категории
    const existing = await prisma.category.findUnique({ where: { slug: cleanSlug } });
    if (existing && existing.id !== cat.id) {
      // Переносим товары в существующую категорию
      await prisma.product.updateMany({
        where: { categoryId: cat.id },
        data: { categoryId: existing.id },
      });
      // Удаляем дубликат
      await prisma.category.delete({ where: { id: cat.id } });
      console.log(`  Объединена с существующей`);
    } else {
      // Просто переименовываем
      await prisma.category.update({
        where: { id: cat.id },
        data: { name: cleanName, slug: cleanSlug },
      });
      console.log(`  Переименована`);
      cleaned++;
    }
  }

  console.log(`\nОчищено категорий: ${cleaned}`);
}

cleanCategories()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
