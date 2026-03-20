import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Use DIRECT_URL when available to bypass pgBouncer pooler
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL

const prismaClientSingleton = (): PrismaClient => {
  // During Vercel build, connectionString might be missing.
  // We return a recursive proxy to avoid crashes during static analysis or if DB is down.
  if (!connectionString || connectionString === 'base') {
    console.warn("Prisma connection string missing or invalid. Using bypass proxy.")
    
    const createBypassProxy = (): any => {
        const fn = () => Promise.resolve(null);
        return new Proxy(fn, {
            get: (target, prop) => {
                if (prop === 'then') return undefined; // Avoid blocking async/await
                return createBypassProxy();
            }
        });
    };
    
    return createBypassProxy() as unknown as PrismaClient;
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
