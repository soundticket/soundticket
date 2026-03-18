import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CalendarDays, MapPin, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import prisma from "@/lib/prisma";

export default async function ExplorePage() {
    const events = await prisma.event.findMany({
        where: {
            isPublished: true
        },
        include: {
            ticketTypes: {
                orderBy: {
                    price: 'asc'
                },
                take: 1
            },
            organizer: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            startDate: 'asc'
        }
    });

    return (
        <div className="min-h-screen bg-background">
            <div className="container px-4 md:px-6 py-12">
                <div className="flex flex-col space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Explorar Eventos</h1>
                            <p className="text-muted-foreground">Encuentra tu próxima experiencia inolvidable.</p>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Buscar por nombre o lugar..." className="pl-10 bg-card/30 backdrop-blur-sm border-border/50" />
                            </div>
                            <Button variant="outline" size="icon" className="border-border/50 bg-card/30">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Grid */}
                    {events.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {events.map((event) => {
                                const minPrice = event.ticketTypes[0]?.price || 0;

                                return (
                                    <Card key={event.id} className="group overflow-hidden border-border/50 bg-card/40 backdrop-blur-md hover:border-primary/40 transition-all duration-300 rounded-xl flex flex-col">
                                        <Link href={`/event/${event.id}`} className="block">
                                            <div className="relative aspect-[16/9] overflow-hidden">
                                                <img
                                                    src={event.coverImage || `https://images.unsplash.com/photo-1540039155732-d674d40d12ce?q=80&w=800&auto=format&fit=crop`}
                                                    alt={event.title}
                                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                                            </div>
                                        </Link>

                                        <CardContent className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">
                                                    {event.organizer.name || "Organizador"}
                                                </span>
                                                <span className="text-xs font-medium text-foreground/70">
                                                    {event.startDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                            <Link href={`/event/${event.id}`}>
                                                <h3 className="text-xl font-bold mb-3 line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h3>
                                            </Link>
                                            <div className="flex flex-col gap-1.5 text-muted-foreground text-xs flex-1">
                                                <div className="flex items-center">
                                                    <MapPin className="h-3 w-3 mr-2 text-primary/70" />
                                                    <span className="line-clamp-1">{event.location}</span>
                                                </div>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="px-5 py-4 border-t border-border/20 flex items-center justify-between bg-card/20">
                                            <span className="text-lg font-bold">{minPrice > 0 ? `${minPrice.toFixed(2)}€` : 'Gratis'}</span>
                                            <Link href={`/event/${event.id}`}>
                                                <Button size="sm" variant="ghost" className="text-xs hover:text-primary hover:bg-primary/10 font-bold">
                                                    DETALLES
                                                </Button>
                                            </Link>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-border/30 rounded-2xl">
                            <CalendarDays className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-xl font-bold mb-2">No se encontraron eventos</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">Pronto tendremos nuevas experiencias para ti. ¡Vuelve en unos días!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
