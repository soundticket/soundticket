"use client"

import { useState, useEffect, useCallback } from "react"
import { X, ZoomIn } from "lucide-react"

interface EventCoverLightboxProps {
    src: string
    alt: string
}

export function EventCoverLightbox({ src, alt }: EventCoverLightboxProps) {
    const [open, setOpen] = useState(false)

    const close = useCallback(() => setOpen(false), [])

    // Close on Escape key
    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
        document.addEventListener("keydown", handler)
        // Prevent body scroll while open
        document.body.style.overflow = "hidden"
        return () => {
            document.removeEventListener("keydown", handler)
            document.body.style.overflow = ""
        }
    }, [open, close])

    return (
        <>
            {/* Clickable hero image */}
            <button
                onClick={() => setOpen(true)}
                className="absolute inset-0 w-full h-full group cursor-zoom-in focus:outline-none"
                aria-label="Ver cartel completo"
            >
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                {/* Hover hint */}
                <span className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none">
                    <ZoomIn className="w-3.5 h-3.5" />
                    Ver cartel
                </span>
            </button>

            {/* Lightbox overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
                    onClick={close}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

                    {/* Close button */}
                    <button
                        onClick={close}
                        className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full p-2.5 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Image — stop propagation so clicking image doesn't close */}
                    <img
                        src={src}
                        alt={alt}
                        onClick={(e) => e.stopPropagation()}
                        className="relative z-10 max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                    />
                </div>
            )}
        </>
    )
}
