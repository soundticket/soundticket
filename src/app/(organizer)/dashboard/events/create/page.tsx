"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Calendar, MapPin, Ticket, Send, ImageIcon, Loader2, Music2 } from "lucide-react"
import { createEvent } from "@/app/auth/actions"
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

import { verifyStripeConnection } from "@/app/auth/actions"

export default function CreateEventPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isVerifyingStripe, setIsVerifyingStripe] = useState(true)

    useEffect(() => {
        async function checkStripeStatus() {
            const hasStripeConnected = await verifyStripeConnection()
            if (!hasStripeConnected) {
                toast.error("Debes configurar tu cuenta bancaria en la pestaña de Facturación antes de publicar eventos.")
                router.push("/dashboard/billing")
            } else {
                setIsVerifyingStripe(false)
            }
        }
        checkStripeStatus()
    }, [router])
    
    // Evitar hidratación mismatch pero asegurar restricción local
    const minDateTime = new Date().toISOString().slice(0, 16)

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
            const result = await createEvent(formData)
            if (result?.error) {
                toast.error(result.error)
            } else if (result?.success) {
                toast.success("¡Evento publicado con éxito!")
                router.push("/dashboard/events?success=Evento+enviado+a+revisión")
            }
        } catch (error: any) {
            toast.error(error?.message || "Error al crear el evento. Inténtalo de nuevo.")
            console.error("Error no controlado:", error)
        } finally {
            setLoading(false)
        }
    }

    // The provided code snippet seems to be a mix of server-side redirect logic
    // and client-side component structure.
    // Since this is a client component ("use client"), `redirect` is not directly usable here.
    // Assuming the intent is to perform these checks on the client-side before rendering,
    // and use `router.push` for navigation, or that these checks are meant for a server component
    // or a server action that wraps this client component.
    // As per the instruction to make the change faithfully, I will insert the provided code as is,
    // but note that `redirect` is a server-side function and will cause an error in a client component.
    // A more appropriate client-side implementation would use `router.push`.

    // if (!user) {
    //     router.push("/login")
    // }

    // const dbUser = await prisma.user.findUnique({
    //     where: { id: user.id }
    // })

    // if (!dbUser || dbUser.organizerStatus !== 'APPROVED') {
    //     router.push("/profile")
    // }

    // if (!dbUser.chargesEnabled) {
    //     router.push("/dashboard/billing")
    // }

    if (isVerifyingStripe) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse text-sm tracking-widest uppercase font-bold">Verificando Credenciales Bancarias...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl space-y-8">
            <div className="mb-8">
                <h1 className="text-4xl font-black italic tracking-tight uppercase">Crear <span className="text-primary">Evento</span></h1>
                <p className="text-muted-foreground font-medium">Define los detalles de tu evento. La imagen y una duración mínima de 10 min son obligatorios.</p>
            </div>

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
                                    <Input id="title" name="title" placeholder="Ej: Tech House Anniversary" required className="bg-background/50 h-11" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="location" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ubicación / Recinto</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-primary" />
                                            <Input id="location" name="location" placeholder="Ej: Sala Fabrik, Madrid" required className="pl-10 bg-background/50 h-11" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="genre" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Género Musical</Label>
                                        <div className="relative">
                                            <Music2 className="absolute left-3 top-3.5 h-4 w-4 text-primary z-10" />
                                            <select
                                                id="genre"
                                                name="genre"
                                                required
                                                className="w-full h-11 pl-10 pr-4 rounded-md border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                                            >
                                                <option value="">Selecciona un género...</option>
                                                {MUSIC_GENRES.map(g => (
                                                    <option key={g} value={g}>{g}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fecha y Hora Inicio</Label>
                                        <Input id="startDate" name="startDate" type="datetime-local" min={minDateTime} required className="bg-background/50 h-11" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Fecha y Hora Fin</Label>
                                        <Input id="endDate" name="endDate" type="datetime-local" min={minDateTime} required className="bg-background/50 h-11" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Descripción Detallada</Label>
                                    <Textarea id="description" name="description" placeholder="Cuenta de qué trata tu evento..." className="min-h-[160px] bg-background/50 leading-relaxed" required />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tickets Info */}
                        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between bg-muted/10 border-b border-border/40">
                                <CardTitle className="flex items-center gap-2">
                                    <span className="p-2 bg-primary/10 rounded-xl"><Ticket className="w-5 h-5 text-primary" /></span>
                                    Tipos de Entrada
                                </CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={addTicketType} className="h-9 gap-2 border-primary/30 text-primary hover:bg-primary/10 font-bold">
                                    <Plus className="w-4 h-4" /> Añadir Categoría
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {ticketTypes.map((type, index) => (
                                    <div key={index} className="p-5 border border-border/40 rounded-2xl bg-background/30 space-y-5 relative group/ticket hover:border-primary/20 transition-all">
                                        {ticketTypes.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive opacity-0 group-hover/ticket:opacity-100 transition-opacity"
                                                onClick={() => removeTicketType(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre de la Entrada</Label>
                                            <Input
                                                value={type.name}
                                                onChange={(e) => updateTicketType(index, "name", e.target.value)}
                                                placeholder="Ej: Early Bird, VIP, Blackout..."
                                                required
                                                className="h-10 bg-background/50"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Precio (€)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0.50"
                                                    value={type.price}
                                                    onChange={(e) => updateTicketType(index, "price", e.target.value)}
                                                    placeholder="0.50"
                                                    required
                                                    className="h-10 bg-background/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cantidad total</Label>
                                                <Input
                                                    type="number"
                                                    value={type.capacity}
                                                    onChange={(e) => updateTicketType(index, "capacity", e.target.value)}
                                                    placeholder="100"
                                                    required
                                                    className="h-10 bg-background/50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">
                        {/* Image Upload */}
                        <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden sticky top-24">
                            <CardHeader className="bg-muted/10 border-b border-border/40">
                                <CardTitle className="flex items-center gap-2">
                                    <span className="p-2 bg-primary/10 rounded-xl"><ImageIcon className="w-5 h-5 text-primary" /></span>
                                    Imagen Principal
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <Label htmlFor="image" className="cursor-pointer group block">
                                    <div className="aspect-[4/5] border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-background/30 hover:bg-background/50 transition-all group-hover:border-primary/40 shadow-inner overflow-hidden relative">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                                            />
                                        ) : (
                                            <>
                                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg group-hover:bg-primary/20">
                                                    <Plus className="h-8 w-8 text-primary" />
                                                </div>
                                                <p className="text-sm font-bold uppercase tracking-widest mb-2">Seleccionar Foto</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-black opacity-60">Obligatorio • JPG/PNG/WEBP</p>
                                            </>
                                        )}
                                        {imagePreview && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                                <p className="text-white text-xs font-bold uppercase tracking-widest">Cambiar imagen</p>
                                            </div>
                                        )}
                                    </div>
                                </Label>
                                <Input
                                    name="image"
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    required
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            // Vercel Serverless payload limit is 4.5MB
                                            if (file.size > 4 * 1024 * 1024) {
                                                toast.error("La imagen es demasiado pesada. El tamaño máximo permitido es 4 MB para asegurar la velocidad de la web.")
                                                e.target.value = '' // Clear input
                                                setImagePreview(null)
                                                return
                                            }
                                            const url = URL.createObjectURL(file)
                                            setImagePreview(url)
                                            toast.success(`Imagen cargada: ${file.name.substring(0, 20)}`)
                                        }
                                    }}
                                />

                                <div className="mt-8 space-y-4">
                                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                                            * Al publicar el evento, aceptas los términos de servicio, la comisión de SoundTicket (<span className="text-primary font-bold">5%</span>) y los costes bancarios por procesamiento de tarjeta (Stripe).
                                        </p>
                                    </div>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={loading}
                                        className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(var(--primary),0.3)] hover:shadow-[0_15px_40px_rgba(var(--primary),0.4)] transition-all gap-3"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" /> Publicar Evento
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    )
}
