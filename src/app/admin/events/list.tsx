"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Ticket, Check, X, Eye, MessageSquare, Pencil } from "lucide-react"
import { approveEvent, rejectEvent } from "@/app/auth/actions"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// This is a client component but we should fetch data. 
// For simplicity in this demo environment, I'll expect some standard prop or just do a quick fetch if I had an API.
// But since I'm building it, I'll make it a Server Component if possible or use a Client Component with actions.
// Let's make it a hybrid or just a Server Component for the list.

export default function AdminEventsPage({ events }: { events: any[] }) {
    const [selectedEvent, setSelectedEvent] = useState<any>(null)
    const [rejectionReason, setRejectionReason] = useState("")
    const [isRejecting, setIsRejecting] = useState(false)

    const handleApprove = async (id: string) => {
        try {
            await approveEvent(id)
            toast.success("Evento aprobado correctamente")
        } catch (error: any) {
            if (error.digest?.includes('NEXT_REDIRECT')) {
                // Ignore redirect errors, as they are intentional
                return
            }
            toast.error("Error al aprobar el evento")
        }
    }

    const handleReject = async () => {
        if (!rejectionReason) {
            toast.error("Debes indicar un motivo de rechazo")
            return
        }
        setIsRejecting(true)
        try {
            await rejectEvent(selectedEvent.id, rejectionReason)
            toast.success("Evento rechazado")
            setSelectedEvent(null)
            setRejectionReason("")
        } catch (error: any) {
            if (error.digest?.includes('NEXT_REDIRECT')) {
                return
            }
            toast.error("Error al rechazar el evento")
        } finally {
            setIsRejecting(false)
        }
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-black italic tracking-tight">Solicitudes de <span className="text-primary">Eventos</span></h1>
                <p className="text-muted-foreground">Revisa y aprueba los eventos propuestos por los organizadores.</p>
            </div>

            <div className="grid gap-6">
                {events.length === 0 ? (
                    <Card className="p-12 text-center border-dashed bg-card/30">
                        <Check className="w-12 h-12 text-primary mx-auto mb-4 opacity-20" />
                        <CardTitle>No hay solicitudes pendientes</CardTitle>
                        <CardDescription>¡Buen trabajo! Todo está al día.</CardDescription>
                    </Card>
                ) : (
                    events.map((event) => (
                        <Card key={event.id} className="bg-card/40 backdrop-blur-md border-border/50 shadow-xl overflow-hidden hover:border-primary/20 transition-colors">
                            <div className="flex flex-col md:flex-row p-6 gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h2 className="text-xl font-bold">{event.title}</h2>
                                        {event.isModification ? (
                                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 uppercase text-[10px] font-black gap-1">
                                                <Pencil className="w-2.5 h-2.5" /> Modificación
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 uppercase text-[10px] font-black">
                                                Nuevo
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            {new Date(event.startDate).toLocaleString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            {event.location}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-background/50 rounded-xl border border-border/40">
                                        <p className="text-sm line-clamp-2 italic">"{event.description}"</p>
                                    </div>

                                    {event.isModification && (
                                        <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/5 border border-blue-500/20 rounded-lg px-3 py-2">
                                            <Pencil className="w-3 h-3 shrink-0" />
                                            <span>Este evento ya estaba publicado. Revisa los cambios antes de aprobar.</span>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                        {event.ticketTypes?.map((tt: any) => (
                                            <Badge key={tt.id} variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                                                {tt.name}: {tt.price}€ ({tt.totalDisponibles} uds)
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                                    <Button
                                        onClick={() => handleApprove(event.id)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
                                    >
                                        <Check className="w-4 h-4" /> Aprobar
                                    </Button>

                                    <Dialog>
                                        <DialogTrigger
                                            render={
                                                <Button
                                                    variant="outline"
                                                    className="border-red-500/50 text-red-500 hover:bg-red-500/10 font-bold gap-2"
                                                    onClick={() => setSelectedEvent(event)}
                                                >
                                                    <X className="w-4 h-4" /> Rechazar
                                                </Button>
                                            }
                                        />
                                        <DialogContent className="bg-card border-border">
                                            <DialogHeader>
                                                <DialogTitle>Rechazar Evento</DialogTitle>
                                                <DialogDescription>
                                                    Explica al organizador por qué su evento no ha sido aprobado.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="reason">Motivo del rechazo</Label>
                                                    <Textarea
                                                        id="reason"
                                                        placeholder="Ej: Falta información sobre el recinto, precio incorrecto..."
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        className="bg-background/50 border-border"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="ghost" onClick={() => setSelectedEvent(null)}>Cancelar</Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={handleReject}
                                                    disabled={isRejecting || !rejectionReason}
                                                >
                                                    {isRejecting ? "Rechazando..." : "Confirmar Rechazo"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
