/**
 * Script de limpieza: elimina todos los eventos, tickets, órdenes y favoritos.
 * Los tipos de entrada, órdenes, tickets y favoritos se borran en cascada automáticamente.
 *
 * Ejecutar con:
 *   npx tsx scripts/reset-events.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('⏳ Eliminando todos los eventos y sus datos relacionados...')

    const result = await prisma.event.deleteMany({})

    console.log(`✅ Eliminados ${result.count} eventos (tickets, órdenes y favoritos incluidos en cascada).`)
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
