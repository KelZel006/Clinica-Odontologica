'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { UserCog, Plus, Shield } from 'lucide-react'
import { toast } from 'sonner'

const roles = [
  { value: 'admin', label: 'Administrador' },
  { value: 'recepcionista', label: 'Recepcionista' },
  { value: 'odontologo', label: 'Odontólogo' },
  { value: 'asistente', label: 'Asistente' },
]
const roleColor: Record<string, string> = { admin: 'bg-red-100 text-red-800', recepcionista: 'bg-blue-100 text-blue-800', odontologo: 'bg-green-100 text-green-800', asistente: 'bg-gray-100 text-gray-800' }

export default function UsuariosPage() {
  const { data: session } = useSession()
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'recepcionista', telefono: '' })

  const fetchUsuarios = () => {
    setLoading(true)
    fetch('/api/usuarios').then(r => r.json()).then(d => setUsuarios(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }
  useEffect(() => { fetchUsuarios() }, [])

  const handleCreate = async () => {
    if (!form.nombre || !form.email || !form.password) { toast.error('Nombre, correo y contraseña son obligatorios'); return }
    const res = await fetch('/api/usuarios', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { toast.success('Usuario creado'); setOpen(false); fetchUsuarios(); setForm({ nombre: '', email: '', password: '', rol: 'recepcionista', telefono: '' }) }
    else { const d = await res.json(); toast.error(d?.error || 'Error') }
  }

  const isAdmin = session?.user?.role === 'admin'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2"><UserCog className="w-6 h-6 text-[#1B2E6B]" /> Usuarios</h1>
          <p className="text-sm text-muted-foreground">Gestión de usuarios y roles del sistema</p>
        </div>
        {isAdmin && <Button className="bg-[#1B2E6B]" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Nuevo Usuario</Button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B2E6B]"></div></div>
      ) : (
        <div className="grid gap-3">
          {(usuarios ?? []).map((u: any) => (
            <Card key={u.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1B2E6B] flex items-center justify-center text-white font-bold text-sm">
                    {(u.nombre?.[0] ?? '').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{u.nombre}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={roleColor[u.rol] ?? 'bg-gray-100'}>
                    <Shield className="w-3 h-3 mr-1" />
                    {roles.find(r => r.value === u.rol)?.label ?? u.rol}
                  </Badge>
                  <Badge variant={u.activo ? 'default' : 'destructive'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo Usuario</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Nombre *</Label><Input value={form.nombre} onChange={(e: any) => setForm({...form, nombre: e.target.value})} /></div>
            <div className="space-y-1"><Label>Correo *</Label><Input type="email" value={form.email} onChange={(e: any) => setForm({...form, email: e.target.value})} /></div>
            <div className="space-y-1"><Label>Contraseña *</Label><Input type="password" value={form.password} onChange={(e: any) => setForm({...form, password: e.target.value})} /></div>
            <div className="space-y-1"><Label>Rol</Label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm bg-background" value={form.rol} onChange={(e: any) => setForm({...form, rol: e.target.value})}>
                {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label>Teléfono</Label><Input value={form.telefono} onChange={(e: any) => setForm({...form, telefono: e.target.value})} /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="bg-[#1B2E6B]" onClick={handleCreate}>Crear Usuario</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
