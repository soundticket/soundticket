import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { StaffCheckinClient } from "@/components/staff-checkin-client";

export default async function PublicCheckinPage({ params }: { params: Promise<{ eventId: string; token: string }> }) {
    const { eventId, token: checkinToken } = await params;

    // 1. Fetch event and verify token
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
            ticketTypes: {
                include: {
                    _count: {
                        select: { tickets: true }
                    }
                }
            }
        }
    });

    if (!event || event.checkinToken !== checkinToken) {
        return notFound();
    }

    // 2. Fetch scanned counts
    const scannedTickets = await prisma.ticket.groupBy({
        by: ['ticketTypeId'],
        where: {
            ticketType: { eventId },
            isScanned: true
        },
        _count: true
    });

    // 3. Prepare Stats
    let totalSold = 0;
    let totalScanned = 0;
    const byType = event.ticketTypes.map(tt => {
        const sold = (tt as any)._count.tickets;
        const scanned = scannedTickets.find(s => s.ticketTypeId === tt.id)?._count || 0;
        
        totalSold += sold;
        totalScanned += scanned;

        return {
            name: tt.name,
            totalSold: sold,
            scanned: scanned
        };
    });

    const stats = {
        totalSold,
        totalScanned,
        byType
    };

    return (
        <div className="fixed inset-0 bg-background overflow-hidden">
            <StaffCheckinClient 
                event={event} 
                checkinToken={checkinToken} 
                initialStats={stats} 
            />
        </div>
    );
}
