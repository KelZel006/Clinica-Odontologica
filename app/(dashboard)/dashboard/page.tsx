'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Users, Stethoscope, TrendingUp, Coins, Clock, CreditCard, AlertCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#1B2E6B', '#2563EB', '#60B5FF', '#FF9149', '#80D8C3', '#A19AD3', '#FF6363', '#FF90BB']

function formatLps(n: number) {
  return `Lps ${(n ?? 0).toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B2E6B]"></div></div>

  const stats = [
    { label: 'Citas Hoy', value: data?.citasHoy ?? 0, icon: CalendarDays, color: 'text-[#2563EB]', bg: 'bg-blue-50' },
    { label: 'Próximas Citas', value: data?.proximasCitas ?? 0, icon: Clock, color: 'text-[#1B2E6B]', bg: 'bg-indigo-50' },
    { label: 'Pacientes Nuevos', value: data?.pacientesNuevos ?? 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tratamientos Activos', value: data?.tratamientosActivos ?? 0, icon: Stethoscope, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  const financial = [
    { label: 'Ingresos Hoy', value: formatLps(data?.ingresosHoy ?? 0), icon: Coins, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Ingresos del Mes', value: formatLps(data?.ingresosMes ?? 0), icon: TrendingUp, color: 'text-[#2563EB]', bg: 'bg-blue-50' },
    { label: 'Total Abonado', value: formatLps(data?.totalAbonado ?? 0), icon: CreditCard, color: 'text-[#1B2E6B]', bg: 'bg-indigo-50' },
    { label: 'Por Pagar', value: formatLps(data?.porPagar ?? 0), icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general de la clínica</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`${s.bg} p-3 rounded-xl`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {financial.map((s, i) => (
          <Card key={i} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`${s.bg} p-3 rounded-xl`}>
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold font-mono">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.ingresosMensuales ?? []} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                  <XAxis dataKey="mes" tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: any) => formatLps(v)} />
                  <Bar dataKey="ingresos" fill="#1B2E6B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Citas por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.citasPorEstado ?? []}
                    dataKey="count"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ estado, count }: any) => `${estado ?? ''}: ${count ?? 0}`}
                  >
                    {(data?.citasPorEstado ?? []).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
