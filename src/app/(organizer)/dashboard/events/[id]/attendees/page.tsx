import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Calendar, Ticket, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button-variants"

export default async function AttendeesPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const resolvedParams = await params;
    const eventId = resolvedParams.id


    // Check ownership or co-organizer
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            organizer: true,
            coOrganizers: {
                where: { userId: user.id }
            }
        }
    })

    if (!event) {
        redirect("/dashboard/events")
    }

    const isOwner = event.organizerId === user.id
    const isCoOrganizer = event.coOrganizers.length > 0

    if (!isOwner && !isCoOrganizer) {
        redirect("/dashboard/events")
    }

    // Fetch PAID orders for this event
    const orders = await prisma.order.findMany({
        where: {
            eventId: eventId,
            status: 'PAID'
        },
        include: {
            user: true,
            tickets: {
                include: {
                    ticketType: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Flatten to "attendees" if needed, or list by order.
    // Each order might have multiple tickets. Let's list each ticket as an an attendee row.
    const attendees = orders.flatMap(order => {
        return order.tickets.map(ticket => ({
            ticketId: ticket.id,
            qrToken: ticket.qrToken,
            isScanned: ticket.isScanned,
            ticketTypeName: ticket.ticketType.name,
            purchaseDate: order.createdAt,
            orderId: order.id,
            buyerName: order.user ? (order.user.name || order.user.email) : order.guestName,
            buyerEmail: order.user ? order.user.email : order.guestEmail,
        }))
    });

    const totalAttendees = attendees.length;

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Link 
                    href="/dashboard/events"
                    className={cn(buttonVariants({ variant: "outline", size: "icon" }), "rounded-full shrink-0")}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black italic tracking-tight uppercase flex items-center gap-2">
                        Lista de <span className="text-primary">Asistentes</span>
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        {event.title} - {totalAttendees} entradas vendidas
                    </p>
                </div>
            </div>

            <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden mt-6">
                <CardHeader className="bg-primary/5 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" /> Asistentes
                    </CardTitle>
                    <CardDescription>
                        Desglose de compradores y sus entradas
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-4 font-bold tracking-wider">Comprador</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Email</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Entrada</th>
                                    <th className="px-6 py-4 font-bold tracking-wider">Estado</th>
                                    <th className="px-6 py-4 font-bold tracking-wider text-right">Fecha de Compra</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendees.length > 0 ? (
                                    attendees.map((att, idx) => (
                                        <tr key={att.ticketId} className="border-b border-border/50 hover:bg-muted/30 transition-colors last:border-0">
                                            <td className="px-6 py-4 font-semibold">
                                                {att.buyerName || 'Anónimo'}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {att.buyerEmail || 'Sin email'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                                                    <Ticket className="w-3.5 h-3.5" />
                                                    {att.ticketTypeName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {att.isScanned ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                        Escaneada
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                                        Pendiente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right text-muted-foreground tabular-nums whitespace-nowrap">
                                                {att.purchaseDate.toLocaleString('es-ES', { 
                                                    day: '2-digit', 
                                                    month: '2-digit', 
                                                    year: 'numeric', 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="font-medium">No hay asistentes todavía.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
