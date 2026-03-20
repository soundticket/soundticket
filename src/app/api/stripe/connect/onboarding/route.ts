import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import stripe from "@/lib/stripe"

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (!dbUser || dbUser.organizerStatus !== 'APPROVED') {
            return new NextResponse("Forbidden", { status: 403 })
        }

        let stripeAccountId = dbUser.stripeAccountId

        // Crear una cuenta de Stripe Connect si el organizador no la tiene todavía
        if (!stripeAccountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'ES',
                email: dbUser.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: 'individual',
            })

            stripeAccountId = account.id

            await prisma.user.update({
                where: { id: dbUser.id },
                data: { stripeAccountId }
            })
        }

        // Determinar la URL base correcta: NEXT_PUBLIC_BASE_URL o derivarla de la request
        const configuredBase = process.env.NEXT_PUBLIC_BASE_URL || ''
        const isLocalhost = configuredBase.includes('localhost') || configuredBase === ''
        const origin = isLocalhost
            ? `https://${req.headers.get('host') || 'soundticket.es'}`
            : configuredBase

        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${origin}/dashboard/billing`,
            return_url: `${origin}/api/stripe/connect/return`,
            type: 'account_onboarding',
        })

        return NextResponse.redirect(accountLink.url, 303)
    } catch (error) {
        console.error("Error en Onboarding de Stripe:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
