import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')

  // Hidden test account
  const testHash = await bcrypt.hash('DAG9@WocDd', 12)
  await prisma.usuario.upsert({
    where: { email: 'abacus-80f70ee9@example.com' },
    update: {},
    create: {
      email: 'abacus-80f70ee9@example.com',
      password: testHash,
      nombre: 'Admin Test',
      rol: 'admin',
      activo: true,
    },
  })

  // Admin account for the user
  const adminHash = await bcrypt.hash('Admin2026!', 12)
  await prisma.usuario.upsert({
    where: { email: 'admin@clinicachirinos.com' },
    update: {},
    create: {
      email: 'admin@clinicachirinos.com',
      password: adminHash,
      nombre: 'Dr. Elías Renato Chirinos',
      rol: 'admin',
      activo: true,
    },
  })

  // Sample treatments
  const tratamientos = [
    { nombre: 'Implante dental', categoria: 'Implantología', precio: 25000, duracionMinutos: 120, descripcion: 'Colocación de implante dental de titanio' },
    { nombre: 'Corona dental', categoria: 'Prótesis', precio: 8000, duracionMinutos: 60, descripcion: 'Corona de porcelana o zirconia' },
    { nombre: 'Endodoncia', categoria: 'Endodoncia', precio: 5000, duracionMinutos: 90, descripcion: 'Tratamiento de conductos' },
    { nombre: 'Limpieza dental', categoria: 'Odontología General', precio: 800, duracionMinutos: 45, descripcion: 'Profilaxis dental completa' },
    { nombre: 'Extracción dental', categoria: 'Cirugía', precio: 1500, duracionMinutos: 30, descripcion: 'Extracción simple' },
    { nombre: 'Blanqueamiento', categoria: 'Estética', precio: 4000, duracionMinutos: 60, descripcion: 'Blanqueamiento dental profesional' },
    { nombre: 'Restauración con resina', categoria: 'Odontología General', precio: 1200, duracionMinutos: 40, descripcion: 'Obturación estética con resina compuesta' },
    { nombre: 'Prótesis removible', categoria: 'Prótesis', precio: 12000, duracionMinutos: 60, descripcion: 'Prótesis dental removible parcial o total' },
    { nombre: 'Cirugía de implante', categoria: 'Implantología', precio: 35000, duracionMinutos: 180, descripcion: 'Cirugía completa de implante con carga inmediata' },
    { nombre: 'Sellante dental', categoria: 'Odontología General', precio: 500, duracionMinutos: 20, descripcion: 'Aplicación de sellante en fosas y fisuras' },
  ]

  for (const t of tratamientos) {
    await prisma.tratamiento.upsert({
      where: { id: t.nombre.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: { ...t },
    })
  }

  // Sample consultorio
  await prisma.consultorio.upsert({
    where: { id: 'consultorio-1' },
    update: {},
    create: { id: 'consultorio-1', nombre: 'Consultorio 1', activo: true },
  })
  await prisma.consultorio.upsert({
    where: { id: 'consultorio-2' },
    update: {},
    create: { id: 'consultorio-2', nombre: 'Consultorio 2', activo: true },
  })

  console.log('Seed complete!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
