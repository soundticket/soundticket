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

    // fallback for webhooks: sync session if provided
    if (session_id) {
        try {
            const session = await stripe.checkout.sessions.retrieve(session_id)
            if (session.payment_status === 'paid') {
                const { userId, ticketTypeId, eventId } = session.metadata as any

                // check if order already exists
                const existingOrder = await prisma.order.findUnique({
                    where: { stripeSessionId: session.id }
                })

                if (!existingOrder) {
                    const createdTicket = await prisma.$transaction(async (tx) => {
                        const order = await tx.order.create({
                            data: {
                                userId,
                                eventId,
                                totalPrice: (session.amount_total || 0) / 100,
                                status: 'PAID',
                                stripeSessionId: session.id,
                            }
                        })

                        const ticket = await tx.ticket.create({
                            data: {
                                orderId: order.id,
                                ticketTypeId,
                            }
                        })

                        await tx.ticketType.update({
                            where: { id: ticketTypeId },
                            data: { vendidos: { increment: 1 } }
                        })
                        
                        return ticket
                    })
                    
                    // Send confirmation email (Fallback trigger)
                    try {
                        if (process.env.RESEND_API_KEY) {
                            const { resend } = await import('@/lib/resend')
                            const { purchaseConfirmationTemplate } = await import('@/lib/email-templates')
                            
                            const ticketDetails = await prisma.ticket.findUnique({
                                where: { id: createdTicket.id },
                                include: {
                                    order: { include: { user: true } },
                                    ticketType: { include: { event: true } }
                                }
                            })

                            if (ticketDetails?.order.user.email) {
                                const event = ticketDetails.ticketType.event
                                const user = ticketDetails.order.user
                                const htmlContent = purchaseConfirmationTemplate({
                                    userName: user.name || 'Usuario',
                                    userEmail: user.email,
                                    eventTitle: event.title,
                                    eventLocation: event.location,
                                    eventDate: event.startDate,
                                    ticketTypeName: ticketDetails.ticketType.name,
                                    ticketId: ticketDetails.id,
                                    price: ticketDetails.order.totalPrice,
                                    coverImage: event.coverImage || undefined
                                })

                                const isTestMode = false; // Desactivar bypass temporal de pruebas
                                const recipientEmail = isTestMode ? 'onboarding@resend.dev' : user.email;

                                await resend.emails.send({
                                    from: 'SoundTicket <info@soundticket.es>',
                                    to: [recipientEmail],
                                    subject: `🎟️ Tu entrada para ${event.title}`,
                                    html: htmlContent
                                })
                            }
                        }
                    } catch (emailError) {
                        console.error('Error sending fallback email:', emailError)
                    }
                }
            }
        } catch (error) {
            console.error('Session sync error:', error)
        }
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
            {session_id && (
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex items-center gap-4 animate-in slide-in-from-top duration-500">
                    <div className="bg-primary/20 p-3 rounded-full">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">¡Compra completada con éxito!</h3>
                        <p className="text-sm text-muted-foreground">Tu entrada ya está disponible a continuación.</p>
                    </div>
                </div>
            )}

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
