import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Borrando IDs de Stripe antiguos (modo test)...')
    const result = await prisma.user.updateMany({
        where: {
            stripeAccountId: { not: null }
        },
        data: {
            stripeAccountId: null,
            chargesEnabled: false
        }
    })
    console.log(`Borrados ${result.count} cuentas de Stripe.`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
