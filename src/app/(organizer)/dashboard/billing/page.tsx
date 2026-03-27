import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Building, ShieldCheck, AlertCircle, Clock } from "lucide-react"

export const dynamic = "force-dynamic";

export default async function BillingPage() {
    let user = null;
    let targetUser = null;

    try {
        const supabase = await createClient();
        const { data } = await supabase.auth.getUser();
        user = data?.user ?? null;
    } catch { redirect("/login"); }

    if (!user) redirect("/login");

    try {
        targetUser = await prisma.user.findUnique({ where: { id: user.id } });
    } catch { redirect("/dashboard"); }

    if (!targetUser || targetUser.organizerStatus !== 'APPROVED') {
        redirect("/profile");
    }

    const isConnected = targetUser.chargesEnabled;
    const stripeAccountId = targetUser.stripeAccountId;

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Facturación y Pagos</h1>
                <p className="text-muted-foreground">Gestiona la cuenta bancaria donde recibirás el 95% del dinero de tus entradas vendidas.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            Cuenta de Cobro
                        </CardTitle>
                        <CardDescription>
                            SoundTicket opera sobre Stripe Connect para automatizar tus pagos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isConnected ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-4">
                                    <ShieldCheck className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-green-500">Cuenta Verificada y Activa</h4>
                                        <p className="text-xs text-green-500/80 mt-1">
                                            Estás listo para vender entradas. El dinero se transferirá automáticamente a la cuenta que configuraste en Stripe.
                                        </p>
                                    </div>
                                </div>
                                <form action="/api/stripe/connect/login" method="POST">
                                    <Button type="submit" variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10">
                                        Acceder a tu Panel de Stripe Express
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-4">
                                    <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-yellow-500">Configuración Pendiente</h4>
                                        <p className="text-xs text-yellow-500/80 mt-1">
                                            Debes añadir tus datos bancarios y verificar tu identidad mediante el asistente seguro de Stripe antes de poder publicar eventos en SoundTicket.
                                        </p>
                                    </div>
                                </div>
                                <form action="/api/stripe/connect/onboarding" method="POST">
                                    <Button type="submit" className="w-full bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)]">
                                        <CreditCard className="w-4 h-4 mr-2" /> {stripeAccountId ? 'Continuar Configuración' : 'Configurar Cuenta Bancaria'}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/30 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            Condiciones Comerciales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p className="mb-4">
                            Al operar como organizador verificado en SoundTicket, accedes a un sistema de cobros delegados sin intermediación letárgica:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-6">
                            <li>Recibes el dinero del importe de tus entradas en tiempo real a medida que se venden (descontando comisiones de servicio).</li>
                            <li>SoundTicket retiene únicamente un <strong className="text-foreground">5% fijo</strong> en concepto de uso de plataforma y la cuota de la pasarela Stripe (aprox. 1.5% + 0.25€).</li>
                            <li>El control tecnológico y bancario, junto con el soporte para devoluciones, corre de parte de Stripe y tu panel transparente de analíticas.</li>
                        </ul>

                        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground flex items-center gap-2 mb-2">
                                <Clock className="w-3.5 h-3.5 text-primary" /> Plazos de Cobro (Stripe)
                            </h4>
                            
                            <div className="flex gap-3 items-start">
                                <span className="text-xl leading-none">🟢</span>
                                <div>
                                    <p className="font-bold text-foreground text-xs uppercase tracking-tight">Cuentas Nuevas o Recientes</p>
                                    <p className="text-[11px] leading-snug mt-0.5">
                                        <strong>Primer pago: entre 7 y 14 días.</strong> Stripe retiene por riesgo inicial para verificar tu identidad y cuenta bancaria. Esto es totalmente normal.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 items-start">
                                <span className="text-xl leading-none">🟡</span>
                                <div>
                                    <p className="font-bold text-foreground text-xs uppercase tracking-tight">Cuentas Verificadas</p>
                                    <p className="text-[11px] leading-snug mt-0.5">
                                        <strong>Pagos automáticos (España): 1–3 días laborables.</strong> Una vez superado el primer cobro, recibirás los fondos en tu banco (Santander, Revolut, BBVA, etc.) de forma recurrente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
