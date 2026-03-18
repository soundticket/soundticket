export default function TermsPage() {
    return (
        <div className="flex flex-col min-h-screen py-20 px-4">
            <div className="container mx-auto max-w-3xl prose prose-invert prose-primary">
                <h1 className="text-4xl font-black italic mb-10 tracking-tighter">Términos de <span className="text-primary">Servicio</span></h1>

                <p className="text-muted-foreground italic mb-8">Última actualización: 17 de marzo de 2026</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">1. Aceptación de los Términos</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Al acceder y utilizar la plataforma SoundTicket (propiedad de HITSTAR ENTERTAINMENT), aceptas estar sujeto a estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no podrás utilizar nuestros servicios.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">2. Descripción del Servicio</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        SoundTicket es una plataforma tecnológica que facilita la venta de entradas para eventos organizados por terceros. SoundTicket NO es el organizador de los eventos y no se hace responsable de la cancelación o calidad de los mismos, salvo en lo estipulado por la ley aplicable.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">3. Comisiones y Pagos</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        SoundTicket aplica una comisión del 5% sobre el valor nominal de cada entrada vendida. Esta comisión incluye el uso de la plataforma y el soporte técnico. Los costes de procesamiento de pago (Stripe) son adicionales y se detallan en la sección de Precios para organizadores.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">4. Política de Devoluciones</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Dado que SoundTicket actúa como intermediario, las devoluciones están sujetas a la aprobación del organizador del evento, excepto en casos de cancelación total del evento, donde el reembolso se procesará de acuerdo a la normativa de espectáculos vigente.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">5. Propiedad Intelectual</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Todo el contenido, diseño gráfico, código y funcionalidades de la plataforma son propiedad exclusiva de SoundTicket o sus licenciantes y están protegidos por las leyes de propiedad intelectual internacionales.
                    </p>
                </section>

                <div className="mt-20 p-8 border border-border/40 rounded-2xl bg-card/20 text-center">
                    <p className="text-sm text-muted-foreground italic">
                        Para cualquier duda legal, puedes escribirnos a <span className="text-primary font-bold">legal@soundticket.es</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
