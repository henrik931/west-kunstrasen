import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: pg.Pool;
};

const pool =
  globalForPrisma.pool ??
  new pg.Pool({
    connectionString: process.env.DATABASE_URL, // pooled URL
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.pool = pool;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;