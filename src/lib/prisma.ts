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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryablePrismaError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("postgresql connection") ||
    message.includes("kind: closed") ||
    message.includes("connection closed") ||
    message.includes("server has closed the connection") ||
    message.includes("socket hang up") ||
    message.includes("can't reach database server")
  );
}

export async function runWithPrismaRetry<T>(
  operation: () => Promise<T>,
  options?: {
    label?: string;
    retries?: number;
    delayMs?: number;
  },
): Promise<T> {
  const retries = options?.retries ?? 1;
  const delayMs = options?.delayMs ?? 300;
  const label = options?.label ?? "Prisma operation";

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      if (attempt > 0) {
        await prisma.$disconnect().catch(() => undefined);
        await sleep(delayMs);
        await prisma.$connect().catch(() => undefined);
      }

      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryablePrismaError(error) || attempt === retries) {
        throw error;
      }

      console.warn(`${label} failed due to a closed DB connection. Retrying...`);
    }
  }

  throw lastError;
}
