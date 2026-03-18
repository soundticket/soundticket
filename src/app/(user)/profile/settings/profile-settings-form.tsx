"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User as UserIcon, Camera, Loader2, Save, Phone, MapPin, AlignLeft } from "lucide-react"
import { updateProfile } from "@/app/auth/actions"
import { toast } from "sonner"

export default function ProfileSettingsForm({ user }: { user: any }) {
    const [loading, setLoading] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const fileInput = formData.get('avatar') as File | null

        // Comprimir imagen pesada en lado cliente (bypass del error de Turbopack)
        if (fileInput && fileInput.size > 0 && fileInput.type.startsWith('image/')) {
            try {
                const compressedBlob = await compressImage(fileInput)
                formData.set('avatar', new File([compressedBlob], fileInput.name, { type: 'image/jpeg' }))
            } catch (err) {
                console.error("No se pudo comprimir la imagen en cliente:", err)
            }
        }

        const res = await updateProfile(formData)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Perfil actualizado con éxito")
        }

        setLoading(false)
    }

    // Función auxiliar para reducir tamaño vía Canvas HTML5
    function compressImage(file: File): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image()
            const url = URL.createObjectURL(file)
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height
                const maxDim = 800

                if (width > height && width > maxDim) {
                    height *= maxDim / width
                    width = maxDim
                } else if (height > maxDim) {
                    width *= maxDim / height
                    height = maxDim
                }

                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                if (!ctx) return reject('No ctx')
                
                ctx.drawImage(img, 0, 0, width, height)
                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(url)
                    blob ? resolve(blob) : reject('toBlob failed')
                }, 'image/jpeg', 0.8)
            }
            img.onerror = (e) => reject(e)
            img.src = url
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Avatar Sidebar */}
                <div className="space-y-8 lg:col-span-1">
                    <Card className="bg-card/40 backdrop-blur-xl border-border/50 overflow-hidden text-center">
                        <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                            <CardTitle className="text-sm italic">Foto de Perfil</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 flex flex-col items-center justify-center">
                            <div className="relative group cursor-pointer rounded-full overflow-hidden w-40 h-40 border-4 border-background shadow-xl mb-4">
                                <input 
                                    type="file" 
                                    name="avatar" 
                                    accept="image/*" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            setAvatarPreview(URL.createObjectURL(file))
                                        }
                                    }}
                                />
                                {avatarPreview ? (
                                    <>
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar"
                                            className="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-40"
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <div className="bg-background/80 p-2 rounded-full backdrop-blur-sm mb-1 shadow-xl">
                                                <Camera className="h-5 w-5 text-primary" />
                                            </div>
                                            <p className="text-[10px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">CAMBIAR</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/50 hover:bg-muted/80 transition-colors">
                                        <UserIcon className="h-12 w-12 mb-2 opacity-30" />
                                        <p className="text-[10px] font-bold">Subir foto</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">Recomendado: 500x500px, máx 2MB</p>
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground h-12 text-md font-black italic shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:shadow-[0_0_25px_rgba(var(--primary),0.4)] transition-all hover:-translate-y-1">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-card/40 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
                        <CardHeader className="bg-muted/10 border-b border-border/40">
                            <CardTitle className="flex items-center gap-2">
                                <span className="p-2 bg-primary/10 rounded-xl"><UserIcon className="w-5 h-5 text-primary" /></span>
                                Información Personal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre</Label>
                                    <Input id="name" name="name" defaultValue={user.name || ""} placeholder="Ej. Juan" className="bg-background/50 h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Apellidos</Label>
                                    <Input id="lastName" name="lastName" defaultValue={user.lastName || ""} placeholder="Ej. Pérez" className="bg-background/50 h-11" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Correo Electrónico</Label>
                                <Input id="email" defaultValue={user.email} disabled className="bg-background/30 h-11 cursor-not-allowed opacity-70" />
                                <p className="text-[10px] text-muted-foreground mt-1 text-right">El correo electrónico no se puede cambiar.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Teléfono</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="phone" name="phone" defaultValue={user.phone || ""} placeholder="+34 600 000 000" className="pl-10 bg-background/50 h-11" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country" className="text-xs font-black uppercase tracking-widest text-muted-foreground">País</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                        <Input id="country" name="country" defaultValue={user.country || ""} placeholder="España" className="pl-10 bg-background/50 h-11" />
                                    </div>
                                </div>
                            </div>

                            {user.organizerStatus === 'APPROVED' && (
                                <div className="space-y-2 pt-4 border-t border-border/50">
                                    <Label htmlFor="organizerBio" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <AlignLeft className="h-3 w-3" /> Biografía de Organizador
                                    </Label>
                                    <Textarea 
                                        id="organizerBio" 
                                        name="organizerBio" 
                                        defaultValue={user.organizerBio || ""} 
                                        placeholder="Cuéntale a tu público sobre tu marca, tus eventos pasados y qué esperar de ti." 
                                        rows={4} 
                                        className="bg-background/50 resize-none" 
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    )
}
