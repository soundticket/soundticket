import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import stripe from '@/lib/stripe'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get('stripe-signature') as string

    let event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err: any) {
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any
        const { userId, ticketTypeId, eventId } = session.metadata
        const customerEmail = session.customer_details?.email
        const customerName = session.customer_details?.name
        const isGuest = userId === 'guest' || !userId

        try {
            // Use a transaction to ensure everything is created correctly
            // Execute transaction
            const createdTicket = await prisma.$transaction(async (tx) => {
                // 1. Create the Order
                const order = await tx.order.create({
                    data: {
                        userId: isGuest ? null : userId,
                        guestEmail: isGuest ? customerEmail : null,
                        guestName: isGuest ? customerName : null,
                        eventId,
                        totalPrice: session.amount_total / 100,
                        status: 'PAID',
                        stripeSessionId: session.id,
                    }
                })

                // 2. Create the Ticket
                const ticket = await tx.ticket.create({
                    data: {
                        orderId: order.id,
                        ticketTypeId,
                    }
                })

                // 3. Increment sold count in TicketType
                await tx.ticketType.update({
                    where: { id: ticketTypeId },
                    data: {
                        vendidos: {
                            increment: 1
                        }
                    }
                })

                return ticket
            })

            // Send confirmation email
            try {
                if (process.env.RESEND_API_KEY) {
                    const { resend } = await import('@/lib/resend')
                    const { purchaseConfirmationTemplate } = await import('@/lib/email-templates')
                    
                    // Fetch user and event details to populate the template
                    const ticketDetails = await prisma.ticket.findUnique({
                        where: { id: createdTicket.id },
                        include: {
                            order: { include: { user: true } },
                            ticketType: { include: { event: { include: { organizer: true } } } }
                        }
                    })

                    const recipientEmail = ticketDetails?.order.user?.email || ticketDetails?.order.guestEmail;
                    
                    if (recipientEmail && ticketDetails) {
                        const event = ticketDetails.ticketType.event
                        const user = ticketDetails.order.user
                        const guestName = ticketDetails.order.guestName
                        const recipientName = user?.name || guestName || 'Usuario'

                        const htmlContent = purchaseConfirmationTemplate({
                            userName: recipientName,
                            userEmail: recipientEmail,
                            eventTitle: event.title,
                            eventLocation: event.location,
                            eventDate: event.startDate,
                            ticketTypeName: ticketDetails.ticketType.name,
                            ticketId: ticketDetails.id,
                            qrToken: ticketDetails.qrToken,
                            price: ticketDetails.order.totalPrice,
                            coverImage: event.coverImage || undefined
                        })

                        const isTestMode = false; // Desactivar fallback; enviar al correo real
                        const targetEmail = isTestMode ? 'onboarding@resend.dev' : recipientEmail;

                        await resend.emails.send({
                            from: 'SoundTicket <info@soundticket.es>',
                            to: [targetEmail],
                            subject: `🎟️ Tu entrada para ${event.title}`,
                            html: htmlContent
                        })

                        // Check if SOLD OUT
                        if (ticketDetails.ticketType.vendidos === ticketDetails.ticketType.totalDisponibles) {
                            try {
                                const { eventSoldOutTemplate } = await import('@/lib/email-templates')
                                await resend.emails.send({
                                    from: 'SoundTicket <info@soundticket.es>',
                                    to: [ticketDetails.ticketType.event.organizer.email],
                                    subject: `🎟️ 🚫 SOLD OUT: ${event.title}`,
                                    html: eventSoldOutTemplate(event.title)
                                })
                            } catch (e) {
                                console.error('Failed to send Sold Out email:', e)
                            }
                        }
                    }
                }
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError)
                // We don't throw here as the main transaction succeeded
            }

            return NextResponse.json({ received: true })
        } catch (error) {
            console.error('Webhook processing error:', error)
            return new NextResponse('Internal Server Error', { status: 500 })
        }
    }

    return NextResponse.json({ received: true })
}
