import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import stripe from "@/lib/stripe"
import { CheckCircle2, Mail, Ticket } from "lucide-react"

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
    const { session_id } = await searchParams
    
    if (!session_id) {
        redirect("/")
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id)
        if (session.payment_status !== 'paid') {
            redirect("/")
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        // Determinar si es invitado basado en la base de datos o metadata
        const metadataUserId = session.metadata?.userId
        const isGuest = metadataUserId === 'guest' || !metadataUserId || !user;
        
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-card border border-border/50 rounded-2xl p-8 text-center shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mx-auto bg-primary/20 p-4 rounded-full w-fit mb-6">
                        <CheckCircle2 className="h-12 w-12 text-primary" />
                    </div>
                    
                    <h1 className="text-3xl font-bold mb-2">¡Compra completada!</h1>
                    <p className="text-muted-foreground mb-8">
                        Tu pago se ha procesado con éxito y tu entrada está lista.
                    </p>

                    {isGuest ? (
                        <div className="bg-secondary/50 rounded-xl p-4 flex flex-col items-center gap-3 mb-8 border border-border/50">
                            <Mail className="h-6 w-6 text-muted-foreground" />
                            <p className="text-sm">
                                Hemos enviado tu entrada al correo <strong>{session.customer_details?.email}</strong>. 
                                <br/><br/>
                                <span className="text-xs text-muted-foreground">Muéstrala en la puerta desde tu movil. No necesitas cuenta.</span>
                            </p>
                        </div>
                    ) : (
                        <div className="bg-secondary/50 rounded-xl p-4 flex flex-col items-center gap-3 mb-8 border border-border/50">
                            <Ticket className="h-6 w-6 text-muted-foreground" />
                            <p className="text-sm">
                                Tu entrada ha sido añadida a tu perfil y también se ha enviado un código QR a tu correo.
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {!isGuest && (
                            <Link 
                                href="/profile" 
                                className="w-full flex items-center justify-center h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                            >
                                Ver mis entradas
                            </Link>
                        )}
                        <Link 
                            href="/" 
                            className={`w-full flex items-center justify-center h-12 rounded-lg font-medium transition-colors ${!isGuest ? 'bg-secondary hover:bg-secondary/80 text-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)]'}`}
                        >
                            Explorar más eventos
                        </Link>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        console.error("Error retrieving session:", error)
        redirect("/")
    }
}
