'use client'

import { useState, useTransition } from 'react'
import { generateInviteToken, revokeInviteToken } from '@/app/(organizer)/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Link2, Copy, RefreshCw, Trash2, CheckCheck, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
    eventId: string
    currentToken: string | null
    coOrganizers: { id: string; user: { name: string | null; email: string; avatar: string | null } }[]
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://soundticket.es'

export default function CoOrganizerPanel({ eventId, currentToken, coOrganizers }: Props) {
    const [token, setToken] = useState<string | null>(currentToken)
    const [copied, setCopied] = useState(false)
    const [isPending, startTransition] = useTransition()

    const inviteLink = token ? `${BASE_URL}/dashboard/events/join/${token}` : null

    function handleCopy() {
        if (!inviteLink) return
        navigator.clipboard.writeText(inviteLink)
        setCopied(true)
        toast.success('Enlace copiado al portapapeles')
        setTimeout(() => setCopied(false), 2000)
    }

    function handleGenerate() {
        startTransition(async () => {
            const result = await generateInviteToken(eventId)
            if (result.error) {
                toast.error(result.error)
            } else if (result.token) {
                setToken(result.token)
                toast.success('Nuevo enlace generado. El anterior ya no funciona.')
            }
        })
    }

    function handleRevoke() {
        startTransition(async () => {
            const result = await revokeInviteToken(eventId)
            if (result.error) {
                toast.error(result.error)
            } else {
                setToken(null)
                toast.success('Enlace revocado. Nadie nuevo puede unirse.')
            }
        })
    }

    return (
        <Card className="bg-card/40 backdrop-blur-xl border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/40">
                <CardTitle className="flex items-center gap-2 text-sm italic">
                    <span className="p-2 bg-primary/10 rounded-xl">
                        <Users className="w-4 h-4 text-primary" />
                    </span>
                    Co-Organizadores
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
                {/* Current co-organizers list */}
                {coOrganizers.length > 0 ? (
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Acceso activo ({coOrganizers.length})
                        </p>
                        <div className="space-y-2">
                            {coOrganizers.map((co) => (
                                <div key={co.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                                    <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden shrink-0 text-xs font-bold text-primary">
                                        {co.user.avatar
                                            ? <img src={co.user.avatar} alt="" className="w-full h-full object-cover" />
                                            : (co.user.name?.[0] ?? co.user.email[0]).toUpperCase()
                                        }
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">{co.user.name ?? co.user.email}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{co.user.email}</p>
                                    </div>
                                    <span className="ml-auto text-[9px] uppercase font-black tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded shrink-0">
                                        Co-org
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground italic">
                        Ningún co-organizador añadido todavía.
                    </p>
                )}

                <div className="border-t border-border/30 pt-4 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Enlace de invitación (un solo uso)
                    </p>

                    {token ? (
                        <>
                            {/* Link display */}
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border border-border/50">
                                <Link2 className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
                                    {inviteLink}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    onClick={handleCopy}
                                    className={cn(
                                        'flex-1 gap-2 transition-all',
                                        copied && 'bg-emerald-600 hover:bg-emerald-600 text-white'
                                    )}
                                >
                                    {copied ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copied ? 'Copiado' : 'Copiar'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGenerate}
                                    disabled={isPending}
                                    className="gap-2"
                                    title="Generar nuevo link (invalida el actual)"
                                >
                                    <RefreshCw className={cn('h-4 w-4', isPending && 'animate-spin')} />
                                    Nuevo
                                </Button>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRevoke}
                                    disabled={isPending}
                                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    title="Revocar link"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Solo funciona <strong className="text-foreground">una vez</strong>. Al ser aceptado, el link queda invalidado. Para añadir otro co-organizador, genera un link nuevo.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                No hay enlace activo. Genera uno para que otro organizador aprobado pueda unirse a este evento.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleGenerate}
                                disabled={isPending}
                                className="w-full gap-2"
                            >
                                <ExternalLink className={cn('h-4 w-4', isPending && 'animate-spin')} />
                                {isPending ? 'Generando...' : 'Generar Enlace de Invitación'}
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
