'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react'

export default function SignupPage() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nombre }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Error al registrarse')
        return
      }
      const signInRes = await signIn('credentials', { email, password, redirect: false })
      if (signInRes?.error) {
        setError('Cuenta creada, pero error al iniciar sesión')
      } else {
        router.replace('/dashboard')
      }
    } catch {
      setError('Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B2E6B] via-[#1e3a80] to-[#2563EB] p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" priority />
            </div>
          </div>
          <h1 className="text-xl font-display font-bold text-[#1B2E6B] tracking-tight">Crear Cuenta</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete los datos para registrarse</p>
        </CardHeader>
        <CardContent className="pt-4 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label>Nombre completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Dr. Juan Pérez" className="pl-10" value={nombre} onChange={(e: any) => setNombre(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" placeholder="correo@ejemplo.com" className="pl-10" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" className="pl-10" value={password} onChange={(e: any) => setPassword(e.target.value)} required minLength={6} />
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#1B2E6B] hover:bg-[#1B2E6B]/90" loading={loading}>
              <UserPlus className="w-4 h-4 mr-2" /> Registrarse
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tiene cuenta?{' '}
            <Link href="/login" className="text-[#2563EB] hover:underline font-medium">Iniciar Sesión</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
