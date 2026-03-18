import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CalendarDays, MapPin, Heart } from "lucide-react"

export default async function FavoritesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const favorites = await prisma.favorite.findMany({
        where: {
            userId: user.id
        },
        include: {
            event: {
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
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Remove favorites where the event is not published or cancelled
    // (We do this in memory to bypass Prisma enum cache locks)
    const validFavorites = favorites.filter(fav => {
        const ev = fav.event
        if (!ev) return false
        
        const isCancelled = (ev.status as string) === 'CANCELLED'
        if (!ev.isPublished && !isCancelled) return false
        return true
    })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mis Favoritos</h1>
                <p className="text-muted-foreground">Tus eventos guardados para no perderles la pista.</p>
            </div>

            {validFavorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {validFavorites.map((fav) => {
                        const event = fav.event
                        const minPrice = event.ticketTypes[0]?.price || 0
                        const isPast = event.startDate < new Date()
                        const isCancelled = (event.status as string) === 'CANCELLED'

                        return (
                            <Card key={fav.id} className={`group overflow-hidden border-border/50 bg-card/40 backdrop-blur-md hover:border-primary/40 transition-all duration-300 rounded-xl flex flex-col ${isPast || isCancelled ? 'grayscale-[0.5] opacity-80' : ''}`}>
                                <Link href={`/event/${event.id}`} className="block">
                                    <div className="relative aspect-[16/9] overflow-hidden">
                                        <img
                                            src={event.coverImage || `https://images.unsplash.com/photo-1540039155732-d674d40d12ce?q=80&w=800&auto=format&fit=crop`}
                                            alt={event.title}
                                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                                        
                                        {(isPast || isCancelled) && (
                                            <div className={`absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                                isCancelled
                                                ? 'border-red-500/50 text-red-500' 
                                                : 'border-border/50 text-foreground'
                                            }`}>
                                                {isCancelled ? 'Cancelado' : 'Finalizado'}
                                            </div>
                                        )}
                                        
                                        <div className="absolute top-4 left-4">
                                            <div className="bg-red-500 text-white rounded-full p-2 shadow-lg">
                                                <Heart className="w-4 h-4 fill-current" />
                                            </div>
                                        </div>
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
                                            <MapPin className="h-3 w-3 mr-2 text-primary/70 shrink-0" />
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
                        )
                    })}
                </div>
            ) : (
                <Card className="border-border/50 bg-card/30 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <Heart className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-xl font-bold mb-2">Sin favoritos guardados</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto">
                            Explora los eventos de SoundTicket y guárdalos en favoritos para no perderles la pista.
                        </p>
                        <Link href="/explore" className="mt-6">
                            <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                                Explorar Eventos
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
