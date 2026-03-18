import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import stripe from "@/lib/stripe"

export async function GET(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.redirect(new URL("/login", req.url))
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })

        if (!dbUser || !dbUser.stripeAccountId) {
            return NextResponse.redirect(new URL("/dashboard/billing", req.url))
        }

        // Consultar directamente al oráculo de Stripe si el usuario completó la burocracia contable
        const account = await stripe.accounts.retrieve(dbUser.stripeAccountId)

        if (account.details_submitted) {
            // Confirmamos nativamente en nuestra dB que esta persona física/jurídica ya es apta para vender entradas
            await prisma.user.update({
                where: { id: dbUser.id },
                data: { chargesEnabled: true }
            })
        }

        // Siempre redirigir de vuelta al panel visual
        return NextResponse.redirect(new URL("/dashboard/billing", req.url))
    } catch (error) {
        console.error("Error al retornar de Stripe Connect:", error)
        return NextResponse.redirect(new URL("/dashboard/billing?error=Retorno+fallido", req.url))
    }
}
