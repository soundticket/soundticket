"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { approveOrganizer, rejectOrganizer } from "@/app/auth/actions"
import { UserCheck, UserX, Mail, Phone, Globe, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminOrganizersList({ requests }: { requests: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const router = useRouter()

    const handleApprove = async (id: string) => {
        setLoadingId(id)
        try {
            await approveOrganizer(id)
            toast.success("Organizador aprobado correctamente")
            router.refresh()
        } catch (error: any) {
            if (error.digest?.includes('NEXT_REDIRECT')) {
                // Ignore redirect errors, as they are intentional in Next.js 15
                return
            }
            console.error(error)
            toast.error("Error al aprobar el organizador")
        } finally {
            setLoadingId(null)
        }
    }

    const handleReject = async (id: string) => {
        setLoadingId(id)
        try {
            await rejectOrganizer(id)
            toast.success("Solicitud rechazada")
            router.refresh()
        } catch (error: any) {
            if (error.digest?.includes('NEXT_REDIRECT')) {
                return
            }
            console.error(error)
            toast.error("Error al rechazar la solicitud")
        } finally {
            setLoadingId(null)
        }
    }

    if (requests.length === 0) {
        return (
            <Card className="border-border/40 bg-card/30 backdrop-blur-xl border-dashed">
                <CardContent className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4 opacity-20" />
                    <CardTitle className="mb-1">Todo al día</CardTitle>
                    <p className="text-muted-foreground text-sm">No hay solicitudes pendientes en este momento.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-6">
            {requests.map((req) => (
                <Card key={req.id} className="border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden hover:border-primary/20 transition-all shadow-lg group">
                    <CardHeader className="border-b border-border/40 bg-muted/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl group-hover:scale-110 transition-transform">
                                    {req.name?.[0]}
                                </div>
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        {req.name} {req.lastName}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Mail className="w-3 h-3" /> {req.email}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => handleApprove(req.id)}
                                    disabled={loadingId === req.id}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 gap-2 shadow-emerald-900/20 shadow-lg"
                                >
                                    {loadingId === req.id ? (
                                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <UserCheck className="h-4 w-4" />
                                    )}
                                    <span className="hidden sm:inline">Aprobar</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(req.id)}
                                    disabled={loadingId === req.id}
                                    className="border-red-500/50 text-red-500 hover:bg-red-500/10 font-bold h-9 px-4 gap-2"
                                >
                                    <UserX className="h-4 w-4" />
                                    <span className="hidden sm:inline">Rechazar</span>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-5">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-3 ml-1">Información de Contacto</h4>
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div className="flex items-center gap-2 bg-background/40 hover:bg-background/60 p-2 px-3 rounded-lg border border-border/40 transition-colors">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <span className="font-medium">{req.phone || 'No indicado'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-background/40 hover:bg-background/60 p-2 px-3 rounded-lg border border-border/40 transition-colors">
                                        <Globe className="h-4 w-4 text-primary" />
                                        <span className="font-medium text-xs truncate max-w-[150px]">{req.country || 'No indicado'}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-3 ml-1">Motivación del Organizador</h4>
                                <div className="relative group/bio">
                                    <div className="absolute -left-2 -top-2 text-4xl text-primary/20 font-serif opacity-0 group-hover/bio:opacity-100 transition-opacity">"</div>
                                    <p className="text-sm bg-background/40 p-5 rounded-2xl border border-border/40 leading-relaxed italic whitespace-pre-wrap shadow-inner text-foreground/90 group-hover/bio:bg-background/60 transition-colors">
                                        {req.organizerBio ? req.organizerBio : 'El usuario no ha proporcionado una biografía o motivación para su solicitud.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/20 flex flex-col justify-center items-center text-center backdrop-blur-sm group-hover:bg-primary/10 transition-colors">
                            <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4 shadow-xl">
                                <UserCheck className="w-8 h-8" />
                            </div>
                            <div className="text-3xl font-black italic text-primary mb-1">Nuevo</div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black opacity-60">Solicitante</div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
