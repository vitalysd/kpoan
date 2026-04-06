import { PrismaClient } from "@prisma/client";

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.PRISMA_DATABASE_URL ??
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL, PRISMA_DATABASE_URL или POSTGRES_URL должен быть установлен",
  );
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

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
