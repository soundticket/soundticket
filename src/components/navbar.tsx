import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Ticket, User, LayoutDashboard, ShieldAlert } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function Navbar() {
    let authUser = null;
    let dbUser = null;

    try {
        const supabase = await createClient();
        const { data } = await supabase.auth.getUser();
        authUser = data?.user ?? null;

        if (authUser) {
            dbUser = await prisma.user.findUnique({
                where: { id: authUser.id }
            });
        }
    } catch (err) {
        // In Edge/SSR context, gracefully degrade to logged-out state.
        console.error("[Navbar] Failed to fetch user data:", err);
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 mr-6">
                    <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
                        <Ticket className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-xl tracking-tight uppercase">SoundTicket</span>
                </Link>
                <nav className="hidden md:flex flex-1 items-center gap-6 text-sm font-medium">
                    <Link href="/explore" className="transition-colors hover:text-primary text-foreground/80">
                        Explorar Eventos
                    </Link>
                    <Link href="/pricing" className="transition-colors hover:text-primary text-foreground/80">
                        Precios
                    </Link>
                    {(dbUser as any)?.organizerStatus === 'APPROVED' ? (
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
                    {authUser ? (
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
