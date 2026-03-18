import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import ProfileSettingsForm from "./profile-settings-form"

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
    })

    if (!dbUser) {
        redirect("/login")
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                <p className="text-muted-foreground">Gestiona tu identidad, foto de perfil y preferencias.</p>
            </div>

            <ProfileSettingsForm user={dbUser} />
        </div>
    )
}
