export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const pacienteId = searchParams.get('pacienteId')
  if (!pacienteId) return NextResponse.json({ error: 'pacienteId requerido' }, { status: 400 })
  try {
    let odontograma = await prisma.odontograma.findUnique({
      where: { pacienteId },
      include: { piezas: { include: { historial: { orderBy: { fecha: 'desc' }, take: 10 } } } },
    })
    if (!odontograma) {
      odontograma = await prisma.odontograma.create({
        data: { pacienteId, datos: {} },
        include: { piezas: { include: { historial: { orderBy: { fecha: 'desc' }, take: 10 } } } },
      })
    }
    return NextResponse.json(odontograma)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const body = await req.json()
    const { odontogramaId, numeroPieza, estado, diagnostico, tratamiento, superficies, observaciones,
      implanteMarca, implanteModelo, implanteDiametro, implanteLongitud, implanteFechaColocacion, implanteFechaCarga } = body

    const existing = await prisma.piezaDental.findUnique({
      where: { odontogramaId_numeroPieza: { odontogramaId, numeroPieza } },
    })

    let pieza
    if (existing) {
      // Create history entry
      await prisma.historialPieza.create({
        data: {
          piezaDentalId: existing.id,
          estadoAnterior: existing.estado,
          estadoNuevo: estado || existing.estado,
          accion: `Actualizado: ${diagnostico || tratamiento || estado || 'modificación'}`,
          registradoPor: session.user.name,
        },
      })
      pieza = await prisma.piezaDental.update({
        where: { id: existing.id },
        data: {
          estado: estado ?? existing.estado,
          diagnostico: diagnostico ?? existing.diagnostico,
          tratamiento: tratamiento ?? existing.tratamiento,
          superficies: superficies ?? existing.superficies,
          observaciones: observaciones ?? existing.observaciones,
          implanteMarca: implanteMarca ?? existing.implanteMarca,
          implanteModelo: implanteModelo ?? existing.implanteModelo,
          implanteDiametro: implanteDiametro ?? existing.implanteDiametro,
          implanteLongitud: implanteLongitud ?? existing.implanteLongitud,
          implanteFechaColocacion: implanteFechaColocacion ? new Date(implanteFechaColocacion) : existing.implanteFechaColocacion,
          implanteFechaCarga: implanteFechaCarga ? new Date(implanteFechaCarga) : existing.implanteFechaCarga,
        },
        include: { historial: { orderBy: { fecha: 'desc' }, take: 10 } },
      })
    } else {
      pieza = await prisma.piezaDental.create({
        data: {
          odontogramaId,
          numeroPieza,
          estado: estado || 'Sano',
          diagnostico,
          tratamiento,
          superficies: superficies || {},
          observaciones,
          implanteMarca,
          implanteModelo,
          implanteDiametro,
          implanteLongitud,
          implanteFechaColocacion: implanteFechaColocacion ? new Date(implanteFechaColocacion) : null,
          implanteFechaCarga: implanteFechaCarga ? new Date(implanteFechaCarga) : null,
        },
        include: { historial: { orderBy: { fecha: 'desc' }, take: 10 } },
      })
      await prisma.historialPieza.create({
        data: {
          piezaDentalId: pieza.id,
          estadoAnterior: null,
          estadoNuevo: estado || 'Sano',
          accion: 'Registro inicial',
          registradoPor: session.user.name,
        },
      })
    }
    return NextResponse.json(pieza)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Error al guardar pieza' }, { status: 500 })
  }
}
