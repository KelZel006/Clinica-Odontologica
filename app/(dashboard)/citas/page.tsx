'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { CalendarDays, Plus, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

const estadoColor: Record<string, string> = {
  Programada: 'bg-blue-100 text-blue-800',
  Confirmada: 'bg-green-100 text-green-800',
  'En progreso': 'bg-yellow-100 text-yellow-800',
  Completada: 'bg-gray-100 text-gray-800',
  Cancelada: 'bg-red-100 text-red-800',
  'No asistió': 'bg-orange-100 text-orange-800',
}

export default function CitasPage() {
  const [citas, setCitas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [pacientes, setPacientes] = useState<any[]>([])
  const [vista, setVista] = useState<'dia' | 'semana' | 'mes'>('semana')
  const [fechaBase, setFechaBase] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setFechaBase(new Date()); setMounted(true) }, [])
  const [form, setForm] = useState({
    pacienteId: '', titulo: '', motivo: '', fechaInicio: '', fechaFin: '', odontologoId: '', consultorioId: '',
  })

  const fetchCitas = () => {
    if (!fechaBase) return
    setLoading(true)
    const inicio = new Date(fechaBase)
    const fin = new Date(fechaBase)
    if (vista === 'dia') { fin.setDate(fin.getDate() + 1) }
    else if (vista === 'semana') { inicio.setDate(inicio.getDate() - inicio.getDay()); fin.setDate(inicio.getDate() + 7) }
    else { inicio.setDate(1); fin.setMonth(fin.getMonth() + 1); fin.setDate(0) }
    fetch(`/api/citas?inicio=${inicio.toISOString()}&fin=${fin.toISOString()}`)
      .then(r => r.json())
      .then(d => setCitas(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCitas() }, [fechaBase, vista])
  useEffect(() => {
    fetch('/api/pacientes').then(r => r.json()).then(d => setPacientes(Array.isArray(d) ? d : []))
  }, [])

  const navigate = (dir: number) => {
    if (!fechaBase) return
    const d = new Date(fechaBase)
    if (vista === 'dia') d.setDate(d.getDate() + dir)
    else if (vista === 'semana') d.setDate(d.getDate() + dir * 7)
    else d.setMonth(d.getMonth() + dir)
    setFechaBase(d)
  }

  const handleCreate = async () => {
    if (!form.pacienteId || !form.fechaInicio || !form.fechaFin) {
      toast.error('Paciente, fecha inicio y fin son requeridos'); return
    }
    const res = await fetch('/api/citas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, fechaInicio: new Date(form.fechaInicio).toISOString(), fechaFin: new Date(form.fechaFin).toISOString() }),
    })
    if (res.ok) {
      toast.success('Cita creada'); setOpen(false); fetchCitas()
      setForm({ pacienteId: '', titulo: '', motivo: '', fechaInicio: '', fechaFin: '', odontologoId: '', consultorioId: '' })
    } else { const d = await res.json(); toast.error(d?.error || 'Error al crear cita') }
  }

  const updateEstado = async (id: string, estado: string) => {
    const res = await fetch(`/api/citas/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }),
    })
    if (res.ok) { toast.success('Estado actualizado'); fetchCitas() }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2"><CalendarDays className="w-6 h-6 text-[#1B2E6B]" /> Citas</h1>
          <p className="text-sm text-muted-foreground">Gestión de citas y calendario</p>
        </div>
        <Button className="bg-[#1B2E6B]" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Nueva Cita</Button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}><ChevronRight className="w-4 h-4" /></Button>
          <span className="text-sm font-medium ml-2">{fechaBase?.toLocaleDateString?.('es-HN', { year: 'numeric', month: 'long', day: vista === 'dia' ? 'numeric' : undefined }) ?? ''}</span>
        </div>
        <div className="flex gap-1">
          {(['dia', 'semana', 'mes'] as const).map(v => (
            <Button key={v} variant={vista === v ? 'default' : 'outline'} size="sm" onClick={() => setVista(v)} className={vista === v ? 'bg-[#1B2E6B]' : ''}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B2E6B]"></div></div>
      ) : (citas?.length ?? 0) === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No hay citas en este período</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {citas.map((c: any) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Clock className="w-5 h-5 text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{c.titulo || c.motivo || 'Cita'}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" /> {c?.paciente?.nombre ?? ''} {c?.paciente?.apellido ?? ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.fechaInicio).toLocaleDateString('es-HN')} {new Date(c.fechaInicio).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })} - {new Date(c.fechaFin).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {c?.odontologo?.nombre && <p className="text-xs text-[#2563EB]">Dr. {c.odontologo.nombre}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={estadoColor[c.estado] ?? 'bg-gray-100'}>{c.estado}</Badge>
                    {c.estado === 'Programada' && <Button size="xs" variant="outline" onClick={() => updateEstado(c.id, 'Confirmada')}>Confirmar</Button>}
                    {c.estado === 'Confirmada' && <Button size="xs" variant="outline" onClick={() => updateEstado(c.id, 'Completada')}>Completar</Button>}
                    {c.estado !== 'Cancelada' && c.estado !== 'Completada' && <Button size="xs" variant="outline" className="text-red-600" onClick={() => updateEstado(c.id, 'Cancelada')}>Cancelar</Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nueva Cita</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Paciente *</Label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm bg-background" value={form.pacienteId} onChange={(e: any) => setForm({...form, pacienteId: e.target.value})}>
                <option value="">Seleccionar paciente</option>
                {(pacientes ?? []).map((p: any) => <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label>Título</Label><Input value={form.titulo} onChange={(e: any) => setForm({...form, titulo: e.target.value})} /></div>
            <div className="space-y-1"><Label>Motivo</Label><Input value={form.motivo} onChange={(e: any) => setForm({...form, motivo: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Inicio *</Label><Input type="datetime-local" value={form.fechaInicio} onChange={(e: any) => setForm({...form, fechaInicio: e.target.value})} /></div>
              <div className="space-y-1"><Label>Fin *</Label><Input type="datetime-local" value={form.fechaFin} onChange={(e: any) => setForm({...form, fechaFin: e.target.value})} /></div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="bg-[#1B2E6B]" onClick={handleCreate}>Crear Cita</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
