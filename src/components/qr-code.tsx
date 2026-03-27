"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface QRCodeImageProps {
    text: string
    size?: number
}

export function QRCodeImage({ text, size = 200 }: QRCodeImageProps) {
    const [qrUrl, setQrUrl] = useState<string | null>(null)
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
        // Usa dynamic import para evitar problemas CJS/ESM en Next.js
        import("qrcode").then((QRCode) => {
            const qrService = QRCode.default ?? QRCode
            return qrService.toDataURL(text, { width: size, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
        })
        .then((url: string) => setQrUrl(url))
        .catch((err: unknown) => {
            console.error("QR Code Error:", err)
            setHasError(true)
        })
    }, [text, size])

    if (hasError) {
        return (
            <div className="flex items-center justify-center bg-white p-4 rounded-xl border border-red-200" style={{ width: size, height: size }}>
                <p className="text-xs text-red-500 text-center">No se pudo cargar el QR</p>
            </div>
        )
    }

    if (!qrUrl) {
        return (
            <div className="flex items-center justify-center bg-white p-4 rounded-xl" style={{ width: size, height: size }}>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
            <img src={qrUrl} alt="QR Code Ticket" className="w-full h-full" />
        </div>
    )
}
