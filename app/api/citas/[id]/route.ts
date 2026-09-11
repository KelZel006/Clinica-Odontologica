export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  try {
    const body = await req.json()
    delete body.id
    const cita = await prisma.cita.update({ where: { id }, data: body })
    return NextResponse.json(cita)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const { id } = await params
  try {
    await prisma.cita.update({ where: { id }, data: { estado: 'Cancelada' } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
