import prisma from "@/lib/prisma"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import EditEventForm from "./edit-event-form"

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const event = await (prisma.event as any).findUnique({
        where: { id: resolvedParams.id }
    })

    if (!event || event.organizerId !== user.id) {
        redirect("/dashboard/events")
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl space-y-8">
            <div className="mb-8">
                <h1 className="text-4xl font-black italic tracking-tight uppercase">Editar <span className="text-primary">Evento</span></h1>
                <p className="text-muted-foreground font-medium">Modifica los detalles de tu evento. Al guardar, el evento volverá a estado PENDIENTE para ser revisado por un administrador.</p>
            </div>
            
            <EditEventForm event={event} />
        </div>
    )
}
