import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";

loadEnv({ path: ".env.local" });
const prisma = new PrismaClient();

async function main() {
  const mappings = [
    { contains: "JǤǎ", newName: "Запасные части к отбойным молоткам" },
    { contains: "LȉĨ̱ɘ", newName: "Вибраторы общего назначения" },
    { contains: "DȉŨͱɘ", newName: "Пневмоинструмент ударного действия" },
    { contains: "4ǱĨ̙ɘ", newName: "Пневмоинструмент вращательного действия" },
  ];

  for (const m of mappings) {
    const result = await prisma.category.updateMany({
      where: { name: { contains: m.contains } },
      data: { name: m.newName },
    });
    console.log(`"${m.contains}" -> "${m.newName}" (${result.count} шт.)`);
  }

  console.log("\nОчистка завершена!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
