import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { resend } from '@/lib/resend';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        // Autenticación de seguridad requerida en Producción Vercel para Cron Jobs
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const now = new Date();

        // Eventos que han COMENZADO pero no se ha avisado
        const startedEvents = await prisma.event.findMany({
            where: {
                status: 'APPROVED',
                startDate: { lte: now },
                startedEmailSent: null
            },
            include: { organizer: true }
        });

        // Eventos que han ACABADO pero no se ha avisado
        const endedEvents = await prisma.event.findMany({
            where: {
                status: 'APPROVED',
                endDate: { lte: now },
                endedEmailSent: null
            },
            include: { organizer: true }
        });

        const updates = [];
        const emails = [];

        for (const ev of startedEvents) {
            updates.push(prisma.event.update({
                where: { id: ev.id },
                data: { startedEmailSent: now }
            }));
            
            if (process.env.RESEND_API_KEY && ev.organizer.email) {
                emails.push(resend.emails.send({
                    from: 'SoundTicket <info@soundticket.es>',
                    to: [ev.organizer.email],
                    subject: `🟢 Evento En Curso: ${ev.title}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0c0a09; color: #fff; border-radius: 12px; border: 1px solid #292524;">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <img src="${process.env.NEXT_PUBLIC_BASE_URL}/logo.png" alt="SoundTicket" style="height: 40px;" />
                            </div>
                            <h2 style="color: #8B5CF6; font-style: italic; font-weight: 900; text-transform: uppercase;">¡Tu evento ha comenzado!</h2>
                            <p style="color: #a8a29e; font-size: 16px;">Hola ${ev.organizer.name || 'Organizador'},</p>
                            <p style="color: #e7e5e4; font-size: 16px; line-height: 1.5;">Te informamos que según la fecha programada, tu evento <strong>${ev.title}</strong> acaba de empezar oficialmente.</p>
                            <p style="color: #a8a29e; font-size: 14px; margin-top: 30px;">Ya puedes utilizar la herramienta de Check-in para validar las entradas en puerta.</p>
                            <div style="margin-top: 40px; text-align: center;">
                                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/events/${ev.id}/checkin" style="background-color: #8B5CF6; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">Abrir App de Escáner QR</a>
                            </div>
                        </div>
                    `
                }));
            }
        }

        for (const ev of endedEvents) {
            updates.push(prisma.event.update({
                where: { id: ev.id },
                data: { endedEmailSent: now }
            }));
            
            if (process.env.RESEND_API_KEY && ev.organizer.email) {
                emails.push(resend.emails.send({
                    from: 'SoundTicket <info@soundticket.es>',
                    to: [ev.organizer.email],
                    subject: `🏁 Evento Finalizado: ${ev.title}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0c0a09; color: #fff; border-radius: 12px; border: 1px solid #292524;">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <img src="${process.env.NEXT_PUBLIC_BASE_URL}/logo.png" alt="SoundTicket" style="height: 40px;" />
                            </div>
                            <h2 style="color: #8B5CF6; font-style: italic; font-weight: 900; text-transform: uppercase;">Evento completado</h2>
                            <p style="color: #a8a29e; font-size: 16px;">Hola ${ev.organizer.name || 'Organizador'},</p>
                            <p style="color: #e7e5e4; font-size: 16px; line-height: 1.5;">Tu evento <strong>${ev.title}</strong> ha llegado a su fin. ¡Esperamos que haya sido un absoluto éxito y hayas colgado el cartel de No Hay Billetes!</p>
                            <p style="color: #a8a29e; font-size: 14px; margin-top: 30px;">Ya tienes a tu disposición analíticas precisas de ganancias y comisiones detalladas en tu Dashboard financiero de SoundTicket.</p>
                        </div>
                    `
                }));
            }
        }

        await Promise.allSettled([...updates, ...emails]);

        return NextResponse.json({
            ok: true,
            startedEventsProcessed: startedEvents.length,
            endedEventsProcessed: endedEvents.length
        });
    } catch (e: any) {
        console.error('Cron Error:', e);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
