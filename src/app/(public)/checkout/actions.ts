'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import stripe from '@/lib/stripe'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'

async function getBaseUrl(): Promise<string> {
    const hdrs = await headers()
    const proto = hdrs.get('x-forwarded-proto') || 'https'
    const host = hdrs.get('host') || 'soundticket.es'
    return `${proto}://${host}`
}

export async function createCheckoutSession(ticketTypeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Debes iniciar sesión para comprar entradas.' }
    }

    try {
        const ticketType = await prisma.ticketType.findUnique({
            where: { id: ticketTypeId },
            include: { 
                event: {
                    include: { organizer: true }
                } 
            }
        })

        if (!ticketType) {
            return { error: 'Tipo de entrada no encontrado.' }
        }

        if (ticketType.totalDisponibles - ticketType.vendidos <= 0) {
            return { error: 'Entradas agotadas.' }
        }

        const organizer = ticketType.event.organizer;
        if (!organizer.stripeAccountId || !organizer.chargesEnabled) {
            return { error: 'El organizador tiene restricciones temporales en su cuenta bancaria. Inténtalo más tarde.' }
        }

        const unitAmount = Math.round(ticketType.price * 100);
        const applicationFeeAmount = Math.round(unitAmount * 0.05); // 5% de comisión para SoundTicket

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `${ticketType.event.title} - ${ticketType.name}`,
                            description: ticketType.event.description.substring(0, 100) + '...',
                            images: ticketType.event.coverImage ? [ticketType.event.coverImage] : [],
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            payment_intent_data: {
                application_fee_amount: applicationFeeAmount,
                transfer_data: {
                    destination: organizer.stripeAccountId,
                },
                on_behalf_of: organizer.stripeAccountId,
            },
            success_url: `${await getBaseUrl()}/profile?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${await getBaseUrl()}/event/${ticketType.eventId}`,
            metadata: {
                userId: user.id,
                ticketTypeId: ticketType.id,
                eventId: ticketType.event.id,
            },
            customer_email: user.email,
        })

        return { url: session.url }
    } catch (error: any) {
        console.error('Checkout error:', error)
        return { error: `Error: ${error.message || 'Ocurrió un error al procesar el pago'}` }
    }
}
