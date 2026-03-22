'use client'

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { User, LayoutDashboard, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function Navbar() {
    const [authUser, setAuthUser] = useState<any>(null);
    const [dbUser, setDbUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const fetchUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setAuthUser(user);

                if (user) {
                    const res = await fetch('/api/me');
                    if (res.ok) {
                        const data = await res.json();
                        setDbUser(data);
                    }
                }
            } catch (err) {
                // Graceful degradation — show logged-out state
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            fetchUser();
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
                <Link href="/" className="flex items-center mr-6">
                    <Image src="/icon.png" alt="SoundTicket" width={40} height={40} className="h-10 w-10 object-contain" priority />
                </Link>
                <nav className="hidden md:flex flex-1 items-center gap-6 text-sm font-medium">
                    <Link href="/explore" className="transition-colors hover:text-primary text-foreground/80">
                        Explorar Eventos
                    </Link>
                    <Link href="/pricing" className="transition-colors hover:text-primary text-foreground/80">
                        Precios
                    </Link>
                    {dbUser?.organizerStatus === 'APPROVED' ? (
                        <Link href="/dashboard" className="transition-colors hover:text-primary text-primary font-bold flex items-center gap-1">
                            <LayoutDashboard className="w-4 h-4" /> Panel Organizador
                        </Link>
                    ) : (
                        <Link href="/organizer" className="transition-colors hover:text-primary text-foreground/80">
                            Organizar
                        </Link>
                    )}
                    {dbUser?.role === 'ADMIN' && (
                        <Link href="/admin/dashboard" className="transition-colors hover:text-primary text-primary font-bold flex items-center gap-1 border-l border-border/50 pl-6">
                            <ShieldAlert className="w-4 h-4" /> Admin
                        </Link>
                    )}
                </nav>
                <div className="flex items-center gap-4 ml-auto">
                    {loading ? (
                        <div className="h-9 w-24 rounded-md bg-muted/30 animate-pulse" />
                    ) : authUser ? (
                        <Link
                            href="/profile"
                            className={cn(buttonVariants({ variant: "ghost" }), "flex items-center gap-2 hover:text-primary hover:bg-primary/10")}
                        >
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Mi Perfil</span>
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:flex hover:text-primary hover:bg-primary/10")}
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                href="/register"
                                className={cn(buttonVariants({ variant: "default" }), "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.5)]")}
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
