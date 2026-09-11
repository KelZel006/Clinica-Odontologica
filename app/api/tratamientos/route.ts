export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const tratamientos = await prisma.tratamiento.findMany({ orderBy: { nombre: 'asc' } })
    return NextResponse.json(tratamientos)
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
    const t = await prisma.tratamiento.create({ data: body })
    return NextResponse.json(t, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear tratamiento' }, { status: 500 })
  }
}
