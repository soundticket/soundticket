"use client";

import { useState, useCallback } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    CheckCircle2, XCircle, ScanLine, Loader2, 
    LayoutDashboard, BarChart3, Info, Calendar,
    MapPin, Users, Ticket as TicketIcon
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface StaffCheckinClientProps {
    event: any;
    checkinToken: string;
    initialStats: {
        totalSold: number;
        totalScanned: number;
        byType: any[];
    };
}

export function StaffCheckinClient({ event, checkinToken, initialStats }: StaffCheckinClientProps) {
    const [activeTab, setActiveTab] = useState<'stats' | 'scanner' | 'info'>('scanner');
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
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    qrToken: result, 
                    eventId: event.id,
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
                // In a real app we might want to refresh stats here, 
                // but for simplicity we'll let the user refresh or wait for the next scan.
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
    }, [event.id, checkinToken, scanResult.status]);

    return (
        <div className="flex flex-col h-full">
            {/* Header with Event Mini Info */}
            <header className="p-4 border-b border-border/40 bg-card/80 backdrop-blur-md shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border/50">
                        {event.coverImage ? (
                            <Image src={event.coverImage} alt={event.title} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                <TicketIcon className="w-5 h-5 text-primary" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="font-bold text-sm line-clamp-1">{event.title}</h1>
                        <p className="text-[10px] uppercase font-black text-primary tracking-widest leading-none mt-1">
                            Staff Dashboard
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground mr-2">Live</span>
                </div>
            </header>

            {/* Tab Content */}
            <main className="flex-1 overflow-y-auto relative flex flex-col">
                {activeTab === 'stats' && (
                    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Attendance Progress Card */}
                        <Card className="bg-card/40 border-border/50 shadow-xl overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary" /> Progreso de Asistencia
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end justify-between mb-2">
                                    <div className="text-4xl font-black text-primary">
                                        {initialStats.totalScanned} <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Entrados</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-muted-foreground uppercase">De {initialStats.totalSold}</p>
                                        <p className="text-sm font-black">{Math.round((initialStats.totalScanned / (initialStats.totalSold || 1)) * 100)}%</p>
                                    </div>
                                </div>
                                <div className="h-3 bg-muted/50 rounded-full overflow-hidden border border-border/20">
                                    <div 
                                        className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all duration-1000"
                                        style={{ width: `${(initialStats.totalScanned / (initialStats.totalSold || 1)) * 100}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Breakdown List */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1 pb-1 border-b border-border/20">
                                Rendimiento por Tipo
                            </h3>
                            {initialStats.byType.map((type: any) => {
                                const progress = type.totalSold > 0 ? (type.scanned / type.totalSold) * 100 : 0;
                                return (
                                    <div key={type.name} className="bg-card/30 border border-border/30 rounded-xl p-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-sm">{type.name}</span>
                                            <span className="text-xs font-bold opacity-60">{type.scanned} / {type.totalSold}</span>
                                        </div>
                                        <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-primary/60 transition-all duration-700"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'scanner' && (
                    <div className="flex-1 flex flex-col">
                        {scanResult.status === 'idle' && (
                            <div className="flex-1 bg-black relative flex flex-col items-center justify-center overflow-hidden">
                                <div className="w-full max-w-[280px] aspect-square relative border-2 border-primary/20 rounded-3xl overflow-hidden shadow-2xl">
                                    <Scanner 
                                        onScan={(result) => {
                                            if (result && result.length > 0) {
                                                handleScan(result[0].rawValue);
                                            }
                                        }}
                                        styles={{ container: { height: '100%', width: '100%' } }}
                                    />
                                    <div className="absolute inset-0 border-[20px] border-black/40 pointer-events-none" />
                                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-primary shadow-[0_0_15px_rgba(var(--primary),1)] animate-scan-beam" />
                                </div>
                                <div className="mt-8 text-center px-6">
                                    <p className="text-white font-bold text-sm uppercase tracking-widest animate-pulse">
                                        Listo para escanear
                                    </p>
                                </div>
                            </div>
                        )}

                        {scanResult.status === 'loading' && (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
                                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                                <h2 className="text-xl font-bold uppercase tracking-widest animate-pulse">Verificando...</h2>
                            </div>
                        )}

                        {scanResult.status === 'success' && (
                            <div className="flex-1 flex flex-col bg-emerald-500/10 p-6 animate-in zoom-in duration-300">
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-32 h-32 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-lg">
                                        <CheckCircle2 className="w-20 h-20 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black text-emerald-500 mb-2 italic uppercase">¡Permitido!</h2>
                                        {scanResult.ticketType && (
                                            <div className="bg-emerald-500 text-white font-black px-4 py-1 rounded-full text-sm uppercase tracking-widest inline-block">
                                                {scanResult.ticketType}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button 
                                    size="lg" 
                                    onClick={() => setScanResult({ status: 'idle' })} 
                                    className="w-full h-16 text-xl font-black bg-emerald-600 hover:bg-emerald-700 uppercase italic shadow-lg active:scale-95 transition-all"
                                >
                                    Siguiente
                                </Button>
                            </div>
                        )}

                        {scanResult.status === 'error' && (
                            <div className="flex-1 flex flex-col bg-red-500/10 p-6 animate-in zoom-in duration-300">
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-32 h-32 rounded-full bg-red-500/20 flex items-center justify-center shadow-lg">
                                        <XCircle className="w-20 h-20 text-red-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-red-500 mb-2 uppercase">{scanResult.message}</h2>
                                        {scanResult.ticketType && (
                                            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Tipo: {scanResult.ticketType}</p>
                                        )}
                                    </div>
                                </div>
                                <Button 
                                    size="lg" 
                                    onClick={() => setScanResult({ status: 'idle' })} 
                                    variant="outline" 
                                    className="w-full h-16 text-xl font-black border-red-500/50 text-red-500 hover:bg-red-500/10 uppercase italic"
                                >
                                    Reintentar
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'info' && (
                    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 bg-card/40 border border-border/30 rounded-2xl">
                                <div className="bg-primary/10 p-2 rounded-xl h-fit">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Ubicación</h4>
                                    <p className="font-bold text-sm leading-tight">{event.location}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 bg-card/40 border border-border/30 rounded-2xl">
                                <div className="bg-primary/10 p-2 rounded-xl h-fit">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Fecha y Hora</h4>
                                    <p className="font-bold text-sm leading-tight text-foreground/90">
                                        {new Date(event.startDate).toLocaleString('es-ES', { 
                                            weekday: 'long', 
                                            day: 'numeric', 
                                            month: 'long', 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 border-b border-border/20 pb-2 flex items-center gap-2">
                                <Info className="w-3.5 h-3.5" /> Descripción del Evento
                            </h3>
                            <div className="text-sm text-foreground/80 leading-relaxed italic p-3 bg-muted/20 rounded-xl border border-border/10">
                                {event.description}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Tabs - Raised slightly on mobile to avoid PWA banner overlap */}
            <nav className="shrink-0 border-t border-border/40 bg-card/95 backdrop-blur-xl flex items-center justify-around p-2 pb-[calc(env(safe-area-inset-bottom)+4.5rem)] md:pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.1)] relative z-50">
                <button 
                    onClick={() => setActiveTab('stats')}
                    className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 w-20 active:scale-90",
                        activeTab === 'stats' ? "text-primary bg-primary/10" : "text-muted-foreground opacity-60"
                    )}
                >
                    <BarChart3 className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Resumen</span>
                </button>
                
                <button 
                    onClick={() => setActiveTab('scanner')}
                    className="relative -mt-10 flex flex-col items-center gap-1 active:scale-95 transition-transform"
                >
                    <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
                        activeTab === 'scanner' ? "bg-primary text-primary-foreground shadow-primary/40 rotate-0" : "bg-card text-muted-foreground scale-90 rotate-45"
                    )}>
                        <ScanLine className="w-8 h-8" />
                    </div>
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest transition-opacity mt-1",
                        activeTab === 'scanner' ? "opacity-100 text-primary" : "opacity-0"
                    )}>Escanear</span>
                </button>

                <button 
                    onClick={() => setActiveTab('info')}
                    className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 w-20 active:scale-90",
                        activeTab === 'info' ? "text-primary bg-primary/10" : "text-muted-foreground opacity-60"
                    )}
                >
                    <Info className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Evento</span>
                </button>
            </nav>

            <style jsx global>{`
                @keyframes scan-beam {
                    0% { top: 20%; }
                    50% { top: 80%; }
                    100% { top: 20%; }
                }
                .animate-scan-beam {
                    animation: scan-beam 2.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
