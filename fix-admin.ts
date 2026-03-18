import prisma from './src/lib/prisma'

async function main() {
    const email = 'vikfaded@gmail.com'
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.log(`User ${email} not found in database.`)
        return
    }

    console.log(`User found: ${user.email}, Role: ${user.role}, ID: ${user.id}`)

    if (user.role !== 'ADMIN') {
        console.log('Upgrading user to ADMIN...')
        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
        })
        console.log('Upgrade successful.')
    } else {
        console.log('User is already ADMIN.')
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
