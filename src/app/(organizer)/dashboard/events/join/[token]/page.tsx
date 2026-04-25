import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { joinAsCoOrganizer } from '@/app/(organizer)/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Users, ShieldAlert, Calendar, MapPin } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Props {
    params: Promise<{ token: string }>
    searchParams: Promise<{ error?: string }>
}

export default async function JoinCoOrganizerPage({ params, searchParams }: Props) {
    const { token } = await params
    const { error: qsError } = await searchParams

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect(`/login?next=/dashboard/events/join/${token}`)

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    const isApprovedOrganizer = dbUser?.organizerStatus === 'APPROVED'

    // Look up the event by token to show a preview (read-only, no mutation here)
    const event = await (prisma.event as any).findUnique({
        where: { inviteToken: token },
        select: { id: true, title: true, location: true, startDate: true, coverImage: true, organizerId: true }
    })

    const alreadyCoOrg = event
        ? !!(await (prisma.eventCoOrganizer as any).findUnique({
            where: { eventId_userId: { eventId: event.id, userId: user.id } }
        }))
        : false

    const isOwner = event?.organizerId === user.id

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                        <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tight">
                        Invitación de <span className="text-primary">Co-Organizador</span>
                    </h1>
                </div>

                {/* Error state: token invalid / used */}
                {!event && (
                    <Card className="border-destructive/30 bg-destructive/5">
                        <CardContent className="p-6 text-center space-y-3">
                            <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
                            <p className="font-bold text-destructive">Enlace no válido o ya utilizado</p>
                            <p className="text-sm text-muted-foreground">
                                Este link de invitación ha caducado, ya fue aceptado por otro organizador, o ha sido revocado por el creador del evento.
                            </p>
                            <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline' }), 'mt-2')}>
                                Volver al panel
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Already owner */}
                {event && isOwner && (
                    <Card className="border-yellow-500/30 bg-yellow-500/5">
                        <CardContent className="p-6 text-center space-y-3">
                            <ShieldAlert className="h-10 w-10 text-yellow-500 mx-auto" />
                            <p className="font-bold text-yellow-400">Ya eres el creador de este evento</p>
                            <Link href={`/dashboard/events/${event.id}/edit`} className={cn(buttonVariants({ variant: 'outline' }), 'mt-2')}>
                                Ir al evento
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Already co-org */}
                {event && !isOwner && alreadyCoOrg && (
                    <Card className="border-emerald-500/30 bg-emerald-500/5">
                        <CardContent className="p-6 text-center space-y-3">
                            <Users className="h-10 w-10 text-emerald-500 mx-auto" />
                            <p className="font-bold text-emerald-400">Ya eres co-organizador de este evento</p>
                            <Link href="/dashboard/events" className={cn(buttonVariants({ variant: 'outline' }), 'mt-2')}>
                                Ver mis eventos
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Not an approved organizer */}
                {event && !isOwner && !alreadyCoOrg && !isApprovedOrganizer && (
                    <Card className="border-destructive/30 bg-destructive/5">
                        <CardContent className="p-6 text-center space-y-3">
                            <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
                            <p className="font-bold text-destructive">Acceso restringido</p>
                            <p className="text-sm text-muted-foreground">
                                Solo los organizadores aprobados por SoundTicket pueden unirse como co-organizadores de un evento.
                            </p>
                            <Link href="/dashboard" className={cn(buttonVariants({ variant: 'outline' }), 'mt-2')}>
                                Volver al panel
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Happy path: valid token, approved organizer, not owner, not yet co-org */}
                {event && !isOwner && !alreadyCoOrg && isApprovedOrganizer && (
                    <Card className="border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden">
                        {event.coverImage && (
                            <div className="h-40 overflow-hidden">
                                <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover opacity-70" />
                            </div>
                        )}
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-1">Evento</p>
                                <h2 className="text-xl font-black italic">{event.title}</h2>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                                    {event.location}
                                </p>
                                <p className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                                    {new Date(event.startDate).toLocaleDateString('es-ES', {
                                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                    })}
                                </p>
                            </div>

                            {qsError && (
                                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                                    {qsError}
                                </p>
                            )}

                            <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/30">
                                Al aceptar, obtendrás acceso al <strong className="text-foreground">check-in</strong> y a las <strong className="text-foreground">analíticas</strong> de este evento. Este enlace quedará invalidado.
                            </p>

                            {/* Server action form */}
                            <form action={async () => {
                                'use server'
                                const result = await joinAsCoOrganizer(token)
                                if (result?.error) {
                                    redirect(`/dashboard/events/join/${token}?error=${encodeURIComponent(result.error)}`)
                                }
                            }}>
                                <button
                                    type="submit"
                                    className={cn(
                                        buttonVariants({ variant: 'default' }),
                                        'w-full bg-primary text-primary-foreground font-black h-12 text-base shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all hover:-translate-y-0.5'
                                    )}
                                >
                                    <Users className="mr-2 h-5 w-5" />
                                    Unirme como Co-Organizador
                                </button>
                            </form>

                            <Link href="/dashboard" className={cn(buttonVariants({ variant: 'ghost' }), 'w-full text-muted-foreground')}>
                                Cancelar
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
