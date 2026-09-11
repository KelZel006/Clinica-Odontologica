'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Wallet, Plus, CreditCard, TrendingUp, AlertCircle, X } from 'lucide-react'
import { toast } from 'sonner'
import { PacienteCombobox } from '@/components/app/paciente-combobox'

const metodosPago = ['Efectivo', 'Transferencia bancaria', 'Tarjeta', 'Depósito bancario', 'Otro']
function formatLps(n: number) { return `Lps ${(n ?? 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })}` }

const emptyForm = { pacienteId: '', pacienteTratamientoId: '', monto: 0, metodoPago: 'Efectivo', numeroRecibo: '', observaciones: '' }

export default function FinanzasPage() {
  const [abonos, setAbonos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [pacientes, setPacientes] = useState<any[]>([])
  const [porPagar, setPorPagar] = useState<number | null>(null)
  const [filtroPacienteId, setFiltroPacienteId] = useState('')
  const [tratamientos, setTratamientos] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<typeof emptyForm>(emptyForm)

  const fetchAbonos = (pacienteId?: string) => {
    setLoading(true)
    const url = pacienteId ? `/api/abonos?pacienteId=${pacienteId}` : '/api/abonos'
    fetch(url).then(r => r.json()).then(d => setAbonos(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
  }
  useEffect(() => { fetchAbonos(filtroPacienteId || undefined) }, [filtroPacienteId])
  useEffect(() => { fetch('/api/pacientes').then(r => r.json()).then(d => setPacientes(Array.isArray(d) ? d : [])) }, [])
  const fetchResumen = () => { fetch('/api/dashboard').then(r => r.json()).then(d => setPorPagar(d?.porPagar ?? null)).catch(() => setPorPagar(null)) }
  useEffect(() => { fetchResumen() }, [])

  // Cargar tratamientos del paciente seleccionado en el formulario
  useEffect(() => {
    if (!form.pacienteId) { setTratamientos([]); return }
    fetch(`/api/pacientes/${form.pacienteId}`).then(r => r.json()).then(d => setTratamientos(Array.isArray(d?.tratamientosPaciente) ? d.tratamientosPaciente : [])).catch(() => setTratamientos([]))
  }, [form.pacienteId])

  const totalAbonado = (abonos ?? []).reduce((s: number, a: any) => s + (a?.monto ?? 0), 0)

  const handleCreate = async () => {
    if (!form.pacienteId || !form.monto) { toast.error('Paciente y monto son requeridos'); return }
    setSaving(true)
    const payload: any = { ...form, pacienteTratamientoId: form.pacienteTratamientoId || null }
    const res = await fetch('/api/abonos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    setSaving(false)
    if (res.ok) {
      toast.success('Abono registrado')
      setOpen(false)
      setForm(emptyForm)
      fetchAbonos(filtroPacienteId || undefined)
      fetchResumen()
    } else { toast.error('Error al registrar abono') }
  }

  const openDialog = () => { setForm(emptyForm); setOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight flex items-center gap-2"><Wallet className="w-6 h-6 text-[#1B2E6B]" /> Cobros</h1>
          <p className="text-sm text-muted-foreground">Control de abonos y pagos</p>
        </div>
        <Button className="bg-[#1B2E6B]" onClick={openDialog}><Plus className="w-4 h-4 mr-2" /> Registrar Abono</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-5 flex items-center gap-4"><div className="bg-emerald-50 p-3 rounded-xl"><TrendingUp className="w-6 h-6 text-emerald-600" /></div><div><p className="text-lg font-bold font-mono">{formatLps(totalAbonado)}</p><p className="text-xs text-muted-foreground">{filtroPacienteId ? 'Abonado (paciente)' : 'Total Abonado'}</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><div className="bg-blue-50 p-3 rounded-xl"><CreditCard className="w-6 h-6 text-[#2563EB]" /></div><div><p className="text-lg font-bold font-mono">{abonos?.length ?? 0}</p><p className="text-xs text-muted-foreground">{filtroPacienteId ? 'Abonos (paciente)' : 'Total de Abonos'}</p></div></CardContent></Card>
        <Card><CardContent className="p-5 flex items-center gap-4"><div className="bg-orange-50 p-3 rounded-xl"><AlertCircle className="w-6 h-6 text-orange-600" /></div><div><p className="text-lg font-bold font-mono text-orange-600">{porPagar === null ? 'Lps --' : formatLps(porPagar)}</p><p className="text-xs text-muted-foreground">Por Pagar (total)</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base">Historial de Abonos</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-80">
            <div className="flex-1">
              <PacienteCombobox pacientes={pacientes} value={filtroPacienteId} onChange={setFiltroPacienteId} allowClear placeholder="Filtrar por paciente..." clearLabel="Todos los pacientes" />
            </div>
            {filtroPacienteId && <Button variant="ghost" size="icon" onClick={() => setFiltroPacienteId('')} title="Quitar filtro"><X className="w-4 h-4" /></Button>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B2E6B]"></div></div>
          ) : (abonos?.length ?? 0) === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No hay abonos {filtroPacienteId ? 'para este paciente' : 'registrados'}.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Fecha</th>
                    <th className="text-left p-3">Paciente</th>
                    <th className="text-left p-3">Tratamiento</th>
                    <th className="text-left p-3">Monto</th>
                    <th className="text-left p-3">Método</th>
                    <th className="text-left p-3">Recibo</th>
                    <th className="text-left p-3">Registrado por</th>
                  </tr>
                </thead>
                <tbody>
                  {(abonos ?? []).map((a: any) => (
                    <tr key={a.id} className="border-t hover:bg-muted/50">
                      <td className="p-3">{new Date(a.fecha).toLocaleDateString('es-HN')}</td>
                      <td className="p-3">{a?.paciente?.nombre ?? ''} {a?.paciente?.apellido ?? ''}</td>
                      <td className="p-3">{a?.pacienteTratamiento?.tratamiento?.nombre ?? '-'}</td>
                      <td className="p-3 font-mono font-medium text-[#1B2E6B]">{formatLps(a.monto)}</td>
                      <td className="p-3"><Badge variant="outline">{a.metodoPago}</Badge></td>
                      <td className="p-3">{a.numeroRecibo || '-'}</td>
                      <td className="p-3">{a?.registradoPor?.nombre ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Abono</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Paciente *</Label>
              <PacienteCombobox pacientes={pacientes} value={form.pacienteId} onChange={(id) => setForm({ ...form, pacienteId: id, pacienteTratamientoId: '' })} placeholder="Buscar paciente por nombre..." />
            </div>
            {form.pacienteId && (
              <div className="space-y-1"><Label>Tratamiento (opcional)</Label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm bg-background" value={form.pacienteTratamientoId} onChange={(e: any) => setForm({ ...form, pacienteTratamientoId: e.target.value })}>
                  <option value="">Abono general (sin tratamiento)</option>
                  {(tratamientos ?? []).map((t: any) => (
                    <option key={t.id} value={t.id}>{t?.tratamiento?.nombre ?? 'Tratamiento'} — {formatLps(t.costoTotal)}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1"><Label>Monto (Lps) *</Label><Input type="number" value={form.monto} onChange={(e: any) => setForm({...form, monto: parseFloat(e.target.value) || 0})} /></div>
            <div className="space-y-1"><Label>Método de Pago</Label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm bg-background" value={form.metodoPago} onChange={(e: any) => setForm({...form, metodoPago: e.target.value})}>
                {metodosPago.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label>Número de Recibo</Label><Input value={form.numeroRecibo} onChange={(e: any) => setForm({...form, numeroRecibo: e.target.value})} /></div>
            <div className="space-y-1"><Label>Observaciones</Label><textarea className="w-full border rounded-lg px-3 py-2 text-sm bg-background min-h-[60px]" value={form.observaciones} onChange={(e: any) => setForm({...form, observaciones: e.target.value})} /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
            <Button className="bg-[#1B2E6B]" onClick={handleCreate} disabled={saving}>{saving ? 'Registrando...' : 'Registrar Abono'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
