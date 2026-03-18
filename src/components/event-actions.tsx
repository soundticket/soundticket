"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { toggleFavorite, checkIsFavorite } from "@/app/auth/actions"

interface EventActionsProps {
    eventId: string
    eventTitle: string
}

export function EventActions({ eventId, eventTitle }: EventActionsProps) {
    const [isFavorite, setIsFavorite] = useState(false)
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        const loadFavoriteStatus = async () => {
            try {
                const status = await checkIsFavorite(eventId)
                setIsFavorite(status)
            } catch (error) {
                console.error("Error loading favorite status:", error)
            } finally {
                setChecking(false)
            }
        }
        loadFavoriteStatus()
    }, [eventId])

    const handleToggleFavorite = async () => {
        setLoading(true)
        try {
            const result = await toggleFavorite(eventId)
            setIsFavorite(result.isFavorite)
            if (result.isFavorite) {
                toast.success("¡Evento guardado en favoritos!")
            } else {
                toast.info("Evento eliminado de favoritos")
            }
        } catch (error: any) {
            toast.error(error.message || "Error al guardar favorito")
        } finally {
            setLoading(false)
        }
    }

    const handleShare = async () => {
        const shareUrl = window.location.href
        try {
            if (navigator.share) {
                await navigator.share({
                    title: eventTitle,
                    text: `¡Mira este evento en SoundTicket: ${eventTitle}!`,
                    url: shareUrl,
                })
            } else {
                await navigator.clipboard.writeText(shareUrl)
                toast.success("¡Enlace copiado al portapapeles!")
            }
        } catch (error: any) {
            // Ignorar si el usuario simplemente canceló el menú nativo de compartir
            if (error.name !== 'AbortError') {
                try {
                    // Fallback de emergencia por si falla el API nativo en Desktop
                    await navigator.clipboard.writeText(shareUrl)
                    toast.success("¡Enlace copiado al portapapeles!")
                } catch(e) {
                    console.error("Error definitivo compartiendo:", e)
                }
            }
        }
    }

    return (
        <div className="flex gap-3">
            <Button
                size="icon"
                variant="secondary"
                onClick={handleShare}
                className="rounded-full bg-card/40 backdrop-blur-md border border-border/50 hover:bg-card/60 transition-all active:scale-95"
                title="Compartir evento"
            >
                <Share2 className="h-5 w-5" />
            </Button>
            <Button
                size="icon"
                variant="secondary"
                onClick={handleToggleFavorite}
                disabled={loading || checking}
                className={`rounded-full bg-card/40 backdrop-blur-md border border-border/50 hover:bg-card/60 transition-all active:scale-95 ${isFavorite ? "text-red-500 fill-red-500 border-red-500/30 bg-red-500/10" : ""
                    }`}
                title={isFavorite ? "Eliminar de favoritos" : "Guardar en favoritos"}
            >
                {loading || checking ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500" : ""}`} />
                )}
            </Button>
        </div>
    )
}
