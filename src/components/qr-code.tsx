"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { Loader2 } from "lucide-react"

interface QRCodeImageProps {
    text: string
    size?: number
}

export function QRCodeImage({ text, size = 200 }: QRCodeImageProps) {
    const [qrUrl, setQrUrl] = useState<string | null>(null)

    useEffect(() => {
        QRCode.toDataURL(text, { width: size, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
            .then(url => setQrUrl(url))
            .catch(err => console.error(err))
    }, [text, size])

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
