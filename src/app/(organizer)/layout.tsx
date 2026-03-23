import { LayoutDashboard, Calendar, Ticket, PlusCircle, Settings, LogOut, CreditCard, BarChart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"
// ... skipping to the nav section inside the sidebar to append the link
// Wait, I can't skip inside the replacement text, it's a direct replacement of lines 1-60! I should just replace the exact block.
import { createClient } from "@/utils/supabase/server"
import { logout } from "@/app/auth/actions"
import prisma from "@/lib/prisma"

export default async function OrganizerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let dbUser = null
    if (user) {
        dbUser = await prisma.user.findUnique({
            where: { id: user.id }
        })
    }

    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-background">
            {/* Sidebar Organizer */}
            <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-card/30 backdrop-blur-xl px-4 py-6 sticky top-16 h-[calc(100vh-4rem)]">
                <div className="mb-4 px-2 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/30 shrink-0">
                        {dbUser?.avatar ? (
                            <img src={dbUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            user?.email?.[0].toUpperCase()
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-medium leading-none mb-1 truncate text-sm">{user?.user_metadata?.full_name || 'Organizador'}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>

                <div className="mb-8 px-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4 opacity-50">Panel de Control</p>
                    <nav className="space-y-1">
                        <Link 
                            href="/dashboard"
                            className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start hover:bg-primary/10 hover:text-primary font-medium text-sm h-9")}
                        >
                            <LayoutDashboard className="mr-3 h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link 
                            href="/dashboard/events"
                            className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start hover:bg-primary/10 hover:text-primary font-medium text-sm h-9")}
                        >
                            <Calendar className="mr-3 h-4 w-4" />
                            Mis Eventos
                        </Link>
                        <Link 
                            href="/dashboard/analytics"
                            className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start hover:bg-primary/10 hover:text-primary font-medium text-sm h-9")}
                        >
                            <BarChart className="mr-3 h-4 w-4" />
                            Analíticas
                        </Link>
                        <Link 
                            href="/dashboard/billing"
                            className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start hover:bg-primary/10 hover:text-primary font-medium text-sm h-9")}
                        >
                            <CreditCard className="mr-3 h-4 w-4" />
                            Facturación
                        </Link>
                    </nav>
                </div>

                <div className="px-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4 opacity-50">Acciones Rápidas</p>
                    <nav className="space-y-1">
                        <Link 
                            href="/dashboard/events/create"
                            className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start hover:bg-primary/10 hover:text-primary font-medium text-sm h-9")}
                        >
                            <PlusCircle className="mr-3 h-4 w-4" />
                            Crear Evento
                        </Link>
                    </nav>
                </div>

                <div className="px-2 mt-4 pt-4 border-t border-border/40">
                    <Link 
                        href="/profile"
                        className={cn(buttonVariants({ variant: "secondary" }), "w-full justify-start bg-secondary/50 hover:bg-primary hover:text-primary-foreground border-none text-xs")}
                    >
                        <Ticket className="mr-3 h-4 w-4" />
                        Modo Usuario
                    </Link>
                </div>

                <div className="mt-auto border-t border-border/40 pt-4 px-2">
                    <Link 
                        href="/profile/settings"
                        className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start hover:bg-primary/10 hover:text-primary font-medium text-sm h-9 mb-1")}
                    >
                        <Settings className="mr-3 h-4 w-4" />
                        Configuración
                    </Link>
                    <form action={logout}>
                        <Button type="submit" variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive text-sm h-9">
                            <LogOut className="mr-3 h-4 w-4" />
                            Cerrar Sesión
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
                {children}
            </main>
        </div>
    )
}
