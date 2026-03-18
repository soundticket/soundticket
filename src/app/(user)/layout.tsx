import { Ticket, Calendar, Settings, LogOut, User as UserIcon, PlusCircle, Heart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/server"
import { logout } from "@/app/auth/actions"
import prisma from "@/lib/prisma"

export default async function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const dbUser = user ? await prisma.user.findUnique({
        where: { id: user.id }
    }) : null

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-background">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-card/30 backdrop-blur-xl px-4 py-6 sticky top-16 h-[calc(100vh-4rem)]">
                <div className="mb-8 px-2 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
                        {dbUser?.avatar ? (
                            <img src={dbUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="h-5 w-5 text-primary" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium leading-none mb-1">Mi Cuenta</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                            {user?.email || "usuario@ejemplo.com"}
                        </p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <Link 
                        href="/profile"
                        className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start hover:bg-primary/10 hover:text-primary")}
                    >
                        <Ticket className="mr-2 h-4 w-4" />
                        Mis Entradas
                    </Link>
                    <Link 
                        href="/profile/history"
                        className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start hover:bg-primary/10 hover:text-primary")}
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        Historial
                    </Link>
                    <Link 
                        href="/profile/favorites"
                        className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start hover:bg-primary/10 hover:text-primary")}
                    >
                        <Heart className="mr-2 h-4 w-4" />
                        Mis Favoritos
                    </Link>
                    <Link 
                        href="/profile/settings"
                        className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start hover:bg-primary/10 hover:text-primary")}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Configuración
                    </Link>
                    <div className="pt-4 mt-4 border-t border-border/40">
                        {dbUser?.organizerStatus === 'APPROVED' ? (
                            <Link 
                                href="/dashboard"
                                className={cn(buttonVariants({ variant: "secondary" }), "w-full justify-start bg-secondary/50 hover:bg-primary hover:text-primary-foreground border-none")}
                            >
                                <UserIcon className="mr-2 h-4 w-4" />
                                Modo Organizador
                            </Link>
                        ) : dbUser?.organizerStatus === 'PENDING' ? (
                            <Button disabled variant="ghost" className="w-full justify-start text-yellow-500/70 border border-yellow-500/20 bg-yellow-500/5">
                                <Settings className="mr-2 h-4 w-4 animate-pulse" />
                                Pendiente Aprobación
                            </Button>
                        ) : (
                            <Link 
                                href="/profile/organizer-request"
                                className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start border-primary/30 text-primary hover:bg-primary hover:text-black transition-all duration-300")}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Ser Organizador
                            </Link>
                        )}
                    </div>
                </nav>

                <div className="mt-auto border-t border-border/40 pt-4">
                    <form action={logout}>
                        <Button type="submit" variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
