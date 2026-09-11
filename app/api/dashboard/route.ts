export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const hoy = new Date()
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
    const finHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1)
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

    const [citasHoy, proximasCitas, pacientesNuevos, tratamientosActivos, abonosHoy, abonosMes, totalAbonado, totalCostos] = await Promise.all([
      prisma.cita.count({ where: { fechaInicio: { gte: inicioHoy, lt: finHoy } } }),
      prisma.cita.count({ where: { fechaInicio: { gte: finHoy }, estado: 'Programada' } }),
      prisma.paciente.count({ where: { creadoEn: { gte: inicioMes } } }),
      prisma.pacienteTratamiento.count({ where: { estado: { in: ['En progreso', 'Pendiente'] } } }),
      prisma.abono.aggregate({ where: { fecha: { gte: inicioHoy, lt: finHoy } }, _sum: { monto: true } }),
      prisma.abono.aggregate({ where: { fecha: { gte: inicioMes } }, _sum: { monto: true } }),
      prisma.abono.aggregate({ _sum: { monto: true } }),
      prisma.pacienteTratamiento.aggregate({ _sum: { costoTotal: true } }),
    ])

    const totalAbonadoVal = totalAbonado?._sum?.monto ?? 0
    const totalCostosVal = totalCostos?._sum?.costoTotal ?? 0
    const porPagar = totalCostosVal - totalAbonadoVal

    // Ingresos últimos 6 meses
    const meses = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
      const fin = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const agg = await prisma.abono.aggregate({ where: { fecha: { gte: d, lt: fin } }, _sum: { monto: true } })
      meses.push({
        mes: d.toLocaleDateString('es-HN', { month: 'short', year: '2-digit' }),
        ingresos: agg?._sum?.monto ?? 0,
      })
    }

    // Citas por estado
    const citasPorEstado = await prisma.cita.groupBy({
      by: ['estado'],
      _count: { id: true },
    })

    return NextResponse.json({
      citasHoy,
      proximasCitas,
      pacientesNuevos,
      tratamientosActivos,
      ingresosHoy: abonosHoy?._sum?.monto ?? 0,
      ingresosMes: abonosMes?._sum?.monto ?? 0,
      totalAbonado: totalAbonadoVal,
      porPagar: porPagar > 0 ? porPagar : 0,
      ingresosMensuales: meses,
      citasPorEstado: (citasPorEstado ?? []).map((c: any) => ({ estado: c.estado, count: c._count?.id ?? 0 })),
    })
  } catch (error: any) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Error al obtener datos' }, { status: 500 })
  }
}
