import "dotenv/config";
import { runPrismaScript } from "./script-runner";

function isSuspiciousDocName(name: string): boolean {
  const markers = [
    "Root Entry",
    "WordDocument",
    "CompObj",
    "SummaryInformation",
    "Heading 1",
    "Default Paragraph Font",
    "Unknown",
    "Ăǜǜ",
  ];

  if (markers.some((marker) => name.includes(marker))) {
    return true;
  }

  const extendedChars = (name.match(/[\u0100-\u024F\x80-\x9F]/g) ?? []).length;
  const readableChars =
    (name.match(/[А-Яа-яЁё]/g) ?? []).length +
    (name.match(/[A-Za-z]/g) ?? []).length +
    (name.match(/[0-9]/g) ?? []).length;

  return extendedChars >= 3 && readableChars < Math.ceil(name.length * 0.35);
}

async function main() {
  await runPrismaScript("Remove corrupted DOC products", async (prisma) => {
    const products = await prisma.product.findMany({
      where: {
        sku: { startsWith: "DOC-" },
      },
      select: {
        id: true,
        name: true,
        sku: true,
      },
    });

    const corrupted = products.filter((product) => isSuspiciousDocName(product.name));

    console.log(`Найдено мусорных DOC-товаров: ${corrupted.length}`);

    for (const product of corrupted) {
      console.log(`- ${product.sku}: ${product.name}`);
    }

    if (corrupted.length === 0) {
      return;
    }

    const result = await prisma.product.deleteMany({
      where: {
        id: { in: corrupted.map((product) => product.id) },
      },
    });

    console.log(`Удалено товаров: ${result.count}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
