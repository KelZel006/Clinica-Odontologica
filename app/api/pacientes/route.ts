export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const buscar = searchParams.get('buscar') || ''
    const estado = searchParams.get('estado') || ''
    const where: any = {}
    if (buscar) {
      where.OR = [
        { nombre: { contains: buscar, mode: 'insensitive' } },
        { apellido: { contains: buscar, mode: 'insensitive' } },
        { correo: { contains: buscar, mode: 'insensitive' } },
        { telefono: { contains: buscar } },
      ]
    }
    if (estado) where.estado = estado
    const pacientes = await prisma.paciente.findMany({ where, orderBy: { creadoEn: 'desc' }, take: 100 })
    return NextResponse.json(pacientes)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Error al obtener pacientes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const body = await req.json()
    const paciente = await prisma.paciente.create({ data: body })
    return NextResponse.json(paciente, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear paciente' }, { status: 500 })
  }
}
