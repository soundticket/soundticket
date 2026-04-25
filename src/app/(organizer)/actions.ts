'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

export async function createEvent(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const location = formData.get('location') as string
    const category = formData.get('category') as string
    const dateStr = formData.get('date') as string
    const timeStr = formData.get('time') as string
    const endTimeStr = formData.get('endTime') as string
    const image = formData.get('image') as File
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)

    // Validation: Mandatory Image
    if (!image || image.size === 0) {
        return { error: 'La imagen del evento es obligatoria.' }
    }

    // Convert date and time to Date objects
    const startDateTime = new Date(`${dateStr}T${timeStr}`)
    const endDateTime = new Date(`${dateStr}T${endTimeStr}`)

    // Handle overnight events (if end time is earlier than start time, assume next day)
    if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1)
    }

    // Validation: > 10 minutes
    const durationMs = endDateTime.getTime() - startDateTime.getTime()
    if (durationMs < 10 * 60 * 1000) {
        return { error: 'El evento debe durar al menos 10 minutos.' }
    }

    // Simulate image upload for now (using a nice placeholder from the internet or just a string)
    // In a real app, we'd upload to Supabase Storage here.
    const coverImageUrl = `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80`

    try {
        const event = await prisma.event.create({
            data: {
                title,
                description,
                location,
                coverImage: coverImageUrl,
                startDate: startDateTime,
                endDate: endDateTime,
                isPublished: true,
                organizerId: user.id,
                ticketTypes: {
                    create: {
                        name: 'General',
                        price: price,
                        totalDisponibles: stock,
                    }
                }
            }
        })

        revalidatePath('/dashboard')
        revalidatePath('/explore')
        return { success: true, eventId: event.id }
    } catch (error) {
        console.error('Error creating event:', error)
        return { error: 'No se pudo crear el evento.' }
    }
}

// ── Co-Organizer: Accept Invite ──────────────────────────────
export async function joinAsCoOrganizer(inviteToken: string): Promise<{ error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Debes iniciar sesión para continuar.' }

    // Check that the user is an approved organizer
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    if (!dbUser || dbUser.organizerStatus !== 'APPROVED') {
        return { error: 'Solo los organizadores aprobados pueden unirse como co-organizadores.' }
    }

    // Find the event by inviteToken
    const event = await (prisma.event as any).findUnique({
        where: { inviteToken },
        include: { coOrganizers: { where: { userId: user.id } } }
    })

    if (!event) return { error: 'El enlace de invitación no es válido o ya ha sido usado.' }
    if (event.organizerId === user.id) return { error: 'Ya eres el creador de este evento.' }
    if (event.coOrganizers.length > 0) return { error: 'Ya eres co-organizador de este evento.' }

    // Token is single-use: consume it and create the co-organizer entry atomically
    await prisma.$transaction([
        (prisma.event as any).update({
            where: { id: event.id },
            data: { inviteToken: null }
        }),
        (prisma.eventCoOrganizer as any).create({
            data: { eventId: event.id, userId: user.id }
        })
    ])

    revalidatePath('/dashboard/events')
    revalidatePath('/dashboard')
    redirect('/dashboard/events')
}

// ── Co-Organizer: Generate New Invite Token ──────────────────
export async function generateInviteToken(eventId: string): Promise<{ token?: string; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autorizado.' }

    const event = await (prisma.event as any).findUnique({ where: { id: eventId } })
    if (!event || event.organizerId !== user.id) return { error: 'No tienes permiso sobre este evento.' }

    const newToken = randomUUID()
    await (prisma.event as any).update({
        where: { id: eventId },
        data: { inviteToken: newToken }
    })

    revalidatePath(`/dashboard/events/${eventId}/edit`)
    return { token: newToken }
}

// ── Co-Organizer: Revoke Invite Token ───────────────────────
export async function revokeInviteToken(eventId: string): Promise<{ error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autorizado.' }

    const event = await (prisma.event as any).findUnique({ where: { id: eventId } })
    if (!event || event.organizerId !== user.id) return { error: 'No tienes permiso sobre este evento.' }

    await (prisma.event as any).update({
        where: { id: eventId },
        data: { inviteToken: null }
    })

    revalidatePath(`/dashboard/events/${eventId}/edit`)
    return {}
}
