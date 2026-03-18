import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MapPin, Users, Share2, Heart, Clock, Ticket as TicketIcon } from "lucide-react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TicketSelector } from "@/components/ticket-selector";
import { EventActions } from "@/components/event-actions";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            ticketTypes: true,
            organizer: {
                select: {
                    name: true,
                    avatar: true
                }
            },
            _count: {
                select: { orders: true }
            }
        }
    });

    const isCancelled = (event?.status as string) === 'CANCELLED';
    if (!event || (!event.isPublished && !isCancelled)) {
        notFound();
    }

    const isPast = event.startDate < new Date();
    const canBuyTickets = !isCancelled && !isPast;

    const startDate = event.startDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const startTime = event.startDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Header */}
            <div className="relative h-[50vh] min-h-[400px] w-full">
                <img
                    src={event.coverImage || `https://images.unsplash.com/photo-1540039155732-d674d40d12ce?q=80&w=1200&auto=format&fit=crop`}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
                    <div className="container mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4 max-w-3xl">
                                <div className="flex flex-wrap gap-2">
                                    {isCancelled ? (
                                        <span className="bg-destructive px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-destructive-foreground shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                                            Cancelado
                                        </span>
                                    ) : isPast ? (
                                        <span className="bg-muted px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-border">
                                            Finalizado
                                        </span>
                                    ) : (
                                        <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)]">
                                            Próximamente
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground drop-shadow-2xl">
                                    {event.title}
                                </h1>
                            </div>
                            <EventActions eventId={event.id} eventTitle={event.title} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-2xl">
                                        <CalendarDays className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg capitalize">{startDate}</h3>
                                        <div className="flex items-center text-muted-foreground">
                                            <Clock className="h-4 w-4 mr-2" />
                                            <span>{startTime} h</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-2xl">
                                        <MapPin className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{event.location}</h3>
                                        <p className="text-muted-foreground">Ver en mapa</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-2xl">
                                        <Users className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Organizado por</h3>
                                        <p className="text-muted-foreground">{event.organizer.name || 'SoundTicket Organizer'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-3 rounded-2xl">
                                        <TicketIcon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{event.ticketTypes.length} Clases de entradas</h3>
                                        <p className="text-muted-foreground">Desde {Math.min(...event.ticketTypes.map(t => t.price)).toFixed(2)}€</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">Sobre este evento</h2>
                            <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                                {event.description}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Tickets */}
                    <div className="space-y-6">
                        {canBuyTickets ? (
                            <Card className="border-border/50 bg-card/30 backdrop-blur-xl sticky top-24 shadow-2xl overflow-hidden">
                                <div className="h-2 bg-primary w-full" />
                                <CardContent className="p-8">
                                    <h3 className="text-2xl font-bold mb-6">Comprar Entradas</h3>

                                    <TicketSelector
                                        ticketTypes={event.ticketTypes.map(t => ({
                                            id: t.id,
                                            name: t.name,
                                            price: t.price,
                                            totalDisponibles: t.totalDisponibles,
                                            vendidos: t.vendidos
                                        }))}
                                        eventId={event.id}
                                    />

                                    <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-tighter">
                                        Pago seguro procesado por Stripe
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="border-border/50 bg-card/30 backdrop-blur-xl sticky top-24 shadow-2xl overflow-hidden grayscale">
                                <div className="h-2 bg-muted w-full" />
                                <CardContent className="p-8 text-center">
                                    <TicketIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                                    <h3 className="text-2xl font-bold mb-2">Venta Cerrada</h3>
                                    <p className="text-muted-foreground text-sm">
                                        {isCancelled ? 'Este evento ha sido cancelado por el organizador de manera permanente.' : 'Este evento ya ha finalizado, no hay entradas disponibles para la venta.'}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
