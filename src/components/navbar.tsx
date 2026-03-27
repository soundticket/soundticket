'use client'

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { User, LayoutDashboard, ShieldAlert, Menu, LogOut, Ticket, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Custom dropdown - avoids @base-ui/react crash
function ProfileDropdown({ authUser, dbUser, onSignOut }: { authUser: any; dbUser: any; onSignOut: () => void }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 hover:text-primary hover:bg-primary/10 transition-colors h-9 px-4 py-2 rounded-md text-sm font-medium"
            >
                <User className="h-4 w-4" />
                <span>Mi Perfil</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")} />
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border/50 bg-card/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-border/50">
                        <p className="text-sm font-medium leading-none">{dbUser?.name || "Usuario"}</p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">{authUser.email}</p>
                    </div>
                    <div className="py-1">
                        <a href="/profile" className="flex w-full items-center px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors gap-2">
                            <User className="h-4 w-4" /> Ver Perfil
                        </a>
                        <a href="/profile/history" className="flex w-full items-center px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors gap-2">
                            <Ticket className="h-4 w-4" /> Mis Entradas
                        </a>
                    </div>
                    <div className="border-t border-border/50 py-1">
                        <button
                            onClick={onSignOut}
                            className="flex w-full items-center px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors gap-2"
                        >
                            <LogOut className="h-4 w-4" /> Cerrar sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export function Navbar() {
    const [authUser, setAuthUser] = useState<any>(null);
    const [dbUser, setDbUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
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
                // Graceful degradation
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            fetchUser();
        });

        return () => listener.subscription.unsubscribe();
    }, [supabase.auth]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
                <Link href="/" className="flex items-center mr-6">
                    <Image src="/icon.png" alt="SoundTicket" width={40} height={40} className="h-10 w-10 object-contain" priority />
                </Link>
                
                {/* Desktop Navigation Links */}
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

                <div className="flex items-center gap-2 ml-auto">
                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-2">
                        {loading ? (
                            <div className="h-9 w-24 rounded-md bg-muted/30 animate-pulse" />
                        ) : authUser ? (
                            <ProfileDropdown authUser={authUser} dbUser={dbUser} onSignOut={handleSignOut} />
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className={cn(buttonVariants({ variant: "ghost" }), "hover:text-primary hover:bg-primary/10")}
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href="/register"
                                    className={cn(buttonVariants({ variant: "default" }), "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.5)]")}
                                >
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu (Sheet) */}
                    <div className="md:hidden flex items-center">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger className="hover:bg-primary/10 hover:text-primary transition-colors h-10 w-10 rounded-md inline-flex items-center justify-center active:scale-95 active:bg-primary/20">
                                <Menu className="h-7 w-7" />
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[85vw] sm:w-[350px] flex flex-col pt-12 px-6 border-l border-border/50 bg-background/95 backdrop-blur-xl h-full overflow-hidden">
                                <SheetHeader className="mb-6 shrink-0">
                                    <SheetTitle className="text-left flex items-center gap-3 font-bold text-xl italic">
                                        <Image src="/icon.png" alt="SoundTicket" width={24} height={24} className="h-6 w-6 object-contain" />
                                        SoundTicket
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="flex flex-col gap-6 text-[17px] font-medium flex-1 overflow-y-auto pb-safe pb-16 scrollbar-hide">
                                    <Link href="/explore" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors flex items-center py-2 active:opacity-50">Explorar Eventos</Link>
                                    <Link href="/pricing" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors flex items-center py-2 active:opacity-50">Precios</Link>
                                    
                                    {dbUser?.organizerStatus === 'APPROVED' ? (
                                        <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-primary hover:opacity-80 transition-opacity flex items-center py-2 gap-2 active:scale-95 origin-left">
                                            <LayoutDashboard className="w-5 h-5" /> Panel Organizador
                                        </Link>
                                    ) : (
                                        <Link href="/organizer" onClick={() => setIsOpen(false)} className="hover:text-primary transition-colors flex items-center py-2 active:opacity-50">Organizar Evento</Link>
                                    )}

                                    {dbUser?.role === 'ADMIN' && (
                                        <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className="text-primary font-bold hover:opacity-80 transition-opacity flex items-center py-2 gap-2 active:scale-95 origin-left">
                                            <ShieldAlert className="w-5 h-5" /> Admin Dashboard
                                        </Link>
                                    )}

                                    <div className="h-px bg-border/50 w-full my-2 shrink-0" />

                                    {loading ? (
                                        <div className="h-10 w-full bg-muted/30 animate-pulse rounded-md mt-2" />
                                    ) : authUser ? (
                                        <div className="flex flex-col gap-5 mt-2">
                                            <button onClick={() => { setIsOpen(false); window.location.href = '/profile'; }} className="flex items-center gap-3 hover:text-primary transition-colors py-2 active:opacity-50 text-left w-full">
                                                <User className="h-5 w-5" /> Mi Perfil
                                            </button>
                                            <button onClick={() => { setIsOpen(false); window.location.href = '/profile/history'; }} className="flex items-center gap-3 hover:text-primary transition-colors py-2 active:opacity-50 text-left w-full">
                                                <Ticket className="h-5 w-5" /> Mis Entradas
                                            </button>
                                            <button 
                                                onClick={() => { setIsOpen(false); handleSignOut(); }}
                                                className="flex items-center gap-3 text-red-500 text-left hover:text-red-400 transition-colors py-2 w-full mt-2 active:opacity-50"
                                            >
                                                <LogOut className="h-5 w-5" /> Cerrar sesión
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4 mt-2 mb-8">
                                            <Link
                                                href="/login"
                                                onClick={() => setIsOpen(false)}
                                                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full justify-center active:scale-[0.98]")}
                                            >
                                                Iniciar Sesión
                                            </Link>
                                            <Link
                                                href="/register"
                                                onClick={() => setIsOpen(false)}
                                                className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full justify-center bg-primary hover:bg-primary/90 active:scale-[0.98]")}
                                            >
                                                Crear Cuenta
                                            </Link>
                                        </div>
                                    )}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
