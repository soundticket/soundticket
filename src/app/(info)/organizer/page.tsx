import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Zap, Shield, BarChart3, Users, Smartphone, ArrowRight, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export default async function OrganizerPage() {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    let dbUser = null
    if (authUser) {
        dbUser = await prisma.user.findUnique({
            where: { id: authUser.id }
        })
    }

    const features = [
        // ... (existing features)
        {
            title: "Comisión Imbatible",
            description: "Aplica un 5% de comisión de plataforma por entrada. Desglosando con total claridad los gastos bancarios extra.",
            icon: Zap,
        },
        {
            title: "Tecnología de Vanguardia",
            description: "Plataforma ultra-rápida construida con Next.js 15 y Supabase para una fiabilidad total.",
            icon: Smartphone,
        },
        {
            title: "Control en Tiempo Real",
            description: "Monitoriza tus ventas y el flujo de asistentes en vivo desde cualquier dispositivo.",
            icon: BarChart3,
        },
        {
            title: "Escaneo QR Directo",
            description: "Valida entradas sin hardware costoso. Usa nuestra app web en cualquier smartphone.",
            icon: CheckCircle2,
        },
        {
            title: "Gestión de Comunidad",
            description: "Conoce a tu audiencia. Exporta datos de asistentes y crea listas de invitados fácilmente.",
            icon: Users,
        },
        {
            title: "Pagos Seguros",
            description: "Integración nativa con Stripe para que recibas tus fondos de forma rápida y segura.",
            icon: Shield,
        },
    ];

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
                </div>

                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                        La nueva era del <span className="text-primary">Ticketing</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                        Diseñada para organizadores que buscan eficiencia, transparencia y la mejor experiencia para su público.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {!authUser ? (
                            <>
                                <Link href="/register">
                                    <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(var(--primary),0.4)]">
                                        Empezar ahora
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-background/50 backdrop-blur-sm border-border/50">
                                        Ya tengo cuenta
                                    </Button>
                                </Link>
                            </>
                        ) : dbUser?.organizerStatus === 'APPROVED' ? (
                            <Link href="/dashboard">
                                <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(var(--primary),0.4)] gap-2">
                                    Ir a mi Panel <LayoutDashboard className="w-5 h-5" />
                                </Button>
                            </Link>
                        ) : dbUser?.organizerStatus === 'PENDING' ? (
                            <Button size="lg" disabled className="h-14 px-8 text-lg font-bold opacity-70">
                                Solicitud en revisión...
                            </Button>
                        ) : (
                            <Link href="/profile/organizer-request">
                                <Button size="lg" className="h-14 px-8 text-lg font-bold shadow-[0_0_20px_rgba(var(--primary),0.4)]">
                                    Solicitar ser Organizador
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-accent/5">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <Card key={i} className="bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all group shadow-xl">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                        <feature.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50" />

                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-4">Más directo, más rentable</h2>
                            <p className="text-muted-foreground">Compara SoundTicket con las ticketera tradicionales.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <span className="text-lg font-medium">Comisión fija de solo el 5%</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <span className="text-lg font-medium">Liquidez inmediata (vía Stripe)</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                    <span className="text-lg font-medium">Gestión total de tus datos</span>
                                </div>
                            </div>

                            <div className="bg-primary/10 rounded-2xl p-6 text-center border border-primary/20">
                                <span className="text-5xl font-black text-primary block mb-2">5%</span>
                                <span className="text-sm font-bold uppercase tracking-widest text-primary/80">De Plataforma</span>
                                <p className="mt-4 text-xs text-muted-foreground italic">
                                    * Más de +1.5% pasarela Stripe
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 italic">¿Listo para llevar tu evento al siguiente nivel?</h2>
                    <Link href="/register">
                        <Button size="lg" className="h-16 px-12 text-xl font-bold rounded-full hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(var(--primary),0.3)]">
                            Crear mi primer evento
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
