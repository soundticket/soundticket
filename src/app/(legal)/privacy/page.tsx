export default function PrivacyPage() {
    return (
        <div className="flex flex-col min-h-screen py-20 px-4">
            <div className="container mx-auto max-w-3xl prose prose-invert prose-primary">
                <h1 className="text-4xl font-black italic mb-10 tracking-tighter">Política de <span className="text-primary">Privacidad</span></h1>

                <p className="text-muted-foreground italic mb-8">Última actualización: 17 de marzo de 2026</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">1. Datos que Recopilamos</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Para ofrecerte una experiencia fluida, recopilamos información básica como tu nombre, correo electrónico y detalles de compra. En el caso de los organizadores, recopilamos información fiscal y de contacto necesaria para procesar pagos de forma legal.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">2. Uso de la Información</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Tus datos se utilizan exclusivamente para:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4 ml-4">
                        <li>Procesar y enviarte tus entradas QR.</li>
                        <li>Facilitar la gestión de asistentes al organizador del evento.</li>
                        <li>Mejorar nuestra plataforma mediante analíticas anónimas.</li>
                        <li>Cumplir con obligaciones legales y fiscales.</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">3. Compartición de Datos</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        SoundTicket NO vende tus datos a terceros. Compartimos la información necesaria con el organizador del evento al que asistes para que pueda gestionar el acceso a su recinto. También usamos proveedores de confianza como Stripe (pagos) y Resend (emails).
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">4. Tus Derechos (GDPR/RGPD)</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Tienes derecho a acceder, rectificar o eliminar tus datos personales en cualquier momento. Puedes ejercer estos derechos desde tu panel de perfil o contactándonos directamente.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">5. Seguridad</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Implementamos medidas de seguridad de nivel bancario, incluyendo cifrado SSL/TLS y almacenamiento seguro en Supabase, para proteger tu información personal contra accesos no autorizados.
                    </p>
                </section>

                <div className="mt-20 p-8 border border-border/40 rounded-2xl bg-card/20 text-center">
                    <p className="text-sm text-muted-foreground italic">
                        Tu privacidad es nuestra prioridad. <span className="text-primary font-bold">legal@soundticket.es</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
