import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/lib/generated/prisma/client";
// Triggering hot-reload to load the new schema

const globalForPrisma = globalThis;

function createPrismaClient() {
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
  return new PrismaClient({ adapter });
}

/**
 * In development, discard any cached PrismaClient (including its connection
 * pool) on every module reload so that schema changes — new models, enums,
 * etc. — are picked up without a full server restart.
 *
 * In production, reuse the same instance across the server's lifetime.
 */
if (process.env.NODE_ENV !== "production" && globalForPrisma.prisma) {
  globalForPrisma.prisma.$disconnect().catch(() => {});
  delete globalForPrisma.prisma;
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* Runtime guard — helps distinguish between a stale-cache issue and a
   deeper Prisma v7 adapter problem. */
if (typeof prisma.product === "undefined") {
  throw new Error(
    'PrismaClient is missing the "product" model delegate. ' +
      "This usually means the Prisma client was generated before the " +
      'Product model existed. Run `npx prisma generate` and restart the server.',
  );
}
