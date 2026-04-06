import { PrismaClient } from "@prisma/client";

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.PRISMA_DATABASE_URL ??
  process.env.POSTGRES_URL;

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

if (!databaseUrl && process.env.NODE_ENV === "development") {
  console.warn(
    "DATABASE_URL не установлен. Установите DATABASE_URL, PRISMA_DATABASE_URL или POSTGRES_URL.",
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
