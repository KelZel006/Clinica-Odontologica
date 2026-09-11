'use client'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Save, History, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const CUADRANTES = [
  { label: 'Cuadrante 1', piezas: [18, 17, 16, 15, 14, 13, 12, 11] },
  { label: 'Cuadrante 2', piezas: [21, 22, 23, 24, 25, 26, 27, 28] },
  { label: 'Cuadrante 4', piezas: [48, 47, 46, 45, 44, 43, 42, 41] },
  { label: 'Cuadrante 3', piezas: [31, 32, 33, 34, 35, 36, 37, 38] },
]

const ESTADOS = [
  { value: 'Sano', label: 'Sano', color: '#FFFFFF', border: '#CBD5E1' },
  { value: 'Caries', label: 'Caries', color: '#EF4444', border: '#DC2626' },
  { value: 'Obturación', label: 'Obturación', color: '#94A3B8', border: '#64748B' },
  { value: 'Corona', label: 'Corona', color: '#1B2E6B', border: '#1B2E6B' },
  { value: 'Endodoncia', label: 'Endodoncia', color: '#F97316', border: '#EA580C' },
  { value: 'Ausente', label: 'Ausente', color: '#F1F5F9', border: '#94A3B8', symbol: '✕' },
  { value: 'Implante', label: 'Implante', color: '#38BDF8', border: '#0EA5E9' },
  { value: 'Prótesis', label: 'Prótesis', color: '#A855F7', border: '#9333EA' },
  { value: 'Sellante', label: 'Sellante', color: '#93C5FD', border: '#60A5FA' },
  { value: 'Fractura', label: 'Fractura', color: '#FCD34D', border: '#F59E0B' },
]

const SUPERFICIES = ['Mesial', 'Distal', 'Vestibular', 'Lingual/Palatina', 'Oclusal/Incisal']

function getEstadoStyle(estado: string) {
  return ESTADOS.find(e => e.value === estado) ?? ESTADOS[0]
}

interface Props {
  pacienteId: string
}

export default function OdontogramaInteractivo({ pacienteId }: Props) {
  const [odontograma, setOdontograma] = useState<any>(null)
  const [piezasData, setPiezasData] = useState<Record<number, any>>({})
  const [selectedPieza, setSelectedPieza] = useState<number | null>(null)
  const [formPieza, setFormPieza] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchOdontograma = useCallback(async () => {
    try {
      const res = await fetch(`/api/odontograma?pacienteId=${pacienteId}`)
      const data = await res.json()
      setOdontograma(data)
      const pMap: Record<number, any> = {}
      ;(data?.piezas ?? []).forEach((p: any) => { pMap[p.numeroPieza] = p })
      setPiezasData(pMap)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [pacienteId])

  useEffect(() => { fetchOdontograma() }, [fetchOdontograma])

  const handleSelectPieza = (num: number) => {
    setSelectedPieza(num)
    const existing = piezasData[num]
    if (existing) {
      setFormPieza({
        estado: existing.estado ?? 'Sano',
        diagnostico: existing.diagnostico ?? '',
        tratamiento: existing.tratamiento ?? '',
        superficies: existing.superficies ?? {},
        observaciones: existing.observaciones ?? '',
        implanteMarca: existing.implanteMarca ?? '',
        implanteModelo: existing.implanteModelo ?? '',
        implanteDiametro: existing.implanteDiametro ?? '',
        implanteLongitud: existing.implanteLongitud ?? '',
        implanteFechaColocacion: existing.implanteFechaColocacion ? new Date(existing.implanteFechaColocacion).toISOString().split('T')[0] : '',
        implanteFechaCarga: existing.implanteFechaCarga ? new Date(existing.implanteFechaCarga).toISOString().split('T')[0] : '',
      })
    } else {
      setFormPieza({ estado: 'Sano', diagnostico: '', tratamiento: '', superficies: {}, observaciones: '', implanteMarca: '', implanteModelo: '', implanteDiametro: '', implanteLongitud: '', implanteFechaColocacion: '', implanteFechaCarga: '' })
    }
  }

  const handleSavePieza = async () => {
    if (!odontograma?.id || selectedPieza === null) return
    setSaving(true)
    try {
      const res = await fetch('/api/odontograma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formPieza, odontogramaId: odontograma.id, numeroPieza: selectedPieza }),
      })
      if (res.ok) {
        toast.success(`Pieza ${selectedPieza} guardada`)
        await fetchOdontograma()
      } else {
        toast.error('Error al guardar')
      }
    } catch { toast.error('Error de red') }
    finally { setSaving(false) }
  }

  const toggleSuperficie = (s: string) => {
    const sups = { ...(formPieza?.superficies ?? {}) }
    sups[s] = !sups[s]
    setFormPieza({ ...formPieza, superficies: sups })
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B2E6B]"></div></div>

  return (
    <div className="space-y-4">
      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            {ESTADOS.map(e => (
              <div key={e.value} className="flex items-center gap-1.5 text-xs">
                <div className="w-4 h-4 rounded border-2" style={{ backgroundColor: e.color, borderColor: e.border }}>
                  {e.symbol && <span className="flex items-center justify-center text-[8px] text-gray-400 font-bold h-full">{e.symbol}</span>}
                </div>
                <span>{e.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Odontograma grid */}
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Odontograma — Numeración FDI</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-1">
              {/* Upper arch */}
              <div className="grid grid-cols-2 gap-2">
                {CUADRANTES.slice(0, 2).map((q, qi) => (
                  <div key={qi}>
                    <p className="text-[10px] text-muted-foreground mb-1 text-center">{q.label}</p>
                    <div className="flex gap-1 justify-center">
                      {q.piezas.map(num => {
                        const pd = piezasData[num]
                        const est = getEstadoStyle(pd?.estado ?? 'Sano')
                        const isSelected = selectedPieza === num
                        return (
                          <button
                            key={num}
                            onClick={() => handleSelectPieza(num)}
                            className={`w-8 h-10 rounded-t-lg border-2 flex flex-col items-center justify-center text-[9px] font-bold transition-all hover:scale-110 ${isSelected ? 'ring-2 ring-[#2563EB] ring-offset-1' : ''}`}
                            style={{ backgroundColor: est.color, borderColor: est.border, color: ['Corona', 'Implante', 'Prótesis', 'Endodoncia', 'Caries'].includes(pd?.estado) ? '#fff' : '#1e293b' }}
                          >
                            {est.symbol ?? num}
                            {!est.symbol && <div className="w-4 h-1 rounded-full mt-0.5" style={{ backgroundColor: est.border, opacity: pd?.estado && pd.estado !== 'Sano' ? 1 : 0.2 }} />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-border my-2" />

              {/* Lower arch */}
              <div className="grid grid-cols-2 gap-2">
                {CUADRANTES.slice(2, 4).map((q, qi) => (
                  <div key={qi}>
                    <div className="flex gap-1 justify-center">
                      {q.piezas.map(num => {
                        const pd = piezasData[num]
                        const est = getEstadoStyle(pd?.estado ?? 'Sano')
                        const isSelected = selectedPieza === num
                        return (
                          <button
                            key={num}
                            onClick={() => handleSelectPieza(num)}
                            className={`w-8 h-10 rounded-b-lg border-2 flex flex-col items-center justify-center text-[9px] font-bold transition-all hover:scale-110 ${isSelected ? 'ring-2 ring-[#2563EB] ring-offset-1' : ''}`}
                            style={{ backgroundColor: est.color, borderColor: est.border, color: ['Corona', 'Implante', 'Prótesis', 'Endodoncia', 'Caries'].includes(pd?.estado) ? '#fff' : '#1e293b' }}
                          >
                            {!est.symbol && <div className="w-4 h-1 rounded-full mb-0.5" style={{ backgroundColor: est.border, opacity: pd?.estado && pd.estado !== 'Sano' ? 1 : 0.2 }} />}
                            {est.symbol ?? num}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 text-center">{q.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side panel */}
        {selectedPieza !== null && (
          <Card className="lg:w-80 shrink-0">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Pieza {selectedPieza}</CardTitle>
                <button onClick={() => setSelectedPieza(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-0 text-sm">
              <div className="space-y-1">
                <Label className="text-xs">Estado</Label>
                <select className="w-full border rounded-lg px-2 py-1.5 text-sm bg-background" value={formPieza.estado ?? 'Sano'} onChange={(e: any) => setFormPieza({...formPieza, estado: e.target.value})}>
                  {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Diagnóstico</Label>
                <Input className="h-8 text-sm" value={formPieza.diagnostico ?? ''} onChange={(e: any) => setFormPieza({...formPieza, diagnostico: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tratamiento</Label>
                <Input className="h-8 text-sm" value={formPieza.tratamiento ?? ''} onChange={(e: any) => setFormPieza({...formPieza, tratamiento: e.target.value})} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Superficies</Label>
                <div className="flex flex-wrap gap-1">
                  {SUPERFICIES.map(s => (
                    <button key={s} onClick={() => toggleSuperficie(s)}
                      className={`px-2 py-1 text-[10px] rounded-full border transition-colors ${(formPieza?.superficies ?? {})[s] ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-background border-border text-foreground hover:bg-muted'}`}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {formPieza.estado === 'Implante' && (
                <div className="space-y-2 border-t pt-3">
                  <p className="text-xs font-semibold text-[#2563EB]">Datos del Implante</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-[10px]">Marca</Label><Input className="h-7 text-xs" value={formPieza.implanteMarca ?? ''} onChange={(e: any) => setFormPieza({...formPieza, implanteMarca: e.target.value})} /></div>
                    <div><Label className="text-[10px]">Modelo</Label><Input className="h-7 text-xs" value={formPieza.implanteModelo ?? ''} onChange={(e: any) => setFormPieza({...formPieza, implanteModelo: e.target.value})} /></div>
                    <div><Label className="text-[10px]">Diámetro</Label><Input className="h-7 text-xs" value={formPieza.implanteDiametro ?? ''} onChange={(e: any) => setFormPieza({...formPieza, implanteDiametro: e.target.value})} /></div>
                    <div><Label className="text-[10px]">Longitud</Label><Input className="h-7 text-xs" value={formPieza.implanteLongitud ?? ''} onChange={(e: any) => setFormPieza({...formPieza, implanteLongitud: e.target.value})} /></div>
                    <div><Label className="text-[10px]">Fecha colocación</Label><Input type="date" className="h-7 text-xs" value={formPieza.implanteFechaColocacion ?? ''} onChange={(e: any) => setFormPieza({...formPieza, implanteFechaColocacion: e.target.value})} /></div>
                    <div><Label className="text-[10px]">Fecha carga</Label><Input type="date" className="h-7 text-xs" value={formPieza.implanteFechaCarga ?? ''} onChange={(e: any) => setFormPieza({...formPieza, implanteFechaCarga: e.target.value})} /></div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs">Observaciones</Label>
                <textarea className="w-full border rounded-lg px-2 py-1.5 text-sm bg-background min-h-[50px]" value={formPieza.observaciones ?? ''} onChange={(e: any) => setFormPieza({...formPieza, observaciones: e.target.value})} />
              </div>

              <Button className="w-full bg-[#1B2E6B]" onClick={handleSavePieza} loading={saving}>
                <Save className="w-4 h-4 mr-2" /> Guardar
              </Button>

              {/* History */}
              {piezasData[selectedPieza]?.historial && (piezasData[selectedPieza].historial.length ?? 0) > 0 && (
                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs font-semibold flex items-center gap-1"><History className="w-3 h-3" /> Historial</p>
                  {(piezasData[selectedPieza]?.historial ?? []).map((h: any) => (
                    <div key={h.id} className="text-[10px] bg-muted rounded p-2">
                      <p className="font-medium">{h.accion}</p>
                      <p className="text-muted-foreground">{h.estadoAnterior ?? '-'} → {h.estadoNuevo} · {new Date(h.fecha).toLocaleDateString('es-HN')} · {h.registradoPor ?? ''}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
