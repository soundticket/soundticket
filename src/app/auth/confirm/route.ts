import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid')

    if (!uid) {
        return redirect('/login?error=Enlace+de+confirmación+inválido.')
    }

    /*
    ### 3. Registro y Confirmación (Resend)
    - **Registro**: Ya no solo crea el usuario en Supabase, sino que sincroniza inmediatamente con Prisma.
    - **Detección de Conflictos**: Si intentas registrarte con un correo que ya existía pero con un ID distinto (por pruebas previas), el sistema detecta el conflicto y limpia el registro antiguo automáticamente.
    - **Confirmación**: La ruta `/auth/confirm` ahora maneja correctamente las redirecciones de Next.js y asegura que el flag `isVerified` se active en la base de datos SQL.
    - **Email de Respaldo**: Como el dominio `soundticket.es` aún requiere verificación DNS, el sistema detecta el fallo y envía automáticamente el email desde `onboarding@resend.dev` para no bloquear al usuario.

    ---

    ## Verificación Realizada

    ### Flujo Completo de Usuario
    1. **Registro**: Verificado flujo desde `/register` con captura de Name, LastName, Phone y Country.
    2. **Email**: Confirmado que llega el correo (vía fallback de Resend).
    3. **Confirmación**: El enlace ahora activa la cuenta en Prisma y redirige al Login con un mensaje de éxito.
    4. **Login**: Verificado que bloquea el acceso si la cuenta no ha sido confirmada vía email.
    */

    let success = false
    let errorCode = ''
    let errorMessage = ''

    try {
        await prisma.user.update({
            where: { id: uid },
            data: { isVerified: true }
        })
        success = true
    } catch (error: any) {
        console.error('Error confirming user:', error)
        errorCode = error.code
        errorMessage = error.message || 'Error desconocido'
    }

    if (success) {
        const successMsg = '¡Cuenta confirmada con éxito! Ya puedes iniciar sesión.'
        return redirect(`/login?message=${encodeURIComponent(successMsg)}`)
    }

    if (errorCode === 'P2025') {
        return redirect('/login?error=El+usuario+no+existe+o+ya+ha+sido+confirmado.')
    }

    return redirect(`/login?error=Error+al+confirmar: ${encodeURIComponent(errorMessage)}`)
}
