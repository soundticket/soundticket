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

        // DIAGNÓSTICO: Verificar qué clave está usando Stripe
        const keyPrefix = process.env.STRIPE_SECRET_KEY?.slice(0, 12) || 'NO_KEY'
        console.log(`[Stripe Connect] Usando clave: ${keyPrefix}... | Organizador: ${dbUser.email} | stripeAccountId existente: ${stripeAccountId || 'ninguno'}`)

        // Crear una cuenta de Stripe Connect si el organizador no la tiene todavía
        if (!stripeAccountId) {
            console.log('[Stripe Connect] Intentando crear cuenta Express...')
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'ES',
                email: dbUser.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: 'individual',
                business_profile: {
                    url: 'https://soundticket.es'
                }
            })

            stripeAccountId = account.id
            console.log(`[Stripe Connect] Cuenta creada: ${stripeAccountId}`)

            await prisma.user.update({
                where: { id: dbUser.id },
                data: { stripeAccountId }
            })
        }

        // Construir origin desde las cabeceras de la request (100% fiable en Vercel)
        const proto = req.headers.get('x-forwarded-proto') || 'https'
        const host = req.headers.get('host') || 'soundticket.es'
        const origin = `${proto}://${host}`

        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${origin}/dashboard/billing`,
            return_url: `${origin}/api/stripe/connect/return`,
            type: 'account_onboarding',
        })

        return NextResponse.redirect(accountLink.url, 303)
    } catch (error: any) {
        console.error("[Stripe Connect] ERROR DETALLADO:", {
            message: error?.message,
            type: error?.type,
            code: error?.code,
            statusCode: error?.statusCode,
        })
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
