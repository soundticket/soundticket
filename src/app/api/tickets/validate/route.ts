import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { qrToken, eventId, checkinToken } = body;

        if (!qrToken || !eventId) {
            return NextResponse.json({ success: false, error: "Datos incompletos" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Verificar existencia del evento
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { id: true, organizerId: true, checkinToken: true }
        });

        if (!event) {
            return NextResponse.json({ success: false, error: "Evento no encontrado" }, { status: 404 });
        }

        // 2. Verificar autorización (por Sesión o por Token de Check-in)
        const isOrganizer = user?.id === event.organizerId;
        const isValidStaffToken = checkinToken && checkinToken === event.checkinToken;

        if (!isOrganizer && !isValidStaffToken) {
            return NextResponse.json({ 
                success: false, 
                error: "No autorizado. Debes ser el organizador o tener un enlace válido." 
            }, { status: 403 });
        }

        // Buscar el ticket
        const ticket = await prisma.ticket.findUnique({
            where: { qrToken },
            include: { ticketType: true, order: true }
        });

        // 1. No existe
        if (!ticket) {
            return NextResponse.json({ success: false, error: "QR Inválido: Entrada no existe" }, { status: 404 });
        }

        // 2. Pertenece a otro evento
        if (ticket.ticketType.eventId !== eventId) {
            return NextResponse.json({ success: false, error: "QR Inválido: Pertenece a otro evento" }, { status: 400 });
        }

        // 3. Ya fue escaneado
        if (ticket.isScanned) {
            const usedDate = new Date(ticket.updatedAt).toLocaleString("es-ES", {
                hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short'
            });
            return NextResponse.json({ 
                success: false, 
                error: `Entrada ya usada (${usedDate})`,
                ticket: {
                    type: ticket.ticketType.name,
                    orderId: ticket.orderId
                }
            }, { status: 400 });
        }

        // 4. Todo correcto, marcar como escaneado
        await prisma.ticket.update({
            where: { id: ticket.id },
            data: { isScanned: true }
        });

        return NextResponse.json({
            success: true,
            ticket: {
                type: ticket.ticketType.name,
                orderId: ticket.orderId
            }
        });

    } catch (error) {
        console.error("Error validating ticket:", error);
        return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
    }
}
