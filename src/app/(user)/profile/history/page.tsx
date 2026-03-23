import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CalendarDays, MapPin, History } from "lucide-react"
import Link from "next/link"

export default async function HistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch all tickets and filter in Memory to bypass local Prisma Enum caches
    const rawTickets = await prisma.ticket.findMany({
        where: {
            order: {
                userId: user.id
            }
        },
        include: {
            ticketType: {
                include: {
                    event: true
                }
            }
        },
        orderBy: {
            ticketType: {
                event: {
                    startDate: 'desc'
                }
            }
        }
    })

    const tickets = rawTickets.filter(t => {
        const event = t.ticketType?.event
        if (!event) return false
        // Past tickets OR Cancelled tickets
        return event.startDate < new Date() || (event.status as string) === 'CANCELLED'
    })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Historial de Eventos</h1>
                <p className="text-muted-foreground">Tus asistencias pasadas y eventos finalizados.</p>
            </div>

            {tickets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tickets.map((ticket) => (
                        <Link href={`/event/${ticket.ticketType.event.id}`} key={ticket.id}>
                            <Card className="overflow-hidden border-border/50 bg-card/30 backdrop-blur-xl flex flex-col opacity-80 grayscale-[0.5] hover:grayscale-0 hover:scale-[1.02] hover:border-primary/50 hover:shadow-primary/20 hover:shadow-2xl transition-all cursor-pointer h-full">
                                <div className="relative aspect-[16/9] overflow-hidden">
                                    <img
                                        src={ticket.ticketType.event.coverImage || `https://images.unsplash.com/photo-1540039155732-d674d40d12ce?q=80&w=800&auto=format&fit=crop`}
                                        alt={ticket.ticketType.event.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                                    <div className={`absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                        (ticket.ticketType.event.status as string) === 'CANCELLED' 
                                        ? 'border-red-500/50 text-red-500' 
                                        : 'border-border/50 text-foreground'
                                    }`}>
                                        {(ticket.ticketType.event.status as string) === 'CANCELLED' ? 'Cancelado' : 'Finalizado'}
                                    </div>
                                </div>

                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xl font-bold">{ticket.ticketType.event.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        <CalendarDays className="h-3 w-3" />
                                        {ticket.ticketType.event.startDate.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pt-2 mt-auto">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="h-3 w-3 mr-2 text-primary shrink-0" />
                                        <span className="truncate">{ticket.ticketType.event.location}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-[0.2em]">ID: {ticket.id.substring(0, 8)}...</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card className="border-border/50 bg-card/30 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <History className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <CardTitle className="mb-2">Aún no tienes un historial</CardTitle>
                        <CardDescription>
                            Tus eventos pasados aparecerán aquí automáticamente una vez finalicen.
                        </CardDescription>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
