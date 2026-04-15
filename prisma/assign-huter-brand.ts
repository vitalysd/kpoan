import "dotenv/config";
import { runPrismaScript } from "./script-runner";

async function main() {
  await runPrismaScript("Assign Huter brand", async (prisma) => {
    const brand = await prisma.brand.findFirst({
      where: { name: "Huter" },
      select: { id: true, name: true, slug: true },
    });

    if (!brand) {
      throw new Error('Бренд "Huter" не найден');
    }

    const countBefore = await prisma.product.count({
      where: {
        name: { contains: "Huter", mode: "insensitive" },
        NOT: { brandId: brand.id },
      },
    });

    console.log(`Найдено товаров для переноса в бренд ${brand.name}: ${countBefore}`);

    if (countBefore === 0) {
      return;
    }

    const result = await prisma.product.updateMany({
      where: {
        name: { contains: "Huter", mode: "insensitive" },
        NOT: { brandId: brand.id },
      },
      data: {
        brandId: brand.id,
      },
    });

    console.log(`Обновлено товаров: ${result.count}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
