"use client";

import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface ShareCheckinButtonProps {
    eventId: string;
    token: string;
    eventTitle: string;
}

export function ShareCheckinButton({ eventId, token, eventTitle }: ShareCheckinButtonProps) {
    const [copied, setCopied] = useState(false);
    
    // In production this should use the real domain
    const shareUrl = `${window.location.protocol}//${window.location.host}/checkin/${eventId}/${token}`;

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Check-in: ${eventTitle}`,
                    text: `Acceso para validación de entradas de ${eventTitle}.`,
                    url: shareUrl,
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                toast.success("Enlace de check-in copiado");
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (error) {
            console.error("Error sharing:", error);
            // Fallback to clipboard if share fails or is cancelled
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                toast.success("Enlace copiado al portapapeles");
                setTimeout(() => setCopied(false), 2000);
            } catch (e) {
                toast.error("No se pudo copiar el enlace");
            }
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2 bg-background/50 border-primary/20 hover:border-primary/50 text-xs font-bold uppercase transition-all"
            title="Compartir enlace de acceso para porteros/staff"
        >
            {copied ? (
                <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="hidden md:inline">Copiado</span>
                </>
            ) : (
                <>
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Compartir Acceso</span>
                </>
            )}
        </Button>
    );
}
