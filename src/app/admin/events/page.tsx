import prisma from "@/lib/prisma"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import AdminEventsList from "./list"

export default async function AdminEventsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (dbUser?.role !== 'ADMIN') redirect("/profile")

    // Use raw SQL to fetch pending events to bypass the stale client validation engine
    const pendingEvents: any = await prisma.$queryRaw`
        SELECT e.*, 
        (SELECT json_agg(t.*) FROM "TicketType" t WHERE t."eventId" = e.id) as "ticketTypes",
        (SELECT json_build_object('name', u.name, 'lastName', u."lastName") FROM "User" u WHERE u.id = e."organizerId") as "organizer"
        FROM "Event" e
        WHERE e.status::text = 'PENDING'
        ORDER BY e."createdAt" DESC
    `

    return <AdminEventsList events={pendingEvents} />
}
