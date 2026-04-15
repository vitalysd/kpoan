import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const oldName = 'Tor industries';
  const newName = 'TOR';

  console.log(`Поиск бренда "${oldName}"...`);

  const brand = await prisma.brand.findFirst({
    where: { name: oldName },
  });

  if (!brand) {
    console.log(`Бренд "${oldName}" не найден.`);
    return;
  }

  console.log(`Найден бренд: id=${brand.id}, name="${brand.name}", slug="${brand.slug}"`);

  const updated = await prisma.brand.update({
    where: { id: brand.id },
    data: { name: newName },
  });

  console.log(`✅ Бренд обновлён: "${updated.name}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
