import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Use DIRECT_URL when available to bypass pgBouncer pooler
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL!

const prismaClientSingleton = (): PrismaClient => {
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool as any)
  return new PrismaClient({ adapter } as any) as unknown as PrismaClient
}

declare global {
  var prismaGlobal: undefined | PrismaClient
}

// In development, always use a fresh instance to pick up schema changes without server restart
const prisma: PrismaClient = process.env.NODE_ENV === 'production'
  ? (globalThis.prismaGlobal ?? prismaClientSingleton())
  : prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV === 'production') globalThis.prismaGlobal = prisma
