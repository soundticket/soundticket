"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Calendar, MapPin, Ticket, Send } from "lucide-react"
import { createEvent } from "@/app/auth/actions"
import { toast } from "sonner"

export default function NewEventPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [ticketTypes, setTicketTypes] = useState([
        { name: "Entrada General", price: "", capacity: "" }
    ])

    const addTicketType = () => {
        setTicketTypes([...ticketTypes, { name: "", price: "", capacity: "" }])
    }

    const removeTicketType = (index: number) => {
        if (ticketTypes.length > 1) {
            setTicketTypes(ticketTypes.filter((_, i) => i !== index))
        }
    }

    const updateTicketType = (index: number, field: string, value: string) => {
        const newTypes = [...ticketTypes]
        newTypes[index] = { ...newTypes[index], [field]: value }
        setTicketTypes(newTypes)
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        formData.append("ticketTypes", JSON.stringify(ticketTypes))

        try {
            await createEvent(formData)
            toast.success("Evento enviado para revisión")
        } catch (error: any) {
            toast.error("Error al crear el evento")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-black italic tracking-tight">Crear Nuevo <span className="text-primary">Evento</span></h1>
                <p className="text-muted-foreground">Completa los detalles de tu evento. Será revisado por un administrador antes de publicarse.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <Card className="bg-card/40 backdrop-blur-md border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="p-1.5 bg-primary/10 rounded-md"><Calendar className="w-4 h-4 text-primary" /></span>
                                Información General
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título del Evento</Label>
                                <Input id="title" name="title" placeholder="Ej: Tech Conference 2026" required className="bg-background/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Ubicación / Recinto</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="location" name="location" placeholder="Ej: IFEMA Madrd" required className="pl-10 bg-background/50" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Fecha Inicio</Label>
                                    <Input id="startDate" name="startDate" type="datetime-local" required className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">Fecha Fin</Label>
                                    <Input id="endDate" name="endDate" type="datetime-local" required className="bg-background/50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea id="description" name="description" placeholder="Describe tu evento aquí..." className="min-h-[120px] bg-background/50" required />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tickets Info */}
                    <Card className="bg-card/40 backdrop-blur-md border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <span className="p-1.5 bg-primary/10 rounded-md"><Ticket className="w-4 h-4 text-primary" /></span>
                                Tipos de Entrada
                            </CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addTicketType} className="h-8 gap-1">
                                <Plus className="w-3 h-3" /> Añadir
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {ticketTypes.map((type, index) => (
                                <div key={index} className="p-4 border border-border/40 rounded-xl bg-background/30 space-y-4 relative group">
                                    {ticketTypes.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeTicketType(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase tracking-widest opacity-60">Nombre del Ticket</Label>
                                        <Input
                                            value={type.name}
                                            onChange={(e) => updateTicketType(index, "name", e.target.value)}
                                            placeholder="Ej: Early Bird, VIP..."
                                            required
                                            className="h-9 bg-background/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-widest opacity-60">Precio (€)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={type.price}
                                                onChange={(e) => updateTicketType(index, "price", e.target.value)}
                                                placeholder="0.00"
                                                required
                                                className="h-9 bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-widest opacity-60">Capacidad</Label>
                                            <Input
                                                type="number"
                                                value={type.capacity}
                                                onChange={(e) => updateTicketType(index, "capacity", e.target.value)}
                                                placeholder="100"
                                                required
                                                className="h-9 bg-background/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="p-4 bg-primary/5 border border-dashed border-primary/20 rounded-xl text-center">
                                <p className="text-xs text-muted-foreground italic">
                                    * SoundTicket aplicará una comisión del <span className="text-primary font-bold">5%</span> sobre el precio final de cada entrada.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-4 pb-10">
                    <Button type="button" variant="ghost" onClick={() => router.back()} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" size="lg" disabled={loading} className="gap-2 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                        {loading ? "Enviando..." : (
                            <>
                                <Send className="w-4 h-4" /> Enviar Para Revisión
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
