"use client";

import { useState, useCallback, use } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, ScanLine, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckinPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: eventId } = use(params);
    
    const [scanResult, setScanResult] = useState<{
        status: 'idle' | 'loading' | 'success' | 'error';
        message?: string;
        ticketType?: string;
    }>({ status: 'idle' });

    const handleScan = useCallback(async (result: string) => {
        // Prevent multiple simultaneous scans
        if (scanResult.status === 'loading' || scanResult.status === 'success' || scanResult.status === 'error') {
            return;
        }

        // Quick audio feedback
        const beep = new Audio('/beep.mp3'); // We'll try to play a beep if it doesn't fail on mobile
        beep.volume = 0.5;
        beep.play().catch(() => {});

        setScanResult({ status: 'loading' });

        try {
            const res = await fetch("/api/tickets/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrToken: result, eventId })
            });

            const data = await res.json();

            if (data.success) {
                // Play success sound
                const successBeep = new Audio('/success.mp3');
                successBeep.play().catch(() => {});
                
                setScanResult({
                    status: 'success',
                    message: "Acceso Permitido",
                    ticketType: data.ticket?.type
                });
            } else {
                // Play error sound
                const errorBeep = new Audio('/error.mp3');
                errorBeep.play().catch(() => {});
                
                setScanResult({
                    status: 'error',
                    message: data.error || "Código Inválido",
                    ticketType: data.ticket?.type
                });
            }
        } catch (error) {
            setScanResult({ status: 'error', message: "Error de conexión" });
        }
    }, [eventId, scanResult.status]);

    const resetScanner = () => {
        setScanResult({ status: 'idle' });
    };

    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col pt-safe">
            {/* Header */}
            <header className="p-4 flex items-center justify-between border-b border-border/40 bg-card/80 backdrop-blur-md shrink-0">
                <Link href="/dashboard/events">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    <ScanLine className="w-5 h-5 text-primary" />
                    <h1 className="font-bold text-lg uppercase tracking-widest italic">Escáner Puerta</h1>
                </div>
                <div className="w-10" /> {/* Balancer */}
            </header>

            {/* Main Content */}
            <main className="flex-1 relative flex flex-col">
                {scanResult.status === 'idle' && (
                    <div className="flex-1 w-full bg-black relative">
                        <Scanner 
                            onScan={(result) => {
                                if (result && result.length > 0) {
                                    handleScan(result[0].rawValue);
                                }
                            }}
                        />
                        <div className="absolute bottom-10 left-0 right-0 text-center text-white/50 text-sm font-bold uppercase tracking-widest pointer-events-none">
                            Apunta al QR de la entrada
                        </div>
                    </div>
                )}

                {scanResult.status === 'loading' && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-16 h-16 animate-spin text-primary" />
                        <h2 className="text-xl font-bold animate-pulse">Verificando en directo...</h2>
                        <p className="text-muted-foreground text-sm uppercase tracking-widest">Conectando con base de datos</p>
                    </div>
                )}

                {scanResult.status === 'success' && (
                    <div className="flex-1 flex flex-col bg-emerald-500/10 p-6 animate-in fade-in zoom-in duration-300">
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-32 h-32 rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce-short">
                                <CheckCircle2 className="w-20 h-20 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-emerald-500 mb-2">{scanResult.message}</h2>
                                {scanResult.ticketType && (
                                    <p className="text-2xl font-bold uppercase tracking-widest opacity-90 border-b-2 border-emerald-500/30 pb-2 inline-block">
                                        {scanResult.ticketType}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button size="lg" onClick={resetScanner} className="w-full h-20 text-2xl font-black bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            Siguiente Entrada
                        </Button>
                    </div>
                )}

                {scanResult.status === 'error' && (
                    <div className="flex-1 flex flex-col bg-red-500/10 p-6 animate-in fade-in zoom-in duration-300">
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-32 h-32 rounded-full bg-red-500/20 flex items-center justify-center animate-shake">
                                <XCircle className="w-20 h-20 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-red-500 mb-4">{scanResult.message}</h2>
                                {scanResult.ticketType && (
                                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground opacity-70">
                                        Tipo: {scanResult.ticketType}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button size="lg" onClick={resetScanner} variant="outline" className="w-full h-20 text-2xl font-black border-red-500/50 text-red-500 hover:bg-red-500/10">
                            Reintentar / Siguiente
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}
