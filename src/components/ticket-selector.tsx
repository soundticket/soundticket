"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { createCheckoutSession } from "@/app/(public)/checkout/actions"
import { toast } from "sonner"

interface TicketType {
    id: string
    name: string
    price: number
    totalDisponibles: number
    vendidos: number
}

interface TicketSelectorProps {
    ticketTypes: TicketType[]
    eventId: string
}

export function TicketSelector({ ticketTypes, eventId }: TicketSelectorProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleBuy = async (ticketTypeId: string) => {
        setLoadingId(ticketTypeId)
        const toastId = toast.loading("Preparando tu compra...")
        try {
            const result = await createCheckoutSession(ticketTypeId)
            if (result?.error) {
                toast.error(result.error, { id: toastId })
            } else if (result?.url) {
                toast.success("Redirigiendo a Stripe...", { id: toastId })
                window.location.href = result.url
            } else {
                toast.error("Error inesperado en el servidor", { id: toastId })
            }
        } catch (error) {
            toast.error("Ocurrió un error al procesar el pago", { id: toastId })
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="space-y-4 mb-8">
            {ticketTypes.map((type) => {
                const isSoldOut = (type.totalDisponibles - type.vendidos) <= 0
                const isLoading = loadingId === type.id

                return (
                    <div
                        key={type.id}
                        onClick={() => !isSoldOut && !isLoading && handleBuy(type.id)}
                        className={`flex flex-col p-4 rounded-xl border border-border/50 bg-background/20 transition-all group ${isSoldOut
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-primary/50 cursor-pointer active:scale-[0.98]'
                            } ${isLoading ? 'border-primary/50' : ''}`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-lg group-hover:text-primary transition-colors flex items-center">
                                {type.name}
                                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-primary" />}
                            </span>
                            <span className="font-bold text-xl">{type.price.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                                {isSoldOut ? 'AGOTADO' : `Disponibles: ${type.totalDisponibles - type.vendidos} / ${type.totalDisponibles}`}
                            </span>
                            {!isSoldOut && !isLoading && (
                                <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    COMPRAR →
                                </span>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
