import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, Mail, MessageSquare, BookOpen, AlertCircle, Users, LayoutDashboard, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function HelpCenterPage() {
    const buyFAQs = [
        {
            q: "¿Cómo recibo mi entrada?",
            a: "Una vez completado el pago, recibirás un email con un código QR. También puedes acceder a tus entradas iniciando sesión en tu perfil de SoundTicket.",
        },
        {
            q: "¿Puedo solicitar un reembolso?",
            a: "La política de devoluciones depende del organizador de cada evento. Si el evento es cancelado o pospuesto, el reembolso se procesará automáticamente.",
        },
        {
            q: "He perdido mi email de confirmación, ¿qué hago?",
            a: "No te preocupes. Inicia sesión con el email que usaste para la compra y encontrarás tu entrada lista para descargar en la sección 'Mis Entradas'.",
        },
    ];

    const organizeFAQs = [
        {
            q: "¿Cuándo recibo el dinero de las ventas?",
            a: "Los fondos se transfieren automáticamente a tu cuenta bancaria vinculada a través de Stripe de acuerdo a tu ciclo de pagos (diario o semanal).",
        },
        {
            q: "¿Cómo funciona el escaneo de entradas?",
            a: "Solo necesitas un smartphone con cámara. Entra en tu panel de control, selecciona tu evento y activa el escáner web. Es ultra-rápido y funciona en cualquier navegador moderno.",
        },
        {
            q: "¿Puedo editar un evento ya publicado?",
            a: "Sí, puedes modificar la descripción, imágenes e incluso añadir nuevos tipos de entrada en cualquier momento desde tu panel.",
        },
    ];

    return (
        <div className="flex flex-col min-h-screen py-20 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="text-center mb-20 space-y-6">
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter">¿En qué podemos <span className="text-primary">ayudarte?</span></h1>
                    <div className="relative max-w-lg mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Busca tu duda (ej: reembolsos, escaneo...)" className="h-14 pl-12 bg-card/40 border-border/50 rounded-2xl shadow-xl" />
                    </div>
                </div>

                {/* Quick Access Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                    <Card className="bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer group">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <BookOpen className="h-8 w-8 text-primary" />
                            <CardTitle className="text-xl font-bold italic">Guía del Comprador</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            Aprende cómo comprar, gestionar tus entradas y resolver incidencias con tus pagos.
                        </CardContent>
                    </Card>
                    <Card className="bg-accent/10 border-border/50 hover:bg-accent/20 transition-colors cursor-pointer group">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <Zap className="h-8 w-8 text-primary" />
                            <CardTitle className="text-xl font-bold italic">Guía del Organizador</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            Todo sobre la creación de eventos, configuración de Stripe y control de accesos.
                        </CardContent>
                    </Card>
                </div>

                {/* FAQs Sections */}
                <div className="space-y-16 mb-20">
                    <section>
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <Users className="h-6 w-6 text-primary" />
                            Para Compradores
                            <span className="h-[1px] flex-1 bg-border/40 ml-4 line" />
                        </h2>
                        <Accordion type="single" collapsible className="w-full space-y-2">
                            {buyFAQs.map((faq, i) => (
                                <AccordionItem key={i} value={`buy-${i}`} className="border-border/40 bg-card/20 rounded-xl px-4">
                                    <AccordionTrigger className="text-left font-semibold hover:no-underline hover:text-primary transition-colors py-4">
                                        {faq.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <LayoutDashboard className="h-6 w-6 text-primary" />
                            Para Organizadores
                            <span className="h-[1px] flex-1 bg-border/40 ml-4" />
                        </h2>
                        <Accordion type="single" collapsible className="w-full space-y-2">
                            {organizeFAQs.map((faq, i) => (
                                <AccordionItem key={i} value={`org-${i}`} className="border-border/40 bg-card/20 rounded-xl px-4">
                                    <AccordionTrigger className="text-left font-semibold hover:no-underline hover:text-primary transition-colors py-4">
                                        {faq.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </section>
                </div>

                {/* Support Contact */}
                <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 text-center space-y-8 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10" />
                    <AlertCircle className="h-12 w-12 text-primary mx-auto opacity-50" />
                    <div>
                        <h2 className="text-2xl font-bold mb-2">¿Sigues con dudas?</h2>
                        <p className="text-muted-foreground">Nuestro equipo técnico está listo para ayudarte 24/7.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button className="h-12 px-8 font-bold gap-2">
                            <Mail className="h-4 w-4" /> soporte@soundticket.es
                        </Button>
                        <Button variant="outline" className="h-12 px-8 font-bold gap-2 border-border/50">
                            <MessageSquare className="h-4 w-4 text-primary" /> Live Chat
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
