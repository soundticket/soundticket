import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// For serverless (Vercel), use transaction-mode pgBouncer (DATABASE_URL, port 6543)
// NOT the session-mode URL (DIRECT_URL, port 5432) which has a very low client limit.
// pgBouncer transaction mode supports many more concurrent connections.
const rawConnectionString = process.env.DATABASE_URL || process.env.DIRECT_URL

function cleanConnectionString(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.searchParams.delete('pgbouncer')
    return parsed.toString()
  } catch {
    return url
  }
}

const prismaClientSingleton = (): PrismaClient => {
  if (!rawConnectionString) {
    console.warn('[Prisma] No connection string found — returning empty proxy.')
    const createProxy = (): any =>
      new Proxy(() => Promise.resolve([]), {
        get: (_t, prop) => (prop === 'then' ? undefined : createProxy()),
        apply: () => Promise.resolve([]),
      })
    return createProxy() as unknown as PrismaClient
  }

  const connectionString = cleanConnectionString(rawConnectionString)

  // Limit pool size to avoid hitting pgBouncer's max clients in serverless.
  // Vercel can have many concurrent invocations — keep the pool small per instance.
  const pool = new pg.Pool({
    connectionString,
    max: 2,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  })

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
