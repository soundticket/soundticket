import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, BarChart, Smartphone, Users, Globe, Zap, Settings, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function FeaturesPage() {
    const features = [
        {
            title: "Dashboard Intuitivo",
            description: "Visualiza el estado de todos tus eventos de un vistazo. Una interfaz limpia diseñada para la acción rápida.",
            icon: LayoutDashboard,
        },
        {
            title: "Analíticas en Tiempo Real",
            description: "Gráficos detallados de ventas por hora, origen demográfico e ingresos proyectados.",
            icon: BarChart,
        },
        {
            title: "Control de Accesos QR",
            description: "Convierte cualquier smartphone en un escáner profesional. Valida entradas offline y online sin esperas.",
            icon: Smartphone,
        },
        {
            title: "Base de Datos Propia",
            description: "Tus clientes son tuyos. Accede a los datos de contacto y historial de compra de tus asistentes.",
            icon: Users,
        },
        {
            title: "Venta Multicanal",
            description: "Integra tu ticketera en tu web propia o usa nuestra landing page optimizada para SEO.",
            icon: Globe,
        },
        {
            title: "Sincronización Instantánea",
            description: "Cambios en precios o stock se reflejan en milisegundos en todas las plataformas de venta.",
            icon: Zap,
        },
    ];

    return (
        <div className="flex flex-col min-h-screen py-20 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Hero Section */}
                <div className="text-center mb-20">
                    <span className="text-primary font-bold uppercase tracking-widest text-sm mb-4 block italic">Herramientas Profesionales</span>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Tu centro de operaciones <span className="text-primary underline decoration-primary/30">total.</span></h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Olvídate de las hojas de cálculo y los sistemas lentos. SoundTicket te da el poder de gestionar miles de entradas con la sencillez de un click.
                    </p>
                </div>

                {/* Dashboard Screenshot Placeholder */}
                <div className="relative rounded-3xl overflow-hidden border border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-24 aspect-video bg-gradient-to-br from-card/80 to-background/50 flex items-center justify-center p-8 group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LayoutDashboard className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold opacity-80 italic">Potente Panel de Control</h3>
                        <p className="text-muted-foreground max-w-sm text-sm">Gestiona ventas, edita eventos y analiza datos en tiempo real con nuestra interfaz de última generación.</p>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                    {features.map((feature, i) => (
                        <Card key={i} className="bg-card/40 backdrop-blur-md border-border/50 hover:bg-accent/5 transition-colors">
                            <CardHeader>
                                <feature.icon className="w-8 h-8 text-primary mb-2" />
                                <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Deep Dive - Control Scanners */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-primary/5 rounded-[40px] p-8 md:p-16 border border-primary/10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                            <ShieldCheck className="w-4 h-4" /> Seguridad Total
                        </div>
                        <h2 className="text-3xl font-black tracking-tight">Escaneo ultra-rápido sin fallos.</h2>
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-muted-foreground">
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                <p><strong className="text-foreground">Modo Offline:</strong> Sigue escaneando incluso si se cae el WiFi de la sala. Los datos se sincronizan al recuperar señal.</p>
                            </li>
                            <li className="flex gap-3 text-muted-foreground">
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                <p><strong className="text-foreground">Check-in de Grupos:</strong> Valida múltiples entradas de una sola compra con un solo escaneo. Ahorra tiempo en la puerta.</p>
                            </li>
                            <li className="flex gap-3 text-muted-foreground">
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                <p><strong className="text-foreground">Anti-Fraude:</strong> Detección instantánea de entradas duplicadas o canceladas.</p>
                            </li>
                        </ul>
                    </div>
                    <div className="aspect-[3/4] bg-stone-900 rounded-3xl border border-border/40 relative overflow-hidden flex items-center justify-center p-8 group overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/40 rounded-full blur-[80px] group-hover:bg-primary/60 transition-colors" />
                        <Smartphone className="w-32 h-32 text-primary opacity-50 relative z-10 animate-pulse" />
                        <div className="absolute bottom-10 left-0 right-0 text-center">
                            <span className="text-[10px] font-black tracking-widest uppercase text-white/40">SoundTicket Web Scanner v2.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
