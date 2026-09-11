export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const pacienteId = searchParams.get('pacienteId')
    const where: any = {}
    if (pacienteId) where.pacienteId = pacienteId
    const abonos = await prisma.abono.findMany({
      where,
      include: {
        paciente: { select: { nombre: true, apellido: true } },
        registradoPor: { select: { nombre: true } },
        pacienteTratamiento: { include: { tratamiento: { select: { nombre: true } } } },
      },
      orderBy: { fecha: 'desc' },
      take: 200,
    })
    return NextResponse.json(abonos)
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
    body.registradoPorId = session.user.id
    const abono = await prisma.abono.create({ data: body })
    return NextResponse.json(abono, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Error al registrar abono' }, { status: 500 })
  }
}
