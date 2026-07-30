import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis;

function createPrismaClient() {
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
  return new PrismaClient({ adapter });
}

/**
 * In development, reuse the same PrismaClient instance across hot reloads
 * so the connection pool is never torn down while other concurrent
 * module evaluations (Turbopack) may still be issuing queries.
 *
 * In production, the singleton lives for the server's lifetime.
 */
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
