import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const oldName = 'Tor industries';
  const newName = 'TOR';

  console.log(`Поиск категории "${oldName}"...`);

  const category = await prisma.category.findFirst({
    where: { name: oldName },
  });

  if (!category) {
    console.log(`Категория "${oldName}" не найдена.`);
    return;
  }

  console.log(
    `Найдена категория: id=${category.id}, name="${category.name}", slug="${category.slug}"`
  );

  const updated = await prisma.category.update({
    where: { id: category.id },
    data: { name: newName },
  });

  console.log(`Категория обновлена: "${updated.name}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
