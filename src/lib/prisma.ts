import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// pg.Pool does not understand the pgbouncer=true parameter — strip it.
function cleanConnectionString(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.searchParams.delete('pgbouncer')
    return parsed.toString()
  } catch {
    return url
  }
}

const rawConnectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

const prismaClientSingleton = (): PrismaClient => {
  if (!rawConnectionString) {
    console.warn('[Prisma] No connection string found — returning empty proxy.')
    // Return a safe proxy that resolves arrays/null so pages don't crash.
    const createProxy = (): any =>
      new Proxy(() => Promise.resolve([]), {
        get: (_t, prop) => (prop === 'then' ? undefined : createProxy()),
        apply: () => Promise.resolve([]),
      })
    return createProxy() as unknown as PrismaClient
  }

  const connectionString = cleanConnectionString(rawConnectionString)
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool as any)
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
