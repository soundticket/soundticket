'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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
