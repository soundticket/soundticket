"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("[Global Error]", error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4 bg-background">
            <div className="bg-destructive/10 p-4 rounded-full">
                <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <div>
                <h2 className="text-2xl font-bold mb-2">Se ha producido un error</h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                    Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.
                </p>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                    Ir al inicio
                </Button>
                <Button onClick={reset}>
                    Intentar de nuevo
                </Button>
            </div>
        </div>
    )
}
