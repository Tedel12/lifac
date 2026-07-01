import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma Client.
 *
 * En développement (HMR Next.js), évite la création de multiples
 * instances qui sature le pool de connexions PostgreSQL.
 *
 * En production sur Vercel (serverless), chaque invocation lambda crée
 * sa propre instance — c'est attendu. Pour Neon, utilisez la connection
 * string "pooled" (`?pgbouncer=true&connection_limit=1`) afin d'éviter
 * la saturation des connexions.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
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
