import { login, loginWithGoogle } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Mail, Lock, Ticket } from "lucide-react"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
    const params = await searchParams

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
                    <CardTitle className="text-2xl font-bold tracking-tight">Bienvenido de nuevo</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Inicia sesión para acceder a tus entradas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {params.error && (
                        <div className="mb-4 p-3 rounded bg-destructive/15 text-destructive text-sm border border-destructive/20 text-center">
                            {params.error}
                        </div>
                    )}
                    {params.message && (
                        <div className="mb-4 p-3 rounded bg-primary/15 text-primary text-sm border border-primary/20 text-center font-medium">
                            {params.message}
                        </div>
                    )}
                    <form action={login} className="space-y-4">
                        <div className="space-y-4">
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

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-secondary/80">
                                    Contraseña
                                </Label>
                                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline hover:text-primary/80 transition-colors">
                                    ¿Has olvidado tu contraseña?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="pl-9 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                            Iniciar Sesión
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
                </CardContent>
                <CardFooter className="flex justify-center border-t border-border/50 pt-6">
                    <p className="text-sm text-muted-foreground">
                        ¿No tienes cuenta?{" "}
                        <Link href="/register" className="font-semibold text-primary hover:underline">
                            Regístrate
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
