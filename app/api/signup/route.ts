export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, nombre, rol } = body ?? {}
    if (!email || !password || !nombre) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 })
    }
    const exists = await prisma.usuario.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 })
    }
    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.usuario.create({
      data: {
        email,
        password: hashed,
        nombre,
        rol: rol || 'recepcionista',
      },
    })
    return NextResponse.json({ id: user.id, email: user.email, nombre: user.nombre }, { status: 201 })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Error al crear la cuenta' }, { status: 500 })
  }
}
