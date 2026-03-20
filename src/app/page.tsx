export const dynamic = "force-dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  let user = null;
  let featuredEvents: any[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch { /* degradación elegante */ }

  try {
    featuredEvents = await prisma.event.findMany({
      where: { isPublished: true },
      include: {
        ticketTypes: { orderBy: { price: 'asc' }, take: 1 }
      },
      take: 6,
      orderBy: { createdAt: 'desc' }
    }) ?? [];
  } catch (err) {
    console.error('[Home] Prisma error:', err);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex items-center justify-center min-h-[80vh]">
        {/* Abstract Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

        <div className="container px-4 md:px-6 relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Revolucionando el Ticketing
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight italic">
            Descubre eventos, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-primary">
              sin comisiones ocultas.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            La plataforma diseñada para artistas, promotores y fans. Más transparente, más rápida y con la mejor experiencia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/explore">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all hover:scale-105 font-bold uppercase tracking-tight">
                Explorar Eventos
              </Button>
            </Link>
            <Link href={user ? "/organizer" : "/login?next=/organizer"}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-10 border-border bg-background/50 backdrop-blur-sm hover:bg-accent/50 transition-all font-bold uppercase tracking-tight italic">
                Soy Organizador
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-background relative z-10">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Eventos Destacados</h2>
              <p className="text-muted-foreground">No te pierdas las experiencias más populares del momento.</p>
            </div>
            <Link href="/explore">
              <Button variant="ghost" className="group flex items-center pr-0 hover:bg-transparent hover:text-primary">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredEvents.map((event) => {
                const minPrice = event.ticketTypes[0]?.price || 0;

                return (
                  <Card key={event.id} className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--primary),0.15)] rounded-xl flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {/* Using a placeholder if no image exists or use the stored URL */}
                      <img
                        src={event.coverImage || `https://images.unsplash.com/photo-1540039155732-d674d40d12ce?q=80&w=800&auto=format&fit=crop`}
                        alt={event.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
                    </div>

                    <CardContent className="pt-6 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold mb-3 line-clamp-1">{event.title}</h3>
                      <div className="flex flex-col gap-2 text-muted-foreground text-sm flex-1">
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                          {event.startDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          {event.location}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-4 pb-6 border-t border-border/50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Desde</span>
                        <span className="text-xl font-bold text-foreground">{minPrice.toFixed(2)}€</span>
                      </div>
                      <Link href={`/event/${event.id}`}>
                        <Button className="bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-colors group-hover:shadow-[0_0_15px_rgba(var(--primary),0.4)]">
                          Ver Detalles
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground italic">No hay eventos publicados por ahora. ¡Vuelve pronto!</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action for Organizers */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">¿Organizas eventos?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Toma el control de tu ticketing. Crea eventos en minutos, accede a tus fondos rápidamente y deja de pagar comisiones abusivas.
          </p>
          <Link href={user ? "/organizer" : "/login?next=/organizer"}>
            <Button size="lg" className="text-lg h-14 px-10 bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-black transition-all hover:scale-105 shadow-xl">
              Empieza Gratis
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

