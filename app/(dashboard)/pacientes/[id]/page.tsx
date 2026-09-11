'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, User, Phone, Mail, MapPin, Heart, CalendarDays, Coins, FileText, Stethoscope } from 'lucide-react'
import dynamic from 'next/dynamic'

const OdontogramaInteractivo = dynamic(() => import('@/components/app/odontograma'), { ssr: false, loading: () => <div className="h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B2E6B]"></div></div> })

function formatLps(n: number) { return `Lps ${(n ?? 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })}` }

export default function PacienteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [paciente, setPaciente] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/pacientes/${id}`)
      .then(r => r.json())
      .then(setPaciente)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B2E6B]"></div></div>
  if (!paciente) return <div className="text-center py-12 text-muted-foreground">Paciente no encontrado</div>

  const tratamientos = paciente?.tratamientosPaciente ?? []
  const totalCosto = tratamientos.reduce((s: number, t: any) => s + (t?.costoTotal ?? 0), 0)
  const totalAbonado = tratamientos.reduce((s: number, t: any) => s + ((t?.abonos ?? []).reduce((a: number, ab: any) => a + (ab?.monto ?? 0), 0)), 0)
  const porPagar = totalCosto - totalAbonado

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/pacientes')} className="mb-2"><ArrowLeft className="w-4 h-4 mr-2" /> Volver</Button>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#1B2E6B] flex items-center justify-center text-white font-bold text-lg">
          {(paciente.nombre?.[0] ?? '')}{(paciente.apellido?.[0] ?? '')}
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">{paciente.nombre} {paciente.apellido}</h1>
          <Badge className="mt-1">{paciente.estado}</Badge>
        </div>
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Costo Total</p><p className="text-lg font-bold font-mono text-[#1B2E6B]">{formatLps(totalCosto)}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Total Abonado</p><p className="text-lg font-bold font-mono text-emerald-600">{formatLps(totalAbonado)}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Por Pagar</p><p className="text-lg font-bold font-mono text-orange-600">{formatLps(porPagar > 0 ? porPagar : 0)}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="w-full flex flex-wrap">
          <TabsTrigger value="info"><User className="w-4 h-4 mr-1" /> Info</TabsTrigger>
          <TabsTrigger value="odontograma"><Stethoscope className="w-4 h-4 mr-1" /> Odontograma</TabsTrigger>
          <TabsTrigger value="tratamientos"><Heart className="w-4 h-4 mr-1" /> Tratamientos</TabsTrigger>
          <TabsTrigger value="citas"><CalendarDays className="w-4 h-4 mr-1" /> Citas</TabsTrigger>
          <TabsTrigger value="abonos"><Coins className="w-4 h-4 mr-1" /> Abonos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Phone, label: 'Teléfono', value: paciente.telefono },
                { icon: Phone, label: 'WhatsApp', value: paciente.whatsapp },
                { icon: Mail, label: 'Correo', value: paciente.correo },
                { icon: MapPin, label: 'Dirección', value: paciente.direccion },
                { icon: User, label: 'Sexo', value: paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : paciente.sexo },
                { icon: Heart, label: 'Alergias', value: paciente.alergias },
                { icon: Heart, label: 'Medicamentos', value: paciente.medicamentos },
                { icon: User, label: 'Contacto emergencia', value: paciente.contactoEmergencia },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 text-[#2563EB] mt-0.5 shrink-0" />
                  <div><p className="text-xs text-muted-foreground">{item.label}</p><p className="text-sm">{item.value || '-'}</p></div>
                </div>
              ))}
              {paciente.antecedentesMedicos && <div className="col-span-full"><p className="text-xs text-muted-foreground">Antecedentes médicos</p><p className="text-sm">{paciente.antecedentesMedicos}</p></div>}
              {paciente.antecedentesOdonto && <div className="col-span-full"><p className="text-xs text-muted-foreground">Antecedentes odontológicos</p><p className="text-sm">{paciente.antecedentesOdonto}</p></div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="odontograma" className="mt-4">
          <OdontogramaInteractivo pacienteId={id} />
        </TabsContent>

        <TabsContent value="tratamientos" className="mt-4">
          {tratamientos.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">Sin tratamientos registrados</CardContent></Card> : (
            <div className="space-y-3">
              {tratamientos.map((pt: any) => {
                const abonado = (pt?.abonos ?? []).reduce((a: number, ab: any) => a + (ab?.monto ?? 0), 0)
                return (
                  <Card key={pt.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div><h3 className="font-semibold text-sm">{pt?.tratamiento?.nombre ?? 'Tratamiento'}</h3><Badge className="mt-1" variant="outline">{pt.estado}</Badge></div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Costo: {formatLps(pt.costoTotal)}</p>
                          <p className="text-xs text-emerald-600">Abonado: {formatLps(abonado)}</p>
                          <p className="text-xs font-bold text-orange-600">Por Pagar: {formatLps(pt.costoTotal - abonado > 0 ? pt.costoTotal - abonado : 0)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="citas" className="mt-4">
          {(paciente?.citas?.length ?? 0) === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">Sin citas registradas</CardContent></Card> : (
            <div className="space-y-3">
              {(paciente?.citas ?? []).map((c: any) => (
                <Card key={c.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{c.titulo || c.motivo || 'Cita'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(c.fechaInicio).toLocaleDateString('es-HN')} - {new Date(c.fechaInicio).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })}</p>
                      {c?.odontologo?.nombre && <p className="text-xs text-muted-foreground">Dr. {c.odontologo.nombre}</p>}
                    </div>
                    <Badge variant="outline">{c.estado}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="abonos" className="mt-4">
          {(paciente?.abonos?.length ?? 0) === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">Sin abonos registrados</CardContent></Card> : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr><th className="text-left p-3">Fecha</th><th className="text-left p-3">Monto</th><th className="text-left p-3">Método</th><th className="text-left p-3">Recibo</th></tr>
                  </thead>
                  <tbody>
                    {(paciente?.abonos ?? []).map((a: any) => (
                      <tr key={a.id} className="border-t">
                        <td className="p-3">{new Date(a.fecha).toLocaleDateString('es-HN')}</td>
                        <td className="p-3 font-mono font-medium">{formatLps(a.monto)}</td>
                        <td className="p-3">{a.metodoPago}</td>
                        <td className="p-3">{a.numeroRecibo || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
