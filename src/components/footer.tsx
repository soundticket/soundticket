import Link from "next/link";
import { Github, Twitter, Instagram } from "lucide-react";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="w-full border-t border-border/40 bg-background py-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="flex items-center">
                            <Image src="/icon.png" alt="SoundTicket" width={36} height={36} className="h-9 w-9 object-contain" />
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            La plataforma de ticketing diseñada para la escena. Descubre, compra y organiza eventos con las comisiones más bajas.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-foreground/90">Eventos</h3>
                        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <li><Link href="/explore" className="hover:text-primary transition-colors">Explorar todo</Link></li>
                            <li><Link href="/explore?category=music" className="hover:text-primary transition-colors">Conciertos</Link></li>
                            <li><Link href="/explore?category=club" className="hover:text-primary transition-colors">Clubbing</Link></li>
                            <li><Link href="/explore?category=art" className="hover:text-primary transition-colors">Arte & Cultura</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-foreground/90">Organizadores</h3>
                        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <li><Link href="/organizer" className="hover:text-primary transition-colors">¿Por qué SoundTicket?</Link></li>
                            <li><Link href="/pricing" className="hover:text-primary transition-colors">Precios y Comisiones</Link></li>
                            <li><Link href="/features" className="hover:text-primary transition-colors">Panel de Control</Link></li>
                            <li><Link href="/help" className="hover:text-primary transition-colors">Centro de Ayuda</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-foreground/90">Síguenos</h3>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="p-2 rounded-md hover:bg-primary/20 hover:text-primary transition-colors text-muted-foreground">
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="#" className="p-2 rounded-md hover:bg-primary/20 hover:text-primary transition-colors text-muted-foreground">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="#" className="p-2 rounded-md hover:bg-primary/20 hover:text-primary transition-colors text-muted-foreground">
                                <Github className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} SoundTicket. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/terms" className="hover:text-primary transition-colors">Términos</Link>
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacidad</Link>
                        <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
