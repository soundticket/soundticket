import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'vikfaded@gmail.com' }
    })
    console.log(JSON.stringify(user, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
