import { PrismaClient } from '@prisma/client'
import { isProd } from './env'

// Singleton PrismaClient (avoids exhausting connections on hot-reload).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error'] : ['error', 'warn'],
  })

if (!isProd) globalForPrisma.prisma = prisma
