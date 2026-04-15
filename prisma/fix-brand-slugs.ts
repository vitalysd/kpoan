import "dotenv/config";
import { runPrismaScript } from "./script-runner";

const slugUpdates = [
  { name: "ПРОФИ", slug: "profi" },
  { name: "АД ОНИС", slug: "ad-onis" },
];

async function main() {
  await runPrismaScript("Fix brand slugs", async (prisma) => {
    for (const entry of slugUpdates) {
      const brand = await prisma.brand.findFirst({
        where: { name: entry.name },
        select: { id: true, name: true, slug: true },
      });

      if (!brand) {
        console.log(`Бренд "${entry.name}" не найден`);
        continue;
      }

      if (brand.slug === entry.slug) {
        console.log(`"${entry.name}" уже имеет slug "${entry.slug}"`);
        continue;
      }

      await prisma.brand.update({
        where: { id: brand.id },
        data: { slug: entry.slug },
      });

      console.log(`"${entry.name}": "${brand.slug}" -> "${entry.slug}"`);
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
