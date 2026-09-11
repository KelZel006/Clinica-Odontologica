export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const inicio = searchParams.get('inicio')
    const fin = searchParams.get('fin')
    const where: any = {}
    if (inicio && fin) {
      where.fechaInicio = { gte: new Date(inicio), lte: new Date(fin) }
    }
    const citas = await prisma.cita.findMany({
      where,
      include: {
        paciente: { select: { nombre: true, apellido: true, telefono: true } },
        odontologo: { select: { nombre: true } },
        consultorio: { select: { nombre: true } },
      },
      orderBy: { fechaInicio: 'asc' },
    })
    return NextResponse.json(citas)
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
    // Check conflicts
    if (body.odontologoId) {
      const conflicto = await prisma.cita.findFirst({
        where: {
          odontologoId: body.odontologoId,
          estado: { not: 'Cancelada' },
          OR: [
            { fechaInicio: { lt: new Date(body.fechaFin) }, fechaFin: { gt: new Date(body.fechaInicio) } },
          ],
        },
      })
      if (conflicto) {
        return NextResponse.json({ error: 'Conflicto de horario: el odontólogo ya tiene una cita en ese horario' }, { status: 409 })
      }
    }
    if (body.consultorioId) {
      const conflicto = await prisma.cita.findFirst({
        where: {
          consultorioId: body.consultorioId,
          estado: { not: 'Cancelada' },
          OR: [
            { fechaInicio: { lt: new Date(body.fechaFin) }, fechaFin: { gt: new Date(body.fechaInicio) } },
          ],
        },
      })
      if (conflicto) {
        return NextResponse.json({ error: 'Conflicto: el consultorio ya está ocupado en ese horario' }, { status: 409 })
      }
    }
    const cita = await prisma.cita.create({ data: body })
    return NextResponse.json(cita, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear cita' }, { status: 500 })
  }
}
