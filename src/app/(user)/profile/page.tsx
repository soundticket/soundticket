import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import stripe from "@/lib/stripe"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Ticket, CheckCircle2 } from "lucide-react"
import { TicketCard } from "./ticket-card"

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { session_id } = await searchParams

    if (!user) {
        redirect("/login")
    }


    const tickets = await prisma.ticket.findMany({
        where: {
            order: {
                userId: user.id
            },
            ticketType: {
                event: {
                    startDate: { gte: new Date() },
                    status: { notIn: ['CANCELLED', 'REJECTED'] as any }
                }
            }
        },
        include: {
            ticketType: {
                include: {
                    event: true
                }
            },
            order: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mis Entradas</h1>
                <p className="text-muted-foreground">Aquí encontrarás tus entradas compradas y sus códigos QR.</p>
            </div>

            {tickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tickets.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                </div>
            ) : (
                <Card className="border-border/50 bg-card/30 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Ticket className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <CardTitle className="mb-2">No tienes entradas aún</CardTitle>
                        <CardDescription className="mb-6">
                            ¡Busca tu próximo evento y empieza la experiencia!
                        </CardDescription>
                        <Link 
                            href="/explore" 
                            className="inline-flex h-10 px-4 py-2 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:bg-primary/90 transition-colors"
                        >
                            Explorar Eventos
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
