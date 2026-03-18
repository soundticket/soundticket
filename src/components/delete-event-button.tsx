'use client'

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"
import { deleteEvent } from "@/app/auth/actions"
import { toast } from "sonner"

export function DeleteEventButton({ eventId }: { eventId: string }) {
    const [isPending, startTransition] = useTransition()

    return (
        <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-destructive-foreground"
            disabled={isPending}
            onClick={() => {
                if (window.confirm("¿Estás seguro de que deseas borrar este evento? Esta acción no se puede deshacer y borrará también los tipos de entradas asociados.")) {
                    startTransition(async () => {
                        const res = await deleteEvent(eventId)
                        if (res?.error) {
                            toast.error(res.error)
                        } else {
                            toast.success("Evento eliminado correctamente")
                        }
                    })
                }
            }}
        >
            <Trash2 className="h-3.5 w-3.5" /> Borrar
        </Button>
    )
}
