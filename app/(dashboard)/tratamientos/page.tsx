'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Stethoscope, Plus, Search, Edit, Coins } from 'lucide-react'
import { toast } from 'sonner'

const categorias = ['Implantología', 'Odontología General', 'Endodoncia', 'Ortodoncia', 'Cirugía', 'Estética', 'Periodoncia', 'Prótesis', 'Otro']

function formatLps(n: number) { return `Lps ${(n ?? 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })}` }

export default function TratamientosPage() {
  const [tratamientos, setTratamientos] = useState<any[]>([])
  const [buscar, setBuscar] = useState('')
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState({ nombre: '', categoria: '', descripcion: '', precio: 0, duracionMinutos: 30, indicaciones: '', cuidados: '' })

  const fetchData = () => {
    setLoading(true)
    fetch('/api/tratamientos').then(r => r.json()).then(d => setTratamientos(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

  const handleSave = async () => {
    if (!form.nombre) { toast.error('Nombre es obligatorio'); return }
    const url = editItem ? `/api/tratamientos/${editItem.id}` : '/api/tratamientos'
    const method = editItem ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { toast.success(editItem ? 'Actualizado' : 'Creado'); setOpen(false); setEditItem(null); resetForm(); fetchData() }
    else { toast.error('Error al guardar') }
  }

  const resetForm = () => setForm({ nombre: '', categoria: '', descripcion: '', precio: 0, duracionMinutos: 30, indicaciones: '', cuidados: '' })
  const openEdit = (t: any) => { setEditItem(t); setForm({ nombre: t.nombre, categoria: t.categoria || '', descripcion: t.descripcion || '', precio: t.precio, duracionMinutos: t.duracionMinutos || 30, indicaciones: t.indicaciones || '', cuidados: t.cuidados || '' }); setOpen(true) }
  const openNew = () => { setEditItem(null); resetForm(); setOpen(true) }

  const filtered = (tratamientos ?? []).filter((t: any) =>
    !buscar || (t.nombre ?? '').toLowerCase().includes(buscar.toLowerCase()) || (t.categoria ?? '').toLowerCase().includes(buscar.toLowerCase())
  ).filter((t: any) => t.activo !== false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2"><Stethoscope className="w-6 h-6 text-[#1B2E6B]" /> Tratamientos</h1>
          <p className="text-sm text-muted-foreground">Catálogo de tratamientos y servicios</p>
        </div>
        <Button className="bg-[#1B2E6B]" onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Nuevo Tratamiento</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar tratamiento..." className="pl-10" value={buscar} onChange={(e: any) => setBuscar(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B2E6B]"></div></div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t: any) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm">{t.nombre}</h3>
                  <button onClick={() => openEdit(t)} className="text-muted-foreground hover:text-[#2563EB]"><Edit className="w-4 h-4" /></button>
                </div>
                {t.categoria && <p className="text-xs text-[#2563EB] mb-2">{t.categoria}</p>}
                {t.descripcion && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{t.descripcion}</p>}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 font-bold text-[#1B2E6B]"><Coins className="w-4 h-4" />{formatLps(t.precio)}</span>
                  {t.duracionMinutos && <span className="text-xs text-muted-foreground">{t.duracionMinutos} min</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? 'Editar' : 'Nuevo'} Tratamiento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Nombre *</Label><Input value={form.nombre} onChange={(e: any) => setForm({...form, nombre: e.target.value})} /></div>
            <div className="space-y-1"><Label>Categoría</Label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm bg-background" value={form.categoria} onChange={(e: any) => setForm({...form, categoria: e.target.value})}>
                <option value="">Seleccionar</option>{categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label>Descripción</Label><textarea className="w-full border rounded-lg px-3 py-2 text-sm bg-background min-h-[60px]" value={form.descripcion} onChange={(e: any) => setForm({...form, descripcion: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Precio (Lps)</Label><Input type="number" value={form.precio} onChange={(e: any) => setForm({...form, precio: parseFloat(e.target.value) || 0})} /></div>
              <div className="space-y-1"><Label>Duración (min)</Label><Input type="number" value={form.duracionMinutos} onChange={(e: any) => setForm({...form, duracionMinutos: parseInt(e.target.value) || 30})} /></div>
            </div>
            <div className="space-y-1"><Label>Indicaciones</Label><textarea className="w-full border rounded-lg px-3 py-2 text-sm bg-background min-h-[50px]" value={form.indicaciones} onChange={(e: any) => setForm({...form, indicaciones: e.target.value})} /></div>
            <div className="space-y-1"><Label>Cuidados posteriores</Label><textarea className="w-full border rounded-lg px-3 py-2 text-sm bg-background min-h-[50px]" value={form.cuidados} onChange={(e: any) => setForm({...form, cuidados: e.target.value})} /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button className="bg-[#1B2E6B]" onClick={handleSave}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
