import "dotenv/config";
import { runPrismaScript } from "./script-runner";

function normalizeProductName(name: string): string {
  return name
    .replace(/^SALE!\s*/i, "")
    .replace(/^архив_/i, "")
    .replace(/^\*\s*/u, "")
    .replace(/\s*,\s*,\s*Шт\s*$/iu, "")
    .replace(/\s*,\s*Шт\s*$/iu, "")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

function isHeadingLikeName(name: string): boolean {
  return /ЗАПЧАСТИ\s+ДЛЯ\s+БЕТОНОЛОМОВ:/iu.test(name);
}

async function main() {
  await runPrismaScript("Clean product names", async (prisma) => {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, sku: true },
    });

    const toDelete = products.filter((product) => isHeadingLikeName(product.name));
    const toUpdate = products
      .map((product) => ({
        ...product,
        nextName: normalizeProductName(product.name),
      }))
      .filter((product) => product.nextName !== product.name && product.nextName.length > 0);

    console.log(`К удалению заголовков: ${toDelete.length}`);
    for (const product of toDelete) {
      console.log(`- delete ${product.sku ?? product.id}: ${product.name}`);
    }

    console.log(`К обновлению названий: ${toUpdate.length}`);
    for (const product of toUpdate.slice(0, 20)) {
      console.log(`- ${product.sku ?? product.id}: "${product.name}" -> "${product.nextName}"`);
    }

    if (toDelete.length > 0) {
      const deleted = await prisma.product.deleteMany({
        where: { id: { in: toDelete.map((product) => product.id) } },
      });
      console.log(`Удалено заголовков: ${deleted.count}`);
    }

    await prisma.$executeRaw`
      UPDATE "Product"
      SET "name" = trim(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace("name", '^SALE!\\s*', '', 'i'),
                    '^архив_', '', 'i'
                  ),
                  '^\\*\\s*', '', 'g'
                ),
                '\\s*,\\s*,\\s*Шт\\s*$', '', 'i'
              ),
              '\\s*,\\s*Шт\\s*$', '', 'i'
            ),
            '\\s+', ' ', 'g'
          ),
          '\\s+,', ',', 'g'
        )
      )
      WHERE "name" ~ '^SALE!\\s*'
        OR "name" ~ '^архив_'
        OR "name" ~ '^\\*\\s*'
        OR "name" ~ '\\s*,\\s*,\\s*Шт\\s*$'
        OR "name" ~ '\\s*,\\s*Шт\\s*$';
    `;

    console.log(`Обновлено названий: ${toUpdate.length}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
