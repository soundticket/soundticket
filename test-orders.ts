import prisma from './src/lib/prisma'

async function main() {
  const queryRaw: any = await prisma.$queryRaw`
      SELECT DATE("createdAt") as day, SUM("totalPrice" * 0.05) as total
      FROM "Order"
      WHERE "status"::text = 'PAID'
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
  `
  console.log('Query Raw:', queryRaw)
}
main().catch(console.error).finally(() => prisma.$disconnect())
