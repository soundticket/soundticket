"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Share, PlusSquare } from "lucide-react";

export function PwaInstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) return;

        // Catch Chrome/Android native prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault(); // Prevent automatic generic prompt
            setDeferredPrompt(e);
            
            // Solo lo mostramos si no le ha dado a ignorar antes
            const dismissed = localStorage.getItem('pwa-banner-dismissed');
            if (!dismissed) {
                setShowBanner(true);
            }
        });

        // Show educational banner for iOS natively if not installed
        if (ios && !isStandalone) {
            const dismissed = localStorage.getItem('pwa-banner-dismissed');
            if (!dismissed) {
                setShowBanner(true);
            }
        }
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowBanner(false);
            }
            setDeferredPrompt(null);
        }
    };

    const dismissBanner = () => {
        setShowBanner(false);
        localStorage.setItem('pwa-banner-dismissed', 'true');
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-between gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full pb-safe">
            <div className="flex-1">
                <h4 className="font-bold text-sm tracking-tight">Instala la App de SoundTicket</h4>
                {isIOS ? (
                    <p className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-1 leading-snug">
                        Toca icono <Share className="h-3 w-3 inline text-primary" /> Compartir y pulsa <PlusSquare className="h-3 w-3 inline text-primary" /> <strong>Añadir a pantalla inicio</strong>.
                    </p>
                ) : (
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                        Más rápida, check-in QR a pantalla hipercompleta y offline.
                    </p>
                )}
            </div>
            
            <div className="flex items-center gap-1">
                {!isIOS && (
                    <Button size="sm" onClick={handleInstall} className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 h-8 text-xs">
                        Instalar
                    </Button>
                )}
                <Button variant="ghost" size="icon" onClick={dismissBanner} className="text-muted-foreground h-8 w-8">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Cerrar</span>
                </Button>
            </div>
        </div>
    );
}
