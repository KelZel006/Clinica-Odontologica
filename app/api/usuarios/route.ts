export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nombre: true, email: true, rol: true, activo: true, telefono: true, creadoEn: true },
      orderBy: { creadoEn: 'desc' },
    })
    return NextResponse.json(usuarios)
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  try {
    const body = await req.json()
    const { email, password, nombre, rol, telefono } = body
    if (!email || !password || !nombre) {
      return NextResponse.json({ error: 'Campos obligatorios faltantes' }, { status: 400 })
    }
    const exists = await prisma.usuario.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: 'El correo ya existe' }, { status: 400 })
    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.usuario.create({
      data: { email, password: hashed, nombre, rol: rol || 'recepcionista', telefono },
    })
    return NextResponse.json({ id: user.id, email: user.email, nombre: user.nombre, rol: user.rol }, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  }
}
