import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { requestOrganizerStatus } from "@/app/auth/actions"

export default async function OrganizerRequestPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
    })

    if (dbUser?.organizerStatus === 'APPROVED') {
        redirect("/dashboard")
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <Card className="border-border/40 bg-card/30 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Solicitud de Organizador</CardTitle>
                    <CardDescription>
                        Para poder publicar eventos en SoundTicket, necesitamos verificar tu perfil.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {dbUser?.organizerStatus === 'PENDING' ? (
                        <div className="p-6 text-center space-y-4">
                            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-yellow-500/20 text-yellow-500 mb-4">
                                <span className="text-xl font-bold">!</span>
                            </div>
                            <h3 className="text-lg font-medium">Solicitud en revisión</h3>
                            <p className="text-muted-foreground text-sm">
                                Tu solicitud ha sido enviada correctamente. El administrador la revisará pronto. Te notificaremos por correo electrónico una vez sea aprobada.
                            </p>
                        </div>
                    ) : (
                        <form action={requestOrganizerStatus} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="bio">BIO / Experiencia como organizador</Label>
                                <Textarea
                                    id="bio"
                                    name="bio"
                                    placeholder="Cuéntanos un poco sobre ti o tu promotora y los eventos que sueles organizar..."
                                    className="min-h-[150px] bg-background/50"
                                    required
                                />
                                <p className="text-[10px] text-muted-foreground">Esta información ayudará al administrador a aprobar tu perfil más rápido.</p>
                            </div>

                            <Button type="submit" className="w-full bg-primary text-primary-foreground font-bold h-12">
                                Enviar Solicitud
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
