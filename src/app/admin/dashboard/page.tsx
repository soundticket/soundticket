import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Ticket, Wallet, Activity, BarChart3, Clock, ShoppingCart } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (dbUser?.role !== 'ADMIN') redirect("/profile")

    // --- REAL STATS ---
    const totalOrders: any = await prisma.$queryRaw`SELECT "totalPrice" FROM "Order" WHERE "status"::text = 'PAID'`
    const grossRevenue = totalOrders.reduce((acc: number, o: any) => acc + (o.totalPrice || 0), 0)
    const soundticketRevenue = grossRevenue * 0.05
    const totalUsers = await prisma.user.count()

    const pendingEventsResult: any = await prisma.$queryRaw`SELECT count(*) FROM "Event" WHERE "status"::text = 'PENDING'`
    const pendingEventsCount = Number(pendingEventsResult[0].count)

    const pendingOrganizersResult: any = await prisma.$queryRaw`SELECT count(*) FROM "User" WHERE "organizerStatus"::text = 'PENDING'`
    const pendingOrganizersCount = Number(pendingOrganizersResult[0].count)

    const totalTicketsSold = await prisma.ticket.count()

    // --- GROWTH CHART (real: 5% revenue by day in last 30 days) ---
    const lastDays: any = await prisma.$queryRaw`
        SELECT DATE("createdAt") as day, SUM("totalPrice" * 0.05) as total
        FROM "Order"
        WHERE "status"::text = 'PAID'
          AND "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE("createdAt")
        ORDER BY day ASC
        LIMIT 12
    `
    const maxTotal = lastDays.reduce((m: number, r: any) => Math.max(m, parseFloat(r.total || 0)), 1)
    const chartData = lastDays.map((r: any) => ({
        day: new Date(r.day).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        total: parseFloat(r.total || 0),
        pct: Math.round((parseFloat(r.total || 0) / maxTotal) * 100) || 5
    }))

    // --- RECENT ACTIVITY (real data) ---
    const recentOrders: any = await prisma.$queryRaw`
        SELECT o.id, o."totalPrice", o."createdAt", e.title as event_title
        FROM "Order" o
        JOIN "Event" e ON o."eventId" = e.id
        WHERE o."status"::text = 'PAID'
        ORDER BY o."createdAt" DESC
        LIMIT 3
    `
    const recentPendingOrgs: any = await prisma.$queryRaw`
        SELECT name, "createdAt" FROM "User"
        WHERE "organizerStatus"::text = 'PENDING'
        ORDER BY "createdAt" DESC
        LIMIT 2
    `
    const recentPendingEvents: any = await prisma.$queryRaw`
        SELECT title, "createdAt" FROM "Event"
        WHERE "status"::text = 'PENDING'
        ORDER BY "createdAt" DESC
        LIMIT 2
    `

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight">Panel de <span className="text-primary">Admin</span></h1>
                    <p className="text-muted-foreground">Monitoriza ingresos y gestiona la plataforma.</p>
                </div>
                <div className="flex bg-card/40 border border-border/50 rounded-xl p-1 gap-1">
                    <Button variant="ghost" size="sm" className="bg-primary/10 text-primary">Overview</Button>
                    <Link href="/admin/events">
                        <Button variant="ghost" size="sm">Eventos</Button>
                    </Link>
                    <Link href="/admin/organizers">
                        <Button variant="ghost" size="sm">Organizadores</Button>
                    </Link>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-primary/10 border-primary/20 shadow-xl overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                        <Wallet className="w-24 h-24" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-widest text-primary/70">Beneficio (5%)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic text-primary">{soundticketRevenue.toFixed(2)} €</div>
                        <p className="text-xs text-muted-foreground mt-1">De {grossRevenue.toFixed(2)} € brutos</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden group transition-all hover:border-primary/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Entradas Vendidas</CardTitle>
                        <Ticket className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic">{totalTicketsSold}</div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total acumulado</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden group transition-all hover:border-primary/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Eventos Pendientes</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic">{pendingEventsCount}</div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">A espera de aprobación</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border/50 shadow-lg group transition-all hover:border-primary/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                        <Users className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">{pendingOrganizersCount} organizadores pendientes</p>
                    </CardContent>
                </Card>
            </div>

            {/* Growth Chart + Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2 bg-card/40 border-border/50 shadow-xl min-h-[300px] flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold italic">Curva de Ingresos</CardTitle>
                                <CardDescription>Ventas brutas en los últimos 12 días con actividad.</CardDescription>
                            </div>
                            <BarChart3 className="text-muted-foreground/30 h-8 w-8" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end">
                        {chartData.length > 0 ? (
                            <>
                                <div className="flex items-end justify-between gap-2 h-48 w-full">
                                    {chartData.map((d: any, i: number) => (
                                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group/bar">
                                            <div
                                                className="w-full bg-primary/20 rounded-t-sm hover:bg-primary transition-colors relative"
                                                style={{ height: `${d.pct}%` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background border border-border p-1 text-[10px] rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {d.total.toFixed(2)}€
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between gap-2 mt-2">
                                    {chartData.map((d: any, i: number) => (
                                        <div key={i} className="flex-1 text-center text-[9px] text-muted-foreground truncate">
                                            {d.day}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/50 gap-3">
                                <BarChart3 className="h-12 w-12 opacity-20" />
                                <p className="text-sm">Sin ventas en los últimos 12 días</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-border/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold italic">Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {recentOrders.length === 0 && recentPendingOrgs.length === 0 && recentPendingEvents.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">Sin actividad reciente</p>
                        ) : (
                            <>
                                {recentOrders.map((o: any) => (
                                    <div key={o.id} className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <ShoppingCart className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold">Venta realizada</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                "{o.event_title}" · +{(o.totalPrice * 0.05).toFixed(2)} € comisión
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {recentPendingOrgs.map((org: any) => (
                                    <div key={org.name} className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold">Nuevo organizador</p>
                                            <p className="text-xs text-muted-foreground truncate">"{org.name}" ha solicitado unirse</p>
                                        </div>
                                    </div>
                                ))}
                                {recentPendingEvents.map((ev: any) => (
                                    <div key={ev.title} className="flex gap-4">
                                        <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-yellow-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold">Evento pendiente</p>
                                            <p className="text-xs text-muted-foreground truncate">"{ev.title}" espera aprobación</p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
