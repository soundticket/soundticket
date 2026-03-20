import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/profile'

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            const user = data.user
            
            // If it's a password recovery request, redirect immediately to reset-password
            if (type === 'recovery') {
                return NextResponse.redirect(`${origin}/auth/reset-password`)
            }

            // Sync with Prisma (Optional/Non-blocking)
            try {
                await prisma.user.upsert({
                    where: { id: user.id },
                    update: {
                        role: user.email === 'vikfaded@gmail.com' ? 'ADMIN' : undefined
                    } as any,
                    create: {
                        id: user.id,
                        email: user.email!,
                        name: user.user_metadata.full_name?.split(' ')[0] || user.user_metadata.name || user.user_metadata.first_name || '',
                        lastName: user.user_metadata.full_name?.split(' ').slice(1).join(' ') || user.user_metadata.last_name || '',
                        isVerified: true,
                        role: user.email === 'vikfaded@gmail.com' ? 'ADMIN' : 'USER',
                        organizerStatus: 'NONE'
                    } as any,
                })
                console.log('Prisma sync successful via Google Callback for:', user.email)
            } catch (dbError) {
                console.error('Error syncing user with Prisma in callback (ignored to allow login):', dbError)
            }

            const isLocalEnv = process.env.NODE_ENV === 'development'
            const host = request.headers.get('host')

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (host) {
                return NextResponse.redirect(`https://${host}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=Fallo+en+la+autenticación+con+Google`)
}
