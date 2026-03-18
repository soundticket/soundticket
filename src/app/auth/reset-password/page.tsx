import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Ticket } from "lucide-react"
import { updatePassword } from "../actions-password"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const params = await searchParams
    const supabase = await createClient()

    // Ensure the user actually has a valid session (even if it's the temporary recovery one)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        // If there's no session, the link might be expired or invalid
        redirect('/auth/forgot-password?error=Enlace+inválido+o+caducado.+Por+favor,+solicita+otro.')
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <Card className="w-full max-w-md bg-card/40 backdrop-blur-xl border-border/50 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                
                <CardHeader className="space-y-2 text-center pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="bg-primary/10 p-4 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                            <Ticket className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight italic">
                        Nueva Contraseña
                    </CardTitle>
                    <CardDescription className="text-secondary/70 max-w-sm mx-auto">
                        Establece tu nueva contraseña segura.
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    {params.error && (
                        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
                            {params.error}
                        </div>
                    )}
                    
                    <form action={updatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-secondary/80">
                                Nueva Contraseña
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    className="pl-9 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                                />
                            </div>
                        </div>
                        
                        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                            Actualizar Contraseña
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
