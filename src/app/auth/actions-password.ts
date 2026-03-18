import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function resetPassword(formData: FormData) {
    const email = formData.get("email") as string
    const supabase = await createClient()

    if (!email) {
        return redirect("/auth/forgot-password?error=Por+favor,+ingresa+tu+correo")
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password`,
    })

    if (error) {
        console.error("Reset password error:", error.message)
        return redirect('/auth/forgot-password?error=' + encodeURIComponent(error.message))
    }

    return redirect("/auth/forgot-password?success=Revisa+tu+correo+para+el+enlace+de+recuperaci%C3%B3n")
}

export async function updatePassword(formData: FormData) {
    const password = formData.get("password") as string
    const supabase = await createClient()

    if (!password || password.length < 6) {
        return redirect("/auth/reset-password?error=La+contrase%C3%B1a+debe+tener+al+menos+6+caracteres")
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        console.error("Update password error:", error.message)
        return redirect('/auth/reset-password?error=' + encodeURIComponent(error.message))
    }

    return redirect("/login?message=Contrase%C3%B1a+actualizada+correctamente")
}
