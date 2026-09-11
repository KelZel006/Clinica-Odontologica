'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Users, Plus, Search, Phone, Mail, Eye } from 'lucide-react'
import { toast } from 'sonner'

const estadoColor: Record<string, string> = {
  Nuevo: 'bg-blue-100 text-blue-800',
  Activo: 'bg-green-100 text-green-800',
  'En tratamiento': 'bg-orange-100 text-orange-800',
  Finalizado: 'bg-gray-100 text-gray-800',
  Inactivo: 'bg-red-100 text-red-800',
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<any[]>([])
  const [buscar, setBuscar] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', correo: '', sexo: '' })
  const router = useRouter()

  const fetchPacientes = () => {
    setLoading(true)
    fetch(`/api/pacientes?buscar=${encodeURIComponent(buscar)}`)
      .then(r => r.json())
      .then(d => setPacientes(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPacientes() }, [buscar])

  const handleCreate = async () => {
    if (!form.nombre || !form.apellido) { toast.error('Nombre y apellido son obligatorios'); return }
    const res = await fetch('/api/pacientes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    if (res.ok) { toast.success('Paciente creado'); setOpen(false); setForm({ nombre: '', apellido: '', telefono: '', correo: '', sexo: '' }); fetchPacientes() }
    else { const d = await res.json(); toast.error(d?.error || 'Error') }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2"><Users className="w-6 h-6 text-[#1B2E6B]" /> Pacientes</h1>
          <p className="text-sm text-muted-foreground">Gestión de expedientes de pacientes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1B2E6B]"><Plus className="w-4 h-4 mr-2" /> Nuevo Paciente</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nuevo Paciente</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Nombre *</Label><Input value={form.nombre} onChange={(e: any) => setForm({...form, nombre: e.target.value})} /></div>
              <div className="space-y-1"><Label>Apellido *</Label><Input value={form.apellido} onChange={(e: any) => setForm({...form, apellido: e.target.value})} /></div>
              <div className="space-y-1"><Label>Teléfono</Label><Input value={form.telefono} onChange={(e: any) => setForm({...form, telefono: e.target.value})} /></div>
              <div className="space-y-1"><Label>Correo</Label><Input type="email" value={form.correo} onChange={(e: any) => setForm({...form, correo: e.target.value})} /></div>
              <div className="space-y-1 col-span-2"><Label>Sexo</Label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm bg-background" value={form.sexo} onChange={(e: any) => setForm({...form, sexo: e.target.value})}>
                  <option value="">Seleccionar</option><option value="M">Masculino</option><option value="F">Femenino</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button className="bg-[#1B2E6B]" onClick={handleCreate}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre, correo o teléfono..." className="pl-10" value={buscar} onChange={(e: any) => setBuscar(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B2E6B]"></div></div>
      ) : (pacientes?.length ?? 0) === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No se encontraron pacientes</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {pacientes.map((p: any) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/pacientes/${p.id}`)}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1B2E6B] flex items-center justify-center text-white font-bold text-sm">
                    {(p.nombre?.[0] ?? '')}{(p.apellido?.[0] ?? '')}
                  </div>
                  <div>
                    <p className="font-medium">{p.nombre} {p.apellido}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {p.telefono && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{p.telefono}</span>}
                      {p.correo && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{p.correo}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={estadoColor[p.estado] ?? 'bg-gray-100'}>{p.estado}</Badge>
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
