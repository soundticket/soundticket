import { signup, loginWithGoogle } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Ticket } from "lucide-react"

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
    const params = await searchParams
    const isSuccess = params.success === 'true'

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10" />

            <Card className="w-full max-w-md border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl">
                <CardHeader className="space-y-2 text-center pb-6">
                    <div className="flex justify-center mb-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                                <Ticket className="h-6 w-6 text-primary-foreground" />
                            </div>
                        </Link>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        {isSuccess ? '¡Registro completado!' : 'Únete a SoundTicket'}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        {isSuccess
                            ? 'Revisa tu bandeja de entrada para confirmar tu cuenta.'
                            : 'Crea tu cuenta para comprar entradas o organizar eventos.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {params.error && (
                        <div className="mb-4 p-3 rounded bg-destructive/15 text-destructive text-sm border border-destructive/20 text-center">
                            {params.error}
                        </div>
                    )}

                    {isSuccess ? (
                        <div className="space-y-6 py-4 text-center">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Te hemos enviado un enlace de confirmación a tu correo electrónico.
                                <br /><strong>Por favor, confírmalo para poder iniciar sesión.</strong>
                            </p>
                            <Link href="/login">
                                <Button className="w-full bg-primary text-primary-foreground font-bold mt-4">
                                    Ir al login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <form action={signup} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre</Label>
                                        <Input name="name" id="name" placeholder="Tu nombre" required className="bg-background/50 border-border/50 focus-visible:ring-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Apellidos</Label>
                                        <Input name="lastName" id="lastName" placeholder="Tus apellidos" required className="bg-background/50 border-border/50 focus-visible:ring-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo electrónico</Label>
                                    <Input name="email" id="email" type="email" placeholder="nombre@ejemplo.com" required className="bg-background/50 border-border/50 focus-visible:ring-primary" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <Input name="phone" id="phone" type="tel" placeholder="+34..." required className="bg-background/50 border-border/50 focus-visible:ring-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">País</Label>
                                        <Input name="country" id="country" placeholder="España" required className="bg-background/50 border-border/50 focus-visible:ring-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <Input name="password" id="password" type="password" required className="bg-background/50 border-border/50 focus-visible:ring-primary" />
                                </div>
                                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                                    Crear cuenta
                                </Button>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border/50" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">
                                        O continuar con
                                    </span>
                                </div>
                            </div>

                            <form action={loginWithGoogle}>
                                <Button variant="outline" type="submit" className="w-full bg-background/50 border-border/50 hover:bg-accent/50">
                                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                    Google
                                </Button>
                            </form>
                        </>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center border-t border-border/50 pt-6">
                    <p className="text-sm text-muted-foreground">
                        ¿Ya tienes cuenta?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
