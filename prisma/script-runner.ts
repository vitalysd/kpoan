import { PrismaClient } from "@prisma/client";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryableError(error: unknown): boolean {
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

export async function runPrismaScript<T>(
  label: string,
  operation: (prisma: PrismaClient) => Promise<T>,
  options?: {
    retries?: number;
    delayMs?: number;
  },
): Promise<T> {
  const prisma = new PrismaClient();
  const retries = options?.retries ?? 1;
  const delayMs = options?.delayMs ?? 300;

  try {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        if (attempt > 0) {
          await prisma.$disconnect().catch(() => undefined);
          await sleep(delayMs);
          await prisma.$connect().catch(() => undefined);
        }

        return await operation(prisma);
      } catch (error) {
        if (!isRetryableError(error) || attempt === retries) {
          throw error;
        }

        console.warn(`${label} failed due to a closed DB connection. Retrying...`);
      }
    }

    throw new Error(`${label} failed without a captured error`);
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
}
