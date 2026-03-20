import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(null, { status: 401 })
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, role: true, organizerStatus: true, name: true }
        })

        return NextResponse.json(dbUser)
    } catch {
        return NextResponse.json(null, { status: 500 })
    }
}
