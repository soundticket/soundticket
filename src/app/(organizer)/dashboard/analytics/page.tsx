import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, Ticket, WalletCards, Percent, Info, Calendar, Users } from "lucide-react"

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const includeTickets = {
        ticketTypes: {
            include: {
                _count: { select: { tickets: true } },
                tickets: {
                    where: { isScanned: true },
                    select: { id: true }
                }
            }
        }
    }

    // Own events
    const ownEvents = await prisma.event.findMany({
        where: { organizerId: user.id },
        include: includeTickets,
        orderBy: { startDate: 'desc' }
    })

    // Co-organized events
    const coOrgRows = await (prisma.eventCoOrganizer as any).findMany({
        where: { userId: user.id },
        include: { event: { include: includeTickets } },
        orderBy: { createdAt: 'desc' }
    })
    const coOrgEvents = coOrgRows.map((row: any) => ({ ...row.event, isCoOrg: true }))

    const events = [
        ...ownEvents.map((e: any) => ({ ...e, isCoOrg: false })),
        ...coOrgEvents
    ]


    // Matemáticas globales
    let totalGross = 0;
    let totalTicketsSold = 0;
    let totalTicketsValidated = 0;
    let totalPlatformFee = 0;
    let totalStripeFee = 0;

    const eventStats = events.map(event => {
        let eventGross = 0;
        let eventTicketsSold = 0;
        let eventTicketsValidated = 0;
        let eventPlatformFee = 0;
        let eventStripeFee = 0;

        event.ticketTypes.forEach((tt: any) => {
            const sold = (tt as any)._count.tickets;
            const validated = tt.tickets.length;
            
            if (sold > 0) {
                const revenue = tt.price * sold;
                const platformFee = revenue * 0.05;
                const stripeFee = (tt.price * 0.015 + 0.25) * sold;

                eventGross += revenue;
                eventTicketsSold += sold;
                eventTicketsValidated += validated;
                eventPlatformFee += platformFee;
                eventStripeFee += stripeFee;
            }
        });

        const eventNet = eventGross - eventPlatformFee - eventStripeFee;

        totalGross += eventGross;
        totalTicketsSold += eventTicketsSold;
        totalTicketsValidated += eventTicketsValidated;
        totalPlatformFee += eventPlatformFee;
        totalStripeFee += eventStripeFee;

        return {
            ...event,
            stats: {
                gross: eventGross,
                sold: eventTicketsSold,
                validated: eventTicketsValidated,
                pending: eventTicketsSold - eventTicketsValidated,
                platformFee: eventPlatformFee,
                stripeFee: eventStripeFee,
                net: eventNet
            }
        };
    });

    const totalNet = totalGross - totalPlatformFee - totalStripeFee;
    const totalPending = totalTicketsSold - totalTicketsValidated;

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-black italic tracking-tight uppercase">
                    Analíticas <span className="text-primary">Financieras</span>
                </h1>
                <p className="text-muted-foreground font-medium mt-1">
                    Control absoluto de tus beneficios, desglose de comisiones y rendimiento de tus eventos.
                </p>
            </div>

            {/* Aviso Tranquilizador */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex gap-4 items-start shadow-sm">
                <div className="bg-primary/10 p-2 rounded-full shrink-0">
                    <Info className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-1">Transferencias Automáticas (Payouts)</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        El <strong>Beneficio Neto</strong> calculado se transfiere de forma <strong className="text-foreground">100% automática</strong> a la cuenta bancaria (IBAN) que vinculaste en tu Facturación. 
                        Stripe procesa los pagos y los deposita automáticamente en unos <strong>2-3 días hábiles</strong> tras la compra para superar los controles de seguridad contra fraudes. No necesitas solicitar extracciones manuales.
                    </p>
                </div>
            </div>

            {/* Global KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <WalletCards className="w-24 h-24" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-black uppercase tracking-widest text-muted-foreground">Beneficio Neto Estimado</CardDescription>
                        <CardTitle className="text-4xl font-black text-primary">{formatCurrency(totalNet)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs font-bold text-muted-foreground">Dinero final en tu banco</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-xl">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Ticket className="w-4 h-4" /> Entradas / Asistencia
                        </CardDescription>
                        <CardTitle className="text-3xl font-black">
                            {totalTicketsValidated} <span className="text-sm font-bold text-muted-foreground">/ {totalTicketsSold}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-emerald-500">{totalTicketsValidated} Validadas</span>
                            <span className="text-muted-foreground">{totalPending} Pendientes</span>
                        </div>
                        <div className="mt-2 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary" 
                                style={{ width: `${(totalTicketsValidated / (totalTicketsSold || 1)) * 100}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-xl">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Percent className="w-4 h-4" /> Comisiones Stripe
                        </CardDescription>
                        <CardTitle className="text-3xl font-black text-destructive/80">{formatCurrency(totalStripeFee)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs font-bold text-muted-foreground">Estimación 1.5% + 0.25€</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-xl">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" /> Fee Plataforma
                        </CardDescription>
                        <CardTitle className="text-3xl font-black">{formatCurrency(totalPlatformFee)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs font-bold text-muted-foreground">5% retenido por SoundTicket</p>
                    </CardContent>
                </Card>
            </div>

            {/* Listado de Eventos */}
            <div className="space-y-6">
                <h2 className="text-xl font-black uppercase tracking-widest border-b border-border/40 pb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" /> Rendimiento por Evento
                </h2>
                
                {eventStats.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No tienes eventos con entradas todavía.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {eventStats.map((event) => (
                            <Card key={event.id} className="bg-card/20 border-border/30 hover:bg-card/40 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            {event.coverImage ? (
                                                <img src={event.coverImage} alt={event.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                                                    <Ticket className="w-6 h-6 text-muted-foreground opacity-30" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-bold text-lg mb-1 line-clamp-1">{event.title}</h3>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                                        {event.stats.sold} Vendidas
                                                    </p>
                                                    <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">
                                                        {event.stats.validated} Validadas
                                                    </p>
                                                    <p className="text-[10px] uppercase font-bold tracking-widest text-orange-500/80">
                                                        {event.stats.pending} Pendientes
                                                    </p>
                                                </div>
                                                <div className="mt-2 h-1 w-full max-w-[200px] bg-muted/30 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-emerald-500 transition-all duration-1000"
                                                        style={{ width: `${(event.stats.validated / (event.stats.sold || 1)) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-8 items-center bg-background/50 p-4 rounded-xl border border-border/50 w-full md:w-auto">
                                            <div className="space-y-1 w-1/2 md:w-auto">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground break-words">Bruto</p>
                                                <p className="font-bold">{formatCurrency(event.stats.gross)}</p>
                                            </div>
                                            <div className="space-y-1 w-1/2 md:w-auto">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-destructive break-words">Fees</p>
                                                <p className="font-bold text-destructive text-sm opacity-80">
                                                    -{formatCurrency(event.stats.platformFee + event.stats.stripeFee)}
                                                </p>
                                            </div>
                                            <div className="space-y-1 w-full md:w-auto md:pl-4 md:border-l md:border-border/50 pt-2 md:pt-0 border-t border-border/50">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary break-words">Neto</p>
                                                <p className="font-black text-xl text-primary">{formatCurrency(event.stats.net)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
