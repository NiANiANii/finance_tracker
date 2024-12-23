import { PrismaClient } from "@prisma/client";

// Gunakan caching Prisma Client di development untuk menghindari instansiasi ulang
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // Logging opsional untuk debugging
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

