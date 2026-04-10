import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar .env ANTES de importar nada que use process.env
config({ path: resolve(__dirname, '../.env') })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { Resend } from 'resend'
import { purchaseConfirmationTemplate } from '../src/lib/email-templates'

const TARGET_EMAIL = 'dearchivostraspaso2@gmail.com'

function buildPrisma() {
  const rawUrl = process.env.DATABASE_URL || process.env.DIRECT_URL
  if (!rawUrl) throw new Error('No DATABASE_URL en .env')

  // Quitar pgbouncer=true que causa problemas con el adapter
  const url = new URL(rawUrl)
  url.searchParams.delete('pgbouncer')

  const pool = new pg.Pool({
    connectionString: url.toString(),
    max: 2,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  })

  const adapter = new PrismaPg(pool as any)
  return new PrismaClient({ adapter })
}

async function main() {
  const prisma = buildPrisma()
  const resend = new Resend(process.env.RESEND_API_KEY)

  console.log(`🔍 Buscando órdenes PAID para: ${TARGET_EMAIL}`)

  const orders = await prisma.order.findMany({
    where: {
      status: 'PAID',
      OR: [
        { guestEmail: TARGET_EMAIL },
        { user: { email: TARGET_EMAIL } },
      ],
    },
    include: {
      tickets: { include: { ticketType: true } },
      event: true,
      user: true,
    },
  })

  if (orders.length === 0) {
    console.log('❌ No se encontraron órdenes PAID para', TARGET_EMAIL)
    await prisma.$disconnect()
    return
  }

  console.log(`✅ ${orders.length} orden(es) encontrada(s)`)

  for (const order of orders) {
    const userName  = order.guestName || order.user?.name || 'Cliente'
    const userEmail = order.guestEmail || order.user?.email || TARGET_EMAIL

    for (const ticket of order.tickets) {
      console.log(`\n📨 Preparando entrada ${ticket.id.substring(0, 12)}... — "${order.event.title}"`)

      const html = purchaseConfirmationTemplate({
        userName,
        userEmail,
        eventTitle:     order.event.title,
        eventLocation:  order.event.location,
        eventDate:      order.event.startDate,
        ticketTypeName: ticket.ticketType.name,
        ticketId:       ticket.id,
        qrToken:        ticket.qrToken,
        price:          order.totalPrice / order.tickets.length,
        coverImage:     order.event.coverImage ?? undefined,
      })

      const { data, error } = await resend.emails.send({
        from:    'SoundTicket <tickets@soundticket.es>',
        to:      [TARGET_EMAIL],
        subject: `🎫 Tu entrada para ${order.event.title} (re-envío QR)`,
        html,
      })

      if (error) {
        console.error('  ❌ Error Resend:', error)
      } else {
        console.log('  ✅ Enviado — ID Resend:', data?.id)
      }
    }
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
