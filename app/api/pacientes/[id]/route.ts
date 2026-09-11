export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  try {
    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: {
        citas: { orderBy: { fechaInicio: 'desc' }, take: 20, include: { odontologo: { select: { nombre: true } } } },
        tratamientosPaciente: { include: { tratamiento: true, abonos: true } },
        odontograma: { include: { piezas: true } },
        abonos: { orderBy: { fecha: 'desc' }, take: 50 },
        documentos: { orderBy: { creadoEn: 'desc' } },
      },
    })
    if (!paciente) return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })
    return NextResponse.json(paciente)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    delete body.id
    delete body.creadoEn
    const paciente = await prisma.paciente.update({ where: { id }, data: body })
    return NextResponse.json(paciente)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
  }
}
