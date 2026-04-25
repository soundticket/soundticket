import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Users, Ticket, TrendingUp, Edit, Trash2, Calendar } from "lucide-react"
import Link from "next/link"
import { DeleteEventButton } from "@/components/delete-event-button"
import prisma from "@/lib/prisma"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function OrganizerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const includeTicketTypes = {
        ticketTypes: {
            include: {
                _count: {
                    select: { tickets: true }
                }
            }
        }
    }

    const ownEvents = await (prisma.event as any).findMany({
        where: { organizerId: user.id },
        include: includeTicketTypes,
        orderBy: { startDate: 'desc' }
    })

    const coOrgRows = await (prisma.eventCoOrganizer as any).findMany({
        where: { userId: user.id },
        include: {
            event: { include: includeTicketTypes }
        },
        orderBy: { createdAt: 'desc' }
    })
    const coOrgEvents = coOrgRows.map((row: any) => ({ ...row.event, isCoOrg: true }))

    const events = [
        ...ownEvents.map((e: any) => ({ ...e, isCoOrg: false })),
        ...coOrgEvents
    ]

    // Calculate total sold and total stock across all events
    const totalSold = events.reduce((acc: any, ev: any) =>
        acc + ev.ticketTypes.reduce((s: any, t: any) => s + (t._count?.tickets || 0), 0), 0)

    const totalStock = events.reduce((acc: any, ev: any) =>
        acc + ev.ticketTypes.reduce((s: any, t: any) => s + t.totalDisponibles, 0), 0)

    // Calculate projected sales (sum of sold tickets * price)
    const totalSales = events.reduce((acc: any, ev: any) =>
        acc + ev.ticketTypes.reduce((s: any, t: any) => s + ((t._count?.tickets || 0) * t.price), 0), 0)

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight italic">Panel de <span className="text-primary">Organizador</span></h1>
                    <p className="text-muted-foreground">Gestiona tus eventos y revisa tus ventas.</p>
                </div>
                <div className="flex bg-card/40 border border-border/50 rounded-xl p-1 gap-1">
                    <Button variant="ghost" size="sm" className="bg-primary/10 text-primary">Overview</Button>
                    <Link 
                        href="/dashboard/events"
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                        Mis Eventos
                    </Link>
                </div>
                <Link 
                    href="/dashboard/events/create"
                    className={cn(buttonVariants({ variant: "default" }), "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:bg-primary/90")}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Evento
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventas Totales (Est.)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold italic">
                            {totalSales.toFixed(2)} €
                        </div>
                        <p className="text-xs text-muted-foreground">Ingresos brutos acumulados</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tickets Vendidos</CardTitle>
                        <Ticket className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold italic">{totalSold}</div>
                        <p className="text-xs text-muted-foreground">De un total de {totalStock} disponibles</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30 shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Eventos Activos</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold italic">{(events as any[]).filter((e: any) => e.status === 'APPROVED').length}</div>
                        <p className="text-xs text-muted-foreground">{events.length} eventos creados en total</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight italic uppercase opacity-70">Tus Eventos</h2>
                <div className="grid gap-4">
                    {events.length > 0 ? (
                        events.map((event: any) => {
                            const stock = event.ticketTypes.reduce((acc: any, t: any) => acc + t.totalDisponibles, 0)
                            const sold = event.ticketTypes.reduce((acc: any, t: any) => acc + (t._count?.tickets || 0), 0)
                            const progress = stock > 0 ? (sold / stock) * 100 : 0

                            const statusColors = {
                                PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                                APPROVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                                REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
                                CANCELLED: 'bg-destructive/10 text-destructive border-destructive/20'
                            }

                            return (
                                <Card key={`${event.isCoOrg ? 'co' : 'own'}-${event.id}`} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-colors shadow-lg">
                                    <div className="flex flex-col md:flex-row md:items-center p-6 gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                <h3 className="font-bold text-lg">{event.title}</h3>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-black border ${statusColors[event.status as keyof typeof statusColors]}`}>
                                                    {event.status === 'PENDING' ? 'En Revisión' :
                                                     event.status === 'APPROVED' ? 'Aprobado' :
                                                     event.status === 'CANCELLED' ? 'Cancelado' : 'Rechazado'}
                                                </span>
                                                {event.isCoOrg && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-black border bg-primary/10 text-primary border-primary/20">
                                                        <Users className="h-3 w-3" /> Co-org
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-6 gap-y-2">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {event.startDate.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Ticket className="h-3 w-3" />
                                                    {sold} / {stock} vendidos
                                                </span>
                                                <span className="flex items-center gap-1 italic">
                                                    {event.location}
                                                </span>
                                            </div>

                                            {event.status === 'REJECTED' && event.rejectionReason && (
                                                <div className="mt-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-xs text-red-400 italic">
                                                    <strong>Motivo del rechazo:</strong> {event.rejectionReason}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 relative z-20">
                                            {!event.isCoOrg && (
                                                <>
                                                    <Link 
                                                        href={`/dashboard/events/${event.id}/edit`}
                                                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2 bg-background/50 relative z-20")}
                                                    >
                                                        <Edit className="h-3.5 w-3.5" /> Editar
                                                    </Link>
                                                    <div className="relative z-20">
                                                        <DeleteEventButton eventId={event.id} />
                                                    </div>
                                                </>
                                            )}
                                            {event.isCoOrg && (
                                                <Link 
                                                    href={`/dashboard/events/${event.id}/checkin`}
                                                    className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-2 relative z-20")}
                                                >
                                                    Check-in
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-1 bg-border/20 w-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </Card>
                            )
                        })
                    ) : (
                        <Card className="border-border/50 bg-card/30 border-dashed py-16 flex flex-col items-center justify-center text-center shadow-xl">
                            <Calendar className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                            <CardTitle className="mb-2 italic text-2xl font-bold">No has creado eventos todavía</CardTitle>
                            <CardDescription className="mb-8 max-w-sm mx-auto">Empieza a vender entradas hoy mismo creando tu primer evento. Nuestro equipo lo revisará en menos de 24h.</CardDescription>
                            <Link 
                                href="/dashboard/events/create"
                                className={cn(buttonVariants({ variant: "default", size: "lg" }), "bg-primary text-primary-foreground font-bold px-8")}
                            >
                                Crear Mi Primer Evento
                            </Link>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

