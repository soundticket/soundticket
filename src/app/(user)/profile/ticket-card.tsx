"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { QRCodeImage } from "@/components/qr-code"
import { CalendarDays, MapPin } from "lucide-react"

interface TicketCardProps {
    ticket: {
        id: string
        ticketType: {
            name: string
            event: {
                title: string
                location: string
                startDate: Date
                coverImage: string | null
            }
        }
    }
}

export function TicketCard({ ticket }: TicketCardProps) {
    const formattedDate = ticket.ticketType.event.startDate.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    return (
        <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-xl flex flex-col shadow-2xl group hover:border-primary/50 transition-all">
            <div className="relative aspect-[16/9] overflow-hidden">
                <img
                    src={ticket.ticketType.event.coverImage || `https://images.unsplash.com/photo-1540039155732-d674d40d12ce?q=80&w=800&auto=format&fit=crop`}
                    alt={ticket.ticketType.event.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold">{ticket.ticketType.event.title}</CardTitle>
                    <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                        {ticket.ticketType.name}
                    </span>
                </div>
                <CardDescription className="flex items-center gap-2">
                    <CalendarDays className="h-3 w-3" />
                    {formattedDate}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
                <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-2 text-primary" />
                    {ticket.ticketType.event.location}
                </div>

                <div className="flex flex-col items-center justify-center py-4 bg-white/5 rounded-2xl border border-white/10">
                    <QRCodeImage text={ticket.id} size={160} />
                    <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-[0.2em]">ID: {ticket.id.substring(0, 8)}...</p>
                </div>
            </CardContent>
        </Card>
    )
}
