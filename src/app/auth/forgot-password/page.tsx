import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Mail, Ticket } from "lucide-react"
import { resetPassword } from "../actions-password"

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
    const params = await searchParams
    
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
                        Recuperar Contraseña
                    </CardTitle>
                    <CardDescription className="text-secondary/70 max-w-sm mx-auto">
                        Introduce tu email y te enviaremos un enlace para establecer una nueva contraseña.
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    {params.error && (
                        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
                            {params.error}
                        </div>
                    )}
                    {params.success && (
                        <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium text-center">
                            {params.success}
                        </div>
                    )}
                    
                    <form action={resetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-secondary/80">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="tu@email.com"
                                    required
                                    className="pl-9 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                                />
                            </div>
                        </div>
                        
                        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                            Enviar Enlace de Recuperación
                        </Button>
                    </form>
                </CardContent>
                
                <CardFooter className="flex justify-center border-t border-border/50 pt-6">
                    <p className="text-sm text-muted-foreground">
                        ¿Te has acordado?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Volver a Iniciar Sesión
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
