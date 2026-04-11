import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || ''

function cleanUrl(url: string): string {
    try {
        const parsed = new URL(url)
        parsed.searchParams.delete('pgbouncer')
        return parsed.toString()
    } catch {
        return url
    }
}

const pool = new pg.Pool({
    connectionString: cleanUrl(rawUrl),
    max: 1,
    connectionTimeoutMillis: 15_000,
})

const adapter = new PrismaPg(pool as any)
const prisma = new PrismaClient({ adapter })

async function main() {
    const eventId = '5a3d5cdb-316d-47e2-85e3-9b7046303f56'

    const before = await (prisma.event as any).findUnique({
        where: { id: eventId },
        select: { id: true, title: true, status: true, isPublished: true }
    })

    console.log('Estado ANTES:', before)

    if (!before) {
        console.error('❌ Evento no encontrado. Verifica el ID.')
        return
    }

    const updated = await (prisma.event as any).update({
        where: { id: eventId },
        data: {
            status: 'APPROVED',
            isPublished: true,
        }
    })

    console.log('✅ Evento restaurado correctamente:')
    console.log('  Título:', updated.title)
    console.log('  Status:', updated.status)
    console.log('  isPublished:', updated.isPublished)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect().then(() => pool.end()))
