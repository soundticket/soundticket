import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Use DIRECT_URL when available to bypass pgBouncer pooler for direct queries
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

const prismaClientSingleton = (): PrismaClient => {
  if (!connectionString) {
    console.warn('[Prisma] No connection string found. Using bypass proxy (build time or env missing).')
    const createBypassProxy = (): any => {
      const fn = () => Promise.resolve(null)
      return new Proxy(fn, {
        get: (_target, prop) => {
          if (prop === 'then') return undefined
          return createBypassProxy()
        }
      })
    }
    return createBypassProxy() as unknown as PrismaClient
  }

  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: PrismaClient | undefined
}

const prisma: PrismaClient =
  process.env.NODE_ENV === 'production'
    ? (globalThis.prismaGlobal ?? (globalThis.prismaGlobal = prismaClientSingleton()))
    : prismaClientSingleton()

export default prisma
