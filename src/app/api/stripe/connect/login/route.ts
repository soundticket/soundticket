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

        if (!dbUser || !dbUser.stripeAccountId || !dbUser.chargesEnabled) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        // Crear una llave de sesión temporal para la pantalla financiera oficial de Stripe Express
        const loginLink = await stripe.accounts.createLoginLink(dbUser.stripeAccountId)

        return NextResponse.redirect(loginLink.url, 303)
    } catch (error) {
        console.error("Error al generar login link de Stripe:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
