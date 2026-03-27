"use client";

import { useState, useCallback, use } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ScanLine, Loader2 } from "lucide-react";
import Image from "next/image";

export default function PublicCheckinPage({ params }: { params: Promise<{ eventId: string; token: string }> }) {
    const { eventId, token: checkinToken } = use(params);
    
    const [scanResult, setScanResult] = useState<{
        status: 'idle' | 'loading' | 'success' | 'error';
        message?: string;
        ticketType?: string;
    }>({ status: 'idle' });

    const handleScan = useCallback(async (result: string) => {
        if (scanResult.status === 'loading' || scanResult.status === 'success' || scanResult.status === 'error') {
            return;
        }

        setScanResult({ status: 'loading' });

        try {
            const res = await fetch("/api/tickets/validate", {
                // Not using static next: { revalidate: 0 } as it's a POST request
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    qrToken: result, 
                    eventId,
                    checkinToken 
                })
            });

            const data = await res.json();

            if (data.success) {
                setScanResult({
                    status: 'success',
                    message: "Acceso Permitido",
                    ticketType: data.ticket?.type
                });
            } else {
                setScanResult({
                    status: 'error',
                    message: data.error || "Código Inválido",
                    ticketType: data.ticket?.type
                });
            }
        } catch (error) {
            setScanResult({ status: 'error', message: "Error de conexión" });
        }
    }, [eventId, checkinToken, scanResult.status]);

    const resetScanner = () => {
        setScanResult({ status: 'idle' });
    };

    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col pt-safe">
            {/* Minimal Header */}
            <header className="p-6 flex items-center justify-between border-b border-border/40 bg-card/80 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <Image src="/icon.png" alt="Logo" width={32} height={32} className="h-8 w-8 object-contain" />
                    <div>
                        <h1 className="font-bold text-sm uppercase tracking-tighter opacity-70 leading-none">SoundTicket</h1>
                        <p className="font-black text-xl italic leading-none text-primary">Check-in Staff</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Modo Puerta</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative flex flex-col">
                {scanResult.status === 'idle' && (
                    <div className="flex-1 w-full bg-black relative flex flex-col items-center justify-center overflow-hidden">
                        <div className="w-full max-w-sm aspect-square relative border-2 border-primary/20 rounded-3xl overflow-hidden shadow-2xl">
                            <Scanner 
                                onScan={(result) => {
                                    if (result && result.length > 0) {
                                        handleScan(result[0].rawValue);
                                    }
                                }}
                                styles={{ container: { height: '100%', width: '100%' } }}
                            />
                            {/* Scanning overlay frame */}
                            <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none" />
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),1)] animate-scan-beam" />
                        </div>
                        <div className="mt-12 text-center px-6">
                            <p className="text-white font-bold text-lg uppercase tracking-widest animate-pulse">
                                Listo para escanear
                            </p>
                            <p className="text-white/40 text-sm mt-2">
                                Encaja el código QR del cliente dentro del recuadro
                            </p>
                        </div>
                    </div>
                )}

                {scanResult.status === 'loading' && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                            <Loader2 className="w-20 h-20 animate-spin text-primary relative z-10" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Validando Entrada</h2>
                            <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest mt-1">Consulta encriptada...</p>
                        </div>
                    </div>
                )}

                {scanResult.status === 'success' && (
                    <div className="flex-1 flex flex-col bg-emerald-500/10 p-6 animate-in fade-in zoom-in duration-300">
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                            <div className="w-40 h-40 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                                <CheckCircle2 className="w-24 h-24 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-5xl font-black text-emerald-500 mb-2 italic uppercase">{scanResult.message}</h2>
                                {scanResult.ticketType && (
                                    <div className="bg-emerald-500 text-white font-black px-6 py-2 rounded-full text-xl uppercase tracking-widest inline-block shadow-lg">
                                        {scanResult.ticketType}
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button 
                            size="lg" 
                            onClick={resetScanner} 
                            className="w-full h-24 text-3xl font-black bg-emerald-500 hover:bg-emerald-600 shadow-[0_20px_40px_rgba(16,185,129,0.3)] active:scale-95 transition-all uppercase italic"
                        >
                            ¡Adelante!
                        </Button>
                    </div>
                )}

                {scanResult.status === 'error' && (
                    <div className="flex-1 flex flex-col bg-red-500/10 p-6 animate-in fade-in zoom-in duration-300">
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                            <div className="w-40 h-40 rounded-full bg-red-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                                <XCircle className="w-24 h-24 text-red-500" />
                            </div>
                            <div className="px-4">
                                <h2 className="text-4xl font-black text-red-500 mb-4 italic uppercase">{scanResult.message}</h2>
                                {scanResult.ticketType && (
                                    <p className="text-lg font-bold uppercase tracking-widest text-muted-foreground opacity-70">
                                        Tipo: {scanResult.ticketType}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button 
                            size="lg" 
                            onClick={resetScanner} 
                            variant="outline" 
                            className="w-full h-24 text-3xl font-black border-red-500/50 text-red-500 hover:bg-red-500/10 active:scale-95 transition-all uppercase italic"
                        >
                            Volver a intentar
                        </Button>
                    </div>
                )}
            </main>

            <style jsx global>{`
                @keyframes scan-beam {
                    0% { top: 30%; }
                    50% { top: 70%; }
                    100% { top: 30%; }
                }
                .animate-scan-beam {
                    animation: scan-beam 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
