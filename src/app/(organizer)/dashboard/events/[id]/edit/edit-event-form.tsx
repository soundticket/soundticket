"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Calendar, MapPin, Ticket, Send, ImageIcon, Loader2, Music2 } from "lucide-react"
import { updateEvent } from "@/app/auth/actions"
import { toast } from "sonner"

const MUSIC_GENRES = [
    "Techno", "House", "Tech House", "Deep House", "Minimal",
    "Trance", "EDM", "Drum & Bass", "Dubstep", "Ambient",
    "Hip-Hop", "Trap", "R&B / Soul", "Reggaeton", "Afrobeats",
    "Rock", "Pop-Rock", "Indie", "Alternativo", "Metal",
    "Jazz", "Blues", "Funk", "Soul", "Disco",
    "Pop", "Electropop", "Reggae", "Salsa", "Flamenco",
    "Clásica", "Ópera", "Folk / Acústico", "Country", "Otro"
]

export default function EditEventForm({ event }: { event: any }) {
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(event.coverImage)

    // Formatear fechas para los inputs
    const startDateObj = new Date(event.startDate)
    const endDateObj = new Date(event.endDate)
    const dateStr = startDateObj.toISOString().split('T')[0]
    const startTimeStr = startDateObj.toTimeString().slice(0, 5)
    let endTimeStr = endDateObj.toTimeString().slice(0, 5)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        
        try {
            await updateEvent(event.id, formData)
        } catch (error: any) {
            toast.error(error.message || "Error al actualizar el evento")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden group">
                        <CardHeader className="bg-muted/10 border-b border-border/40">
                            <CardTitle className="flex items-center gap-2">
                                <span className="p-2 bg-primary/10 rounded-xl"><Calendar className="w-5 h-5 text-primary" /></span>
                                Información General
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Título del Evento</Label>
                                <Input id="title" name="title" defaultValue={event.title} required className="bg-background/50 h-11" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ubicación / Recinto</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-primary" />
                                        <Input id="location" name="location" defaultValue={event.location} required className="pl-10 bg-background/50 h-11" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="genre" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Género Musical</Label>
                                    <div className="relative">
                                        <Music2 className="absolute left-3 top-3.5 h-4 w-4 text-primary" />
                                        <select
                                            id="genre"
                                            name="genre"
                                            defaultValue={event.genre || ""}
                                            required
                                            className="w-full flex h-11 uppercase font-bold text-sm items-center justify-between whitespace-nowrap rounded-md border border-input bg-background/50 pl-10 pr-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                                        >
                                            <option value="" disabled>Selecciona un género...</option>
                                            {MUSIC_GENRES.map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Categoría Principal</Label>
                                <select id="category" name="category" defaultValue={event.category} className="w-full flex h-11 items-center justify-between whitespace-nowrap rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="Concierto">Concierto</option>
                                    <option value="Festival">Festival</option>
                                    <option value="Teatro">Teatro</option>
                                    <option value="Deportes">Deportes</option>
                                    <option value="Exposición">Exposición</option>
                                    <option value="Club">Club</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2 md:col-span-1">
                                    <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fecha</Label>
                                    <Input id="date" name="date" type="date" defaultValue={dateStr} required className="bg-background/50 h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time" className="text-xs font-black uppercase tracking-widest text-muted-foreground">H. Inicio</Label>
                                    <Input id="time" name="time" type="time" defaultValue={startTimeStr} required className="bg-background/50 h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endTime" className="text-xs font-black uppercase tracking-widest text-muted-foreground">H. Fin</Label>
                                    <Input id="endTime" name="endTime" type="time" defaultValue={endTimeStr} required className="bg-background/50 h-11" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Descripción del Evento</Label>
                                <Textarea id="description" name="description" defaultValue={event.description || ""} rows={5} className="bg-background/50 resize-none" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Botón Guardar Mantenido en Sticky */}
                    <div className="sticky top-24 z-10">
                        <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground h-14 text-lg font-black italic shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all hover:-translate-y-1">
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-3 uppercase tracking-wider font-bold">
                            Nota: La edición no incluye los precios de las entradas.
                        </p>
                    </div>

                    <Card className="bg-card/40 backdrop-blur-xl border-border/50 overflow-hidden">
                        <CardHeader className="bg-muted/10 border-b border-border/40">
                            <CardTitle className="flex items-center gap-2 text-sm italic">
                                <ImageIcon className="h-4 w-4" /> Portada del Evento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 relative aspect-video group cursor-pointer">
                            <input 
                                type="file" 
                                name="image" 
                                accept="image/*" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        setImagePreview(URL.createObjectURL(file))
                                    }
                                }}
                            />
                            {imagePreview ? (
                                <>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-50"
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <div className="bg-background/80 p-3 rounded-full backdrop-blur-sm mb-2 shadow-xl">
                                            <ImageIcon className="h-6 w-6 text-primary" />
                                        </div>
                                        <p className="text-sm font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">CAMBIAR IMAGEN</p>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-background/50 hover:bg-background/70 transition-colors">
                                    <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                                    <p className="text-xs font-bold">Subir nueva imagen</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}
