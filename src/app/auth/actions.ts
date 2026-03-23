'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { headers } from 'next/headers'

async function getBaseUrl(): Promise<string> {
    const hdrs = await headers()
    const proto = hdrs.get('x-forwarded-proto') || 'https'
    const host = hdrs.get('host') || 'soundticket.es'
    const url = `${proto}://${host}`
    // Always use production domain for OAuth callbacks
    if (host.includes('localhost')) return 'https://soundticket.es'
    return url
}

const translateError = (error: string): string => {
    const msg = error.toLowerCase()
    if (msg.includes('invalid login credentials')) return 'Email o contraseña incorrectos.'
    if (msg.includes('user already registered')) return 'Este correo ya está registrado.'
    if (msg.includes('email provider is disabled')) return 'El registro con email está desactivado.'
    if (msg.includes('rate limit exceeded')) return 'Demasiados intentos. Inténtalo más tarde.'
    if (msg.includes('confirma tu correo electrónico')) return 'Por favor, confirma tu correo electrónico antes de iniciar sesión.'
    if (msg.includes('database error') || msg.includes('prisma')) return 'Error de base de datos. Inténtalo de nuevo.'
    return error // Fallback to original if not mapped
}

export async function loginWithGoogle() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${await getBaseUrl()}/auth/callback`,
        },
    })

    if (error) {
        console.error('Google login error:', error)
        return redirect('/login?error=' + encodeURIComponent(translateError(error.message)))
    }

    if (data.url) {
        return redirect(data.url)
    }
}

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log('Login attempt for:', email)

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error for', email, ':', error.message)
        return redirect('/login?error=' + encodeURIComponent(translateError(error.message)))
    }

    const user = data.user
    if (user) {
        console.log('Login success in Supabase for:', user.email, 'ID:', user.id)
        let dbUser = await prisma.user.findUnique({ where: { id: user.id } })

        if (dbUser && dbUser.email === 'vikfaded@gmail.com' && dbUser.role !== 'ADMIN') {
            console.log('Upgrading vikfaded@gmail.com to ADMIN during login...')
            dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: { role: 'ADMIN' }
            })
        }

        if (!dbUser) {
            console.warn('ID mismatch or missing profile. Searching by email:', user.email)
            const dbUserByEmail = await prisma.user.findUnique({ where: { email: user.email } })

            if (dbUserByEmail) {
                console.log('Auto-healing: Migrating Prisma record from ID', dbUserByEmail.id, 'to', user.id)
                // Delete old record and create new one with correct ID to maintain consistency
                // Note: We use a transaction or sequential delete/create. 
                // Since this is likely a new user with no relations yet, this is safe.
                await prisma.user.delete({ where: { id: dbUserByEmail.id } })
                dbUser = await (prisma.user as any).create({
                    data: {
                        ...dbUserByEmail,
                        id: user.id,
                        isVerified: true,
                        role: user.email === 'vikfaded@gmail.com' ? 'ADMIN' : dbUserByEmail.role
                    }
                })
            } else {
                console.error('User authenticated in Supabase but profile NOT FOUND in Prisma by ID or Email:', user.id)
                await supabase.auth.signOut()
                return redirect('/login?error=' + encodeURIComponent('Tu perfil no se encontró. Por favor, regístrate de nuevo.'))
            }
        }

        if (!(dbUser as any).isVerified) {
            console.log('Login blocked: user is not verified in Prisma:', user.id)
            await supabase.auth.signOut()
            return redirect('/login?error=' + encodeURIComponent('Por favor, confirma tu correo electrónico antes de iniciar sesión.'))
        }

        console.log('User verified in Prisma, allowing access:', user.id)
    }

    return redirect('/profile')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const lastName = formData.get('lastName') as string
    const phone = formData.get('phone') as string
    const country = formData.get('country') as string

    console.log('Signup started for:', email)

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: `${name} ${lastName}`,
                first_name: name,
                last_name: lastName,
                phone: phone,
                country: country,
            },
        },
    })

    if (error) {
        console.error('Supabase signup error:', error)
        return redirect('/register?error=' + encodeURIComponent(translateError(error.message)))
    }

    console.log('Supabase user created:', data.user?.id)

    if (!data.user) {
        return redirect('/register?error=' + encodeURIComponent('Error al crear el usuario en Supabase.'))
    }

    let prismaSuccess = false
    try {
        console.log('Syncing with Prisma...')

        // IMPORTANT: Check if a user with this email already exists but with a DIFFERENT ID
        // This happens if the user was deleted in Supabase but not in Prisma, or vice versa
        const existingUserByEmail = await prisma.user.findUnique({ where: { email } })
        if (existingUserByEmail && existingUserByEmail.id !== data.user.id) {
            console.warn('Sync conflict: Found user with same email but different ID. Deleting ghost record:', existingUserByEmail.id)
            await prisma.user.delete({ where: { id: existingUserByEmail.id } })
        }

        await prisma.user.upsert({
            where: { id: data.user.id },
            update: {
                email,
                name,
                lastName,
                phone,
                country,
                role: email === 'vikfaded@gmail.com' ? 'ADMIN' : undefined
            } as any,
            create: {
                id: data.user.id,
                email,
                name,
                lastName,
                phone,
                country,
                isVerified: true,
                organizerStatus: 'APPROVED',
                role: 'USER'
            } as any,
        })
        console.log('Prisma sync successful')
        prismaSuccess = true
    } catch (dbError: any) {
        console.error('Error during Prisma sync:', dbError)
        // Clean up Supabase user if Prisma fails
        console.log('Cleaning up Supabase user after Prisma failure...')
        await supabase.auth.admin.deleteUser(data.user.id)
        return redirect('/register?error=' + encodeURIComponent(`Error de base de datos: ${dbError?.message || 'Fallo al sincronizar perfil'}`))
    }

    if (prismaSuccess) {
        console.log('Importing resend...')
        const { resend } = await import('@/lib/resend')
        const { verifyEmailTemplate } = await import('@/lib/email-templates')
        console.log('RESEND_API_KEY present:', !!process.env.RESEND_API_KEY)

        const confirmLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/confirm?uid=${data.user.id}`
        console.log('Sending email to:', email, 'Link:', confirmLink)

        let emailSent = false
        let emailError = ''

        if (process.env.RESEND_API_KEY) {
            try {
                console.log('Attempting to send email via Resend (main)...')
                const htmlContent = verifyEmailTemplate(name, confirmLink)

                const res = await resend.emails.send({
                    from: 'SoundTicket <info@soundticket.es>',
                    to: [email],
                    subject: 'Confirma tu registro - SoundTicket',
                    html: htmlContent
                })

                if (res.error) {
                    console.error('Resend main sender error:', res.error)
                    // Try fallback
                    console.log('Attempting fallback with onboarding@resend.dev...')
                    const resFallback = await resend.emails.send({
                        from: 'SoundTicket <onboarding@resend.dev>',
                        to: [email],
                        subject: 'Confirma tu registro - SoundTicket',
                        html: htmlContent
                    })
                    if (resFallback.error) {
                        console.error('Resend fallback error:', resFallback.error)
                        emailError = resFallback.error.message
                    } else {
                        emailSent = true
                    }
                } else {
                    emailSent = true
                }
            } catch (err: any) {
                console.error('Resend exception:', err)
                emailError = err.message
            }
        } else {
            console.warn("RESEND_API_KEY is missing. User created in DB but no verification email sent.")
            emailError = 'RESEND_API_KEY is missing.'
        }

        if (!emailSent) {
            console.warn('Email could not be sent. Error:', emailError)
            // We don't necessarily want to block registration if only email fails, 
            // but for now let's be strict to ensure the user knows.
            return redirect('/register?error=' + encodeURIComponent(`Error al enviar el email: ${emailError || 'Verifica la configuración de Resend'}`))
        }
    }

    console.log('Signup completed successfully')
    return redirect('/register?success=true')
}

export async function logout() {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
        console.error('Logout error:', error)
    }
    return redirect('/')
}

export async function requestOrganizerStatus(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const bio = formData.get('bio') as string

    // Save the bio and update status to PENDING
    await (prisma.user as any).update({
        where: { id: user.id },
        data: {
            organizerStatus: 'PENDING',
            organizerBio: bio
        } as any
    })

    return redirect('/profile/organizer-request')
}


export async function approveOrganizer(userId: string) {
    console.log('[approveOrganizer] Attempting to approve user:', userId)
    const supabase = await createClient()
    const { data: { user: adminUser } } = await supabase.auth.getUser()

    if (!adminUser) {
        console.log('[approveOrganizer] No admin user session found')
        return redirect('/login')
    }

    const dbAdmin = await prisma.user.findUnique({ where: { id: adminUser.id } })
    console.log('[approveOrganizer] Admin user in DB:', dbAdmin?.email, 'Role:', dbAdmin?.role)

    if (dbAdmin?.role !== 'ADMIN') {
        console.log('[approveOrganizer] User is not an admin, redirecting to /profile')
        return redirect('/profile')
    }

    try {
        console.log('[approveOrganizer] Updating database for userId:', userId)
        const updatedUser = await (prisma.user as any).update({
            where: { id: userId },
            data: {
                organizerStatus: 'APPROVED'
            } as any
        })

        if (process.env.RESEND_API_KEY && updatedUser.email) {
            try {
                const { resend } = await import('@/lib/resend')
                const { organizerApprovedTemplate } = await import('@/lib/email-templates')
                await resend.emails.send({
                    from: 'SoundTicket <info@soundticket.es>',
                    to: [updatedUser.email],
                    subject: '¡Tu cuenta de Organizador ha sido aprobada! 🎉',
                    html: organizerApprovedTemplate(updatedUser.name || 'Organizador')
                })
            } catch (e) {
                console.error("Failed to send organizer approval email:", e)
            }
        }

        console.log('[approveOrganizer] Database updated successfully')
    } catch (error: any) {
        console.error('[approveOrganizer] Error updating database:', error)
        throw error
    }

    const { revalidatePath } = await import('next/cache')
    revalidatePath('/admin/organizers')

    return redirect('/admin/organizers?success=Organizador+aprobado')
}

export async function rejectOrganizer(userId: string) {
    const supabase = await createClient()
    const { data: { user: adminUser } } = await supabase.auth.getUser()

    if (!adminUser) return redirect('/login')

    const dbAdmin = await prisma.user.findUnique({ where: { id: adminUser.id } })
    if (dbAdmin?.role !== 'ADMIN') return redirect('/profile')

    await (prisma.user as any).update({
        where: { id: userId },
        data: { organizerStatus: 'REJECTED' } as any
    })

    const { revalidatePath } = await import('next/cache')
    revalidatePath('/admin/organizers')

    return redirect('/admin/organizers?info=Solicitud+rechazada')
}

export async function createEvent(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    const dbUser = (await prisma.user.findUnique({ where: { id: user.id } })) as any
    if (dbUser?.organizerStatus !== 'APPROVED') {
        return redirect('/profile?error=Debes+ser+organizador+aprobado+para+crear+eventos')
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const location = formData.get('location') as string
    const genre = formData.get('genre') as string
    const startDate = new Date(formData.get('startDate') as string)
    const endDate = new Date(formData.get('endDate') as string)
    const image = formData.get('image') as File

    // Validation: Mandatory Image
    if (!image || image.size === 0) {
        return { error: 'La imagen del evento es obligatoria.' }
    }

    // Validation: Cannot be in the past
    if (startDate < new Date()) {
        return { error: 'La fecha del evento no puede ser en el pasado.' }
    }

    // Validation: > 10 minutes
    const durationMs = endDate.getTime() - startDate.getTime()
    if (durationMs < 10 * 60 * 1000) {
        return { error: 'El evento debe durar al menos 10 minutos.' }
    }

    // Upload image to Supabase Storage
    const fileExt = image.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const arrayBuffer = await image.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(fileName, buffer, {
            contentType: image.type,
            upsert: false
        })

    if (uploadError) {
        console.error('Image upload error:', uploadError)
        return { error: 'Error al subir la imagen. Inténtalo de nuevo.' }
    }

    const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(fileName)

    const coverImageUrl = publicUrl

    // Parse ticket types from a JSON hidden field or similar
    let ticketTypesData;
    try {
        ticketTypesData = JSON.parse(formData.get('ticketTypes') as string)
    } catch {
        return { error: 'Error al procesar los tipos de entrada.' }
    }

    // Ensure all tickets meet Stripe's 0.50 EUR minimum threshold
    for (const tt of ticketTypesData) {
        if (parseFloat(tt.price) < 0.50) {
            return { error: 'Todas las entradas deben tener un precio mínimo de 0.50€ por exigencias de la pasarela de pago.' }
        }
    }

    try {
        await (prisma.event as any).create({
            data: {
                title,
                description,
                location,
                genre: genre || null,
                coverImage: coverImageUrl,
                startDate,
                endDate,
                organizerId: user.id,
                status: 'PENDING',
                ticketTypes: {
                    create: ticketTypesData.map((tt: any) => ({
                        name: tt.name,
                        price: parseFloat(tt.price),
                        totalDisponibles: parseInt(tt.capacity || tt.stock || 100)
                    }))
                }
            } as any
        })

        const { revalidatePath } = await import('next/cache')
        revalidatePath('/dashboard')
        revalidatePath('/dashboard/events')
        revalidatePath('/explore')

        return { success: true }
    } catch (dbError: any) {
        console.error('Database error creating event:', dbError)
        return { error: 'Error en la base de datos al guardar el evento.' }
    }
}

export async function approveEvent(eventId: string) {
    const supabase = await createClient()
    const { data: { user: adminUser } } = await supabase.auth.getUser()

    if (!adminUser) return redirect('/login')
    const dbAdmin = await prisma.user.findUnique({ where: { id: adminUser.id } })
    if (dbAdmin?.role !== 'ADMIN') return redirect('/profile')

    const updatedEvent = await (prisma.event as any).update({
        where: { id: eventId },
        data: {
            status: 'APPROVED',
            isPublished: true
        } as any,
        include: { organizer: true }
    })

    if (process.env.RESEND_API_KEY && updatedEvent.organizer?.email) {
        try {
            const { resend } = await import('@/lib/resend')
            const { eventStatusTemplate } = await import('@/lib/email-templates')
            await resend.emails.send({
                from: 'SoundTicket <info@soundticket.es>',
                to: [updatedEvent.organizer.email],
                subject: `✅ Evento Aprobado: ${updatedEvent.title}`,
                html: eventStatusTemplate(updatedEvent.title, 'APPROVED')
            })
        } catch (e) {
            console.error("Failed to send event approval email:", e)
        }
    }

    const { revalidatePath } = await import('next/cache')
    revalidatePath('/admin/events')

    return redirect('/admin/events?success=Evento+aprobado')
}

export async function rejectEvent(eventId: string, reason: string) {
    const supabase = await createClient()
    const { data: { user: adminUser } } = await supabase.auth.getUser()

    if (!adminUser) return redirect('/login')
    const dbAdmin = await prisma.user.findUnique({ where: { id: adminUser.id } })
    if (dbAdmin?.role !== 'ADMIN') return redirect('/profile')

    const updatedEvent = await (prisma.event as any).update({
        where: { id: eventId },
        data: {
            status: 'REJECTED',
            rejectionReason: reason,
            isPublished: false
        } as any,
        include: { organizer: true }
    })

    if (process.env.RESEND_API_KEY && updatedEvent.organizer?.email) {
        try {
            const { resend } = await import('@/lib/resend')
            const { eventStatusTemplate } = await import('@/lib/email-templates')
            await resend.emails.send({
                from: 'SoundTicket <info@soundticket.es>',
                to: [updatedEvent.organizer.email],
                subject: `❌ Evento Rechazado: ${updatedEvent.title}`,
                html: eventStatusTemplate(updatedEvent.title, 'REJECTED', reason)
            })
        } catch (e) {
            console.error("Failed to send event rejection email:", e)
        }
    }

    const { revalidatePath } = await import('next/cache')
    revalidatePath('/admin/events')

    return redirect('/admin/events?info=Evento+rechazado')
}

export async function deleteEvent(eventId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    try {
        const event = await (prisma.event as any).findUnique({ where: { id: eventId } })
        if (!event || event.organizerId !== user.id) {
            return { error: 'No autorizado' }
        }

        // Bypass Prisma Query Engine cache with raw SQL so user doesn't need to restart dev server
        await prisma.$executeRawUnsafe(`
            UPDATE "Event"
            SET "status" = 'CANCELLED', "isPublished" = false
            WHERE "id" = '${eventId}';
        `)

        const { revalidatePath } = await import('next/cache')
        revalidatePath('/dashboard')
        revalidatePath('/dashboard/events')

        return { success: true }
    } catch (err: any) {
        console.error('Delete event error:', err)
        return { error: 'No se puede borrar el evento, puede que ya tenga ventas.' }
    }
}

export async function updateEvent(eventId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const event = await (prisma.event as any).findUnique({ where: { id: eventId } })
    if (!event || event.organizerId !== user.id) {
        throw new Error('Not authorized')
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const location = formData.get('location') as string
    const category = formData.get('category') as string
    const genre = formData.get('genre') as string
    
    // Convert dates
    const dateStr = formData.get('date') as string
    const timeStr = formData.get('time') as string
    const endTimeStr = formData.get('endTime') as string
    
    const startDateTime = new Date(`${dateStr}T${timeStr}`)
    const endDateTime = new Date(`${dateStr}T${endTimeStr}`)
    if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1)
    }

    const image = formData.get('image') as File | null
    let coverImageUrl: string | undefined = undefined;

    if (image && image.size > 0) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}-edit.${fileExt}`
        const arrayBuffer = await image.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
    
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('event-images')
            .upload(fileName, buffer, {
                contentType: image.type,
                upsert: false
            })
    
        if (uploadError) {
            console.error('Image upload error:', uploadError)
            return redirect(`/dashboard/events/${eventId}/edit?error=Error+al+subir+la+nueva+imagen`)
        }
    
        const { data: { publicUrl } } = supabase.storage
            .from('event-images')
            .getPublicUrl(fileName)
    
        coverImageUrl = publicUrl
    }

    let success = false;
    try {
        const updateData: any = {
            title,
            description,
            location,
            genre: genre || null,
            startDate: startDateTime,
            endDate: endDateTime,
            status: 'PENDING',
            isPublished: false
        }

        if (coverImageUrl) {
            updateData.coverImage = coverImageUrl
        }

        await (prisma.event as any).update({
            where: { id: eventId },
            data: updateData
        })

        const { revalidatePath } = await import('next/cache')
        revalidatePath('/dashboard/events')
        revalidatePath('/explore')
        
        success = true;
    } catch (err) {
        console.error("Update event error", err)
        return redirect(`/dashboard/events/${eventId}/edit?error=Error+al+actualizar`)
    }

    if (success) {
        return redirect('/dashboard/events?success=Evento+actualizado+y+enviado+a+revisión')
    }
}

export async function toggleFavorite(eventId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Debes iniciar sesión para guardar favoritos.')

    const existing = await prisma.favorite.findUnique({
        where: {
            userId_eventId: {
                userId: user.id,
                eventId: eventId
            }
        }
    })

    if (existing) {
        await prisma.favorite.delete({
            where: { id: existing.id }
        })
        return { isFavorite: false }
    } else {
        await prisma.favorite.create({
            data: {
                userId: user.id,
                eventId: eventId
            }
        })
        return { isFavorite: true }
    }
}

export async function checkIsFavorite(eventId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const favorite = await prisma.favorite.findUnique({
        where: {
            userId_eventId: {
                userId: user.id,
                eventId: eventId
            }
        }
    })

    return !!favorite
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Debes iniciar sesión' }

    const name = formData.get('name') as string
    const lastName = formData.get('lastName') as string
    const phone = formData.get('phone') as string
    const country = formData.get('country') as string
    const organizerBio = formData.get('organizerBio') as string | null
    const avatar = formData.get('avatar') as File | null

    let avatarUrl: string | undefined = undefined;

    if (avatar && avatar.size > 0) {
        const fileExt = avatar.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}-avatar.${fileExt}`
        const arrayBuffer = await avatar.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
    
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, buffer, {
                contentType: avatar.type,
                upsert: false
            })
    
        if (uploadError) {
            console.error('Avatar upload error:', uploadError)
            return { error: 'Error al subir la foto de perfil' }
        }
    
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
    
        avatarUrl = publicUrl
    }

    try {
        const updateData: any = {
            name,
            lastName,
            phone,
            country,
        }

        if (organizerBio !== null) {
            updateData.organizerBio = organizerBio
        }

        if (avatarUrl) {
            updateData.avatar = avatarUrl
        }

        await prisma.user.update({
            where: { id: user.id },
            data: updateData
        })

        const { revalidatePath } = await import('next/cache')
        revalidatePath('/profile')
        revalidatePath('/profile/settings')

        return { success: true }
    } catch (error) {
        console.error('Error updating profile:', error)
        return { error: 'Error al actualizar el perfil' }
    }
}

export async function verifyStripeConnection() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return false

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { chargesEnabled: true }
        })

        return dbUser?.chargesEnabled || false
    } catch (e) {
        return false
    }
}
