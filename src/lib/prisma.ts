import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Use DIRECT_URL when available to bypass pgBouncer pooler
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

const prismaClientSingleton = (): PrismaClient => {
  // During Vercel build, connectionString might be missing.
  // We return a proxy to avoid P1001 errors during static analysis.
  if (!connectionString || connectionString === 'base') {
    console.warn("Prisma connection string missing or invalid. Using bypass proxy (likely build time).")
    return new Proxy({} as any, {
        get: () => () => Promise.resolve([])
    }) as unknown as PrismaClient
  }

  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool as any)
  return new PrismaClient({ adapter } as any) as unknown as PrismaClient
}

declare global {
  var prismaGlobal: undefined | PrismaClient
}

// In development AND production, handle singleton
const getPrisma = () => {
    if (process.env.NODE_ENV === 'production') {
        if (!globalThis.prismaGlobal) {
            globalThis.prismaGlobal = prismaClientSingleton()
        }
        return globalThis.prismaGlobal
    }
    return prismaClientSingleton()
}

const prisma = getPrisma()

export default prisma
