export default function CookiesPage() {
    return (
        <div className="flex flex-col min-h-screen py-20 px-4">
            <div className="container mx-auto max-w-3xl prose prose-invert prose-primary">
                <h1 className="text-4xl font-black italic mb-10 tracking-tighter">Política de <span className="text-primary">Cookies</span></h1>

                <p className="text-muted-foreground italic mb-8">Última actualización: 17 de marzo de 2026</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">¿Qué son las Cookies?</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Las cookies son pequeños archivos de texto que se almacenan en tu navegador cuando visitas nuestra plataforma. Nos ayudan a recordarte y a que la web funcione correctamente.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Uso de Cookies en SoundTicket</h2>
                    <p className="text-muted-foreground mb-4">Utilizamos tres tipos de cookies:</p>
                    <div className="space-y-6 ml-4">
                        <div className="flex gap-4">
                            <div className="h-6 w-6 rounded bg-primary/20 shrink-0 flex items-center justify-center text-[10px] font-bold text-primary">NEC</div>
                            <p className="text-muted-foreground text-sm"><strong className="text-foreground">Técnicas y Necesarias:</strong> Imprescindibles para que puedas iniciar sesión, comprar entradas y navegar de forma segura.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-6 w-6 rounded bg-accent/20 shrink-0 flex items-center justify-center text-[10px] font-bold text-primary">ANL</div>
                            <p className="text-muted-foreground text-sm"><strong className="text-foreground">Analíticas:</strong> Nos ayudan a entender cuánta gente nos visita y qué partes de la web fallan para poder arreglarlas.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="h-6 w-6 rounded bg-stone-800 shrink-0 flex items-center justify-center text-[10px] font-bold text-primary">PREF</div>
                            <p className="text-muted-foreground text-sm"><strong className="text-foreground">Preferencias:</strong> Guardan tu idioma elegido o el estado del modo oscuro.</p>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Cómo Controlar las Cookies</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Puedes bloquear o eliminar las cookies en cualquier momento desde la configuración de tu navegador. Ten en cuenta que, si desactivas las cookies necesarias, es posible que no puedas completar compras o acceder a tu perfil.
                    </p>
                </section>

                <div className="mt-20 p-8 border border-border/40 rounded-2xl bg-card/20 text-center">
                    <p className="text-sm text-muted-foreground italic">
                        Navegando por nuestra web, aceptas el uso de estas cookies. <span className="text-primary font-bold">legal@soundticket.es</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
