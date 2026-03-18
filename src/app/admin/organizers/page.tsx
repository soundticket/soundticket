import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import AdminOrganizersList from "./list"

export default async function AdminOrganizersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
    })

    if (dbUser?.role !== 'ADMIN') {
        redirect("/profile")
    }

    // Use raw SQL to fetch pending organizers
    const pendingRequests: any = await prisma.$queryRaw`
        SELECT * FROM "User" 
        WHERE "organizerStatus"::text = 'PENDING' 
        ORDER BY "createdAt" DESC
    `

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black italic tracking-tight">Panel <span className="text-primary">Admin</span></h1>
                <p className="text-muted-foreground font-medium">Gestión de solicitudes de nuevos organizadores para la plataforma.</p>
            </div>

            <AdminOrganizersList requests={pendingRequests} />
        </div>
    )
}
