import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Info, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    return (
        <div className="flex flex-col min-h-screen py-20 px-4">
            <div className="container mx-auto max-w-5xl">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Simple. Transparente. <span className="text-primary italic">Justo.</span></h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Sin cuotas mensuales ni costes ocultos. Solo pagas cuando vendes.
                    </p>
                </div>

                {/* Main Pricing Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-20">
                    <Card className="bg-primary/5 border-primary/20 shadow-2xl flex flex-col justify-between overflow-hidden relative">
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-bl-lg">
                            Más Popular
                        </div>
                        <CardHeader className="pt-10">
                            <CardTitle className="text-3xl font-bold">Plan Eventos</CardTitle>
                            <CardDescription>Para promotores, salas y festivales</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-baseline gap-1">
                                <span className="text-7xl font-black text-primary">5%</span>
                                <span className="text-muted-foreground font-semibold">total</span>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span>Gestión de entradas ilimitada</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span>Panel de control en tiempo real</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span>Acceso a datos de clientes</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span>App de escaneo QR gratuita</span>
                                </li>
                            </ul>
                            <Link href="/register" className="block w-full">
                                <Button className="w-full h-14 text-lg font-bold mt-4" size="lg">
                                    Empezar a vender <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-6">
                        <Card className="bg-card/40 backdrop-blur-md border-border/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 italic font-bold">
                                    <Info className="h-6 w-6 text-primary" />
                                    ¿Qué incluye el 5%?
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                                <p>
                                    Nuestra comisión del 5% cubre **todo**: la infraestructura tecnológica, el soporte prioritario y las herramientas de marketing básico.
                                </p>
                                <p>
                                    A diferencia de otras plataformas, **no añadimos gastos de gestión** abusivos al comprador final. Tú decides si quieres absorber el 5% o añadirlo al precio base de la entrada.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="bg-accent/10 border border-dashed border-border p-6 rounded-xl space-y-4">
                            <h3 className="font-bold">Comisiones de Pago</h3>
                            <p className="text-sm text-muted-foreground italic">
                                * Se aplican las comisiones estándar de pasarela de pago (Stripe). Aproximadamente 1.4% + 0.25€ por transacción. Pagamos directamente a tu cuenta bancaria.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="bg-card/40 border border-border/50 rounded-2xl p-8 mb-20 overflow-x-auto">
                    <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-widest italic opacity-80">Por qué somos diferentes</h2>
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="border-b border-border/40">
                                <th className="py-4 font-semibold opacity-60">Concepto</th>
                                <th className="py-4 font-bold text-primary">SoundTicket</th>
                                <th className="py-4 font-semibold opacity-60">Otras Ticketera</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            <tr>
                                <td className="py-4">Comisión por entrada</td>
                                <td className="py-4 font-bold">5%</td>
                                <td className="py-4">8% - 15%</td>
                            </tr>
                            <tr>
                                <td className="py-4">Gastos de gestión ocultos</td>
                                <td className="py-4 font-bold">0 €</td>
                                <td className="py-4">1.50€ - 3.50€ / entrada</td>
                            </tr>
                            <tr>
                                <td className="py-4">Acceso a datos de clientes</td>
                                <td className="py-4 font-bold">Sí, 100%</td>
                                <td className="py-4">Limitado o de pago</td>
                            </tr>
                            <tr>
                                <td className="py-4">Tiempo de pago</td>
                                <td className="py-4 font-bold">Inmediato / semanal</td>
                                <td className="py-4">Tras finalizar el evento</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* FAQ Snippet */}
                <div className="text-center italic text-muted-foreground py-10">
                    <p>¿Tienes un volumen de ventas superior a 50.000€ anuales?</p>
                    <Link href="/help" className="text-primary hover:underline font-bold">Contacta con nosotros para un trato personalizado.</Link>
                </div>
            </div>
        </div>
    );
}
