"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { QRCodeImage } from "@/components/qr-code"
import { CalendarDays, MapPin, Maximize2, QrCode } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

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
            <Dialog>
                <DialogTrigger 
                    render={
                        <div className="relative aspect-[16/9] overflow-hidden cursor-zoom-in group">
                            <img
                                src={ticket.ticketType.event.coverImage || `https://images.unsplash.com/photo-1540039155732-d674d40d12ce?q=80&w=800&auto=format&fit=crop`}
                                alt={ticket.ticketType.event.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 className="h-4 w-4 text-white" />
                            </div>
                        </div>
                    }
                />
                <DialogContent className="max-w-3xl border-none bg-transparent shadow-none p-0 flex items-center justify-center">
                    <img
                        src={ticket.ticketType.event.coverImage || `https://images.unsplash.com/photo-1540039155732-d674d40d12ce?q=80&w=800&auto=format&fit=crop`}
                        alt={ticket.ticketType.event.title}
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    />
                </DialogContent>
            </Dialog>

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

                <Dialog>
                    <DialogTrigger 
                        render={
                            <div className="flex flex-col items-center justify-center py-6 bg-white/5 rounded-2xl border border-white/10 cursor-zoom-in hover:bg-white/10 transition-colors group/qr relative overflow-hidden">
                                <QRCodeImage text={ticket.id} size={160} />
                                <p className="text-[10px] text-muted-foreground mt-4 uppercase tracking-[0.2em]">ID: {ticket.id.substring(0, 8)}...</p>
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover/qr:opacity-100 transition-opacity">
                                    <Maximize2 className="h-3 w-3 text-muted-foreground" />
                                </div>
                            </div>
                        }
                    />
                    <DialogContent className="sm:max-w-[400px] bg-card border-border/50 p-8">
                        <DialogHeader>
                            <DialogTitle className="text-center flex items-center justify-center gap-2">
                                <QrCode className="h-5 w-5 text-primary" />
                                Entrada Digital
                            </DialogTitle>
                            <DialogDescription className="text-center">
                                Presenta este código en la entrada del evento
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl mt-4">
                            <QRCodeImage text={ticket.id} size={250} />
                        </div>
                        <div className="mt-6 text-center">
                            <p className="text-xs font-mono text-muted-foreground break-all">{ticket.id}</p>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
