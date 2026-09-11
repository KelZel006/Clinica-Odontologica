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

  // ============ DATOS DE PRUEBA: pacientes, tratamientos, finanzas y citas ============
  // Odontologo principal (Dr. Elias) y catalogo de tratamientos
  const doctor = await prisma.usuario.findUnique({ where: { email: 'admin@clinicachirinos.com' } })
  const registradorId = doctor?.id ?? (await prisma.usuario.findFirst())!.id
  const trats = await prisma.tratamiento.findMany()
  const tratMap: Record<string, { id: string; precio: number }> = {}
  for (const t of trats) tratMap[t.nombre] = { id: t.id, precio: t.precio }

  const hoy = new Date()
  const dia = (offset: number, hora: number, min = 0) => {
    const d = new Date(hoy)
    d.setDate(d.getDate() + offset)
    d.setHours(hora, min, 0, 0)
    return d
  }
  const diasAtras = (n: number) => { const d = new Date(hoy); d.setDate(d.getDate() - n); return d }

  type PData = {
    id: string; nombre: string; apellido: string; sexo: string; telefono: string; whatsapp: string;
    correo: string; direccion: string; fechaNacimiento: string; estado: string; alergias?: string;
    antecedentesMedicos?: string; notas?: string;
    tratamientos: { key: string; trat: string; costo: number; estado: string; pieza?: string; abonos: { monto: number; metodo: string; dias: number; recibo: string }[] }[];
    citas: { titulo: string; motivo: string; offset: number; hora: number; dur: number; estado: string; consultorio: string }[];
  }

  const pacientesData: PData[] = [
    { id: 'pac-01', nombre: 'María José', apellido: 'Hernández Flores', sexo: 'Femenino', telefono: '9988-1122', whatsapp: '9988-1122', correo: 'mariaj.hernandez@gmail.com', direccion: 'Col. Kennedy, Tegucigalpa', fechaNacimiento: '1990-04-15', estado: 'Activo', alergias: 'Penicilina', antecedentesMedicos: 'Hipertensión controlada', notas: 'Prefiere citas por la mañana',
      tratamientos: [
        { key: 'pt-01a', trat: 'Implante dental', costo: 25000, estado: 'En proceso', pieza: '36', abonos: [{ monto: 10000, metodo: 'Transferencia bancaria', dias: 30, recibo: 'REC-1001' }, { monto: 5000, metodo: 'Efectivo', dias: 10, recibo: 'REC-1002' }] },
        { key: 'pt-01b', trat: 'Limpieza dental', costo: 800, estado: 'Completado', pieza: '', abonos: [{ monto: 800, metodo: 'Efectivo', dias: 30, recibo: 'REC-1003' }] },
      ],
      citas: [ { titulo: 'Control de implante', motivo: 'Revisión post-quirúrgica', offset: 1, hora: 9, dur: 60, estado: 'Confirmada', consultorio: 'consultorio-1' } ] },
    { id: 'pac-02', nombre: 'Carlos Alberto', apellido: 'Mejía Rodríguez', sexo: 'Masculino', telefono: '9871-4455', whatsapp: '9871-4455', correo: 'carlos.mejia@yahoo.com', direccion: 'Res. Las Uvas, Tegucigalpa', fechaNacimiento: '1985-11-02', estado: 'Activo', notas: 'Paciente puntual',
      tratamientos: [
        { key: 'pt-02a', trat: 'Endodoncia', costo: 5000, estado: 'En proceso', pieza: '26', abonos: [{ monto: 2500, metodo: 'Tarjeta', dias: 15, recibo: 'REC-1010' }] },
        { key: 'pt-02b', trat: 'Corona dental', costo: 8000, estado: 'Pendiente', pieza: '26', abonos: [{ monto: 3000, metodo: 'Efectivo', dias: 5, recibo: 'REC-1011' }] },
      ],
      citas: [ { titulo: 'Endodoncia sesión 2', motivo: 'Continuación de tratamiento de conductos', offset: 2, hora: 10, dur: 90, estado: 'Programada', consultorio: 'consultorio-1' } ] },
    { id: 'pac-03', nombre: 'Ana Lucía', apellido: 'Padilla Cruz', sexo: 'Femenino', telefono: '3312-7788', whatsapp: '3312-7788', correo: 'analu.padilla@gmail.com', direccion: 'Col. Miraflores, Tegucigalpa', fechaNacimiento: '1998-07-21', estado: 'Activo', alergias: 'Látex',
      tratamientos: [
        { key: 'pt-03a', trat: 'Blanqueamiento', costo: 4000, estado: 'Completado', pieza: '', abonos: [{ monto: 4000, metodo: 'Transferencia bancaria', dias: 20, recibo: 'REC-1020' }] },
      ],
      citas: [ { titulo: 'Blanqueamiento', motivo: 'Sesión estética', offset: 0, hora: 14, dur: 60, estado: 'Confirmada', consultorio: 'consultorio-2' } ] },
    { id: 'pac-04', nombre: 'José Manuel', apellido: 'Discua Zelaya', sexo: 'Masculino', telefono: '9456-3321', whatsapp: '9456-3321', correo: 'jm.discua@hotmail.com', direccion: 'Comayagüela, Barrio La Libertad', fechaNacimiento: '1978-01-30', estado: 'Activo', antecedentesMedicos: 'Diabetes tipo 2',
      tratamientos: [
        { key: 'pt-04a', trat: 'Prótesis removible', costo: 12000, estado: 'En proceso', pieza: '', abonos: [{ monto: 4000, metodo: 'Efectivo', dias: 25, recibo: 'REC-1030' }, { monto: 4000, metodo: 'Depósito bancario', dias: 5, recibo: 'REC-1031' }] },
      ],
      citas: [ { titulo: 'Prueba de prótesis', motivo: 'Ajuste de prótesis removible', offset: 3, hora: 11, dur: 45, estado: 'Programada', consultorio: 'consultorio-1' } ] },
    { id: 'pac-05', nombre: 'Gabriela', apellido: 'Sánchez Turcios', sexo: 'Femenino', telefono: '8877-2210', whatsapp: '8877-2210', correo: 'gaby.sanchez@gmail.com', direccion: 'Col. Las Colinas, Tegucigalpa', fechaNacimiento: '1995-09-12', estado: 'Activo',
      tratamientos: [
        { key: 'pt-05a', trat: 'Restauración con resina', costo: 1200, estado: 'Completado', pieza: '11', abonos: [{ monto: 1200, metodo: 'Efectivo', dias: 8, recibo: 'REC-1040' }] },
        { key: 'pt-05b', trat: 'Limpieza dental', costo: 800, estado: 'Completado', pieza: '', abonos: [{ monto: 400, metodo: 'Efectivo', dias: 8, recibo: 'REC-1041' }] },
      ],
      citas: [ { titulo: 'Limpieza y revisión', motivo: 'Profilaxis semestral', offset: 4, hora: 15, dur: 45, estado: 'Confirmada', consultorio: 'consultorio-2' } ] },
    { id: 'pac-06', nombre: 'Roberto', apellido: 'Cálix Andino', sexo: 'Masculino', telefono: '9900-5544', whatsapp: '9900-5544', correo: 'roberto.calix@gmail.com', direccion: 'Res. El Trapiche, Tegucigalpa', fechaNacimiento: '1982-03-08', estado: 'Activo',
      tratamientos: [
        { key: 'pt-06a', trat: 'Cirugía de implante', costo: 35000, estado: 'En proceso', pieza: '46', abonos: [{ monto: 15000, metodo: 'Transferencia bancaria', dias: 40, recibo: 'REC-1050' }, { monto: 10000, metodo: 'Tarjeta', dias: 12, recibo: 'REC-1051' }] },
      ],
      citas: [ { titulo: 'Cirugía de implante', motivo: 'Colocación de implante pieza 46', offset: 5, hora: 8, dur: 180, estado: 'Programada', consultorio: 'consultorio-1' } ] },
    { id: 'pac-07', nombre: 'Sofía Alejandra', apellido: 'Bonilla Reyes', sexo: 'Femenino', telefono: '3245-9987', whatsapp: '3245-9987', correo: 'sofia.bonilla@gmail.com', direccion: 'Col. Loarque, Tegucigalpa', fechaNacimiento: '2001-12-05', estado: 'Activo',
      tratamientos: [
        { key: 'pt-07a', trat: 'Extracción dental', costo: 1500, estado: 'Completado', pieza: '38', abonos: [{ monto: 1500, metodo: 'Efectivo', dias: 3, recibo: 'REC-1060' }] },
      ],
      citas: [ { titulo: 'Control post-extracción', motivo: 'Revisión de cicatrización', offset: 6, hora: 9, dur: 30, estado: 'Programada', consultorio: 'consultorio-2' } ] },
    { id: 'pac-08', nombre: 'Luis Fernando', apellido: 'Ordóñez Maradiaga', sexo: 'Masculino', telefono: '9765-1123', whatsapp: '9765-1123', correo: 'luisf.ordonez@hotmail.com', direccion: 'Col. San Ángel, Tegucigalpa', fechaNacimiento: '1970-06-18', estado: 'Activo', antecedentesMedicos: 'Marcapasos',
      tratamientos: [
        { key: 'pt-08a', trat: 'Corona dental', costo: 8000, estado: 'En proceso', pieza: '21', abonos: [{ monto: 4000, metodo: 'Tarjeta', dias: 18, recibo: 'REC-1070' }] },
        { key: 'pt-08b', trat: 'Endodoncia', costo: 5000, estado: 'Completado', pieza: '21', abonos: [{ monto: 5000, metodo: 'Transferencia bancaria', dias: 30, recibo: 'REC-1071' }] },
      ],
      citas: [ { titulo: 'Cementado de corona', motivo: 'Colocación de corona definitiva', offset: 7, hora: 13, dur: 60, estado: 'Programada', consultorio: 'consultorio-1' } ] },
    { id: 'pac-09', nombre: 'Daniela', apellido: 'Fúnez Argueta', sexo: 'Femenino', telefono: '8812-3344', whatsapp: '8812-3344', correo: 'daniela.funez@gmail.com', direccion: 'Res. Plaza, Comayagüela', fechaNacimiento: '1993-02-27', estado: 'Activo', alergias: 'Ibuprofeno',
      tratamientos: [
        { key: 'pt-09a', trat: 'Sellante dental', costo: 500, estado: 'Completado', pieza: '16', abonos: [{ monto: 500, metodo: 'Efectivo', dias: 2, recibo: 'REC-1080' }] },
        { key: 'pt-09b', trat: 'Limpieza dental', costo: 800, estado: 'Completado', pieza: '', abonos: [{ monto: 800, metodo: 'Efectivo', dias: 2, recibo: 'REC-1081' }] },
      ],
      citas: [ { titulo: 'Aplicación de sellantes', motivo: 'Prevención en molares', offset: 1, hora: 16, dur: 30, estado: 'Confirmada', consultorio: 'consultorio-2' } ] },
    { id: 'pac-10', nombre: 'Fernando', apellido: 'Lagos Pineda', sexo: 'Masculino', telefono: '9654-8899', whatsapp: '9654-8899', correo: 'fernando.lagos@gmail.com', direccion: 'Col. Florencia, Tegucigalpa', fechaNacimiento: '1988-08-08', estado: 'Activo',
      tratamientos: [
        { key: 'pt-10a', trat: 'Implante dental', costo: 25000, estado: 'En proceso', pieza: '11', abonos: [{ monto: 12000, metodo: 'Transferencia bancaria', dias: 22, recibo: 'REC-1090' }] },
        { key: 'pt-10b', trat: 'Blanqueamiento', costo: 4000, estado: 'Pendiente', pieza: '', abonos: [] },
      ],
      citas: [ { titulo: 'Evaluación de implante', motivo: 'Estudio radiográfico', offset: 2, hora: 8, dur: 60, estado: 'Programada', consultorio: 'consultorio-1' } ] },
    { id: 'pac-11', nombre: 'Andrea', apellido: 'Velásquez Moncada', sexo: 'Femenino', telefono: '3398-6677', whatsapp: '3398-6677', correo: 'andrea.velasquez@gmail.com', direccion: 'Col. Tepeyac, Tegucigalpa', fechaNacimiento: '1996-05-19', estado: 'Activo',
      tratamientos: [
        { key: 'pt-11a', trat: 'Restauración con resina', costo: 1200, estado: 'Completado', pieza: '24', abonos: [{ monto: 1200, metodo: 'Tarjeta', dias: 6, recibo: 'REC-1100' }] },
      ],
      citas: [ { titulo: 'Revisión general', motivo: 'Chequeo anual', offset: 8, hora: 10, dur: 45, estado: 'Programada', consultorio: 'consultorio-2' } ] },
    { id: 'pac-12', nombre: 'Óscar René', apellido: 'Aguilar Bustillo', sexo: 'Masculino', telefono: '9543-2211', whatsapp: '9543-2211', correo: 'oscar.aguilar@hotmail.com', direccion: 'Res. Lomas del Guijarro, Tegucigalpa', fechaNacimiento: '1975-10-11', estado: 'Activo', antecedentesMedicos: 'Alergia estacional',
      tratamientos: [
        { key: 'pt-12a', trat: 'Prótesis removible', costo: 12000, estado: 'En proceso', pieza: '', abonos: [{ monto: 6000, metodo: 'Depósito bancario', dias: 28, recibo: 'REC-1110' }, { monto: 2000, metodo: 'Efectivo', dias: 4, recibo: 'REC-1111' }] },
        { key: 'pt-12b', trat: 'Extracción dental', costo: 1500, estado: 'Completado', pieza: '48', abonos: [{ monto: 1500, metodo: 'Efectivo', dias: 28, recibo: 'REC-1112' }] },
      ],
      citas: [ { titulo: 'Ajuste de prótesis', motivo: 'Revisión de adaptación', offset: 3, hora: 14, dur: 45, estado: 'Programada', consultorio: 'consultorio-1' } ] },
  ]

  for (const p of pacientesData) {
    await prisma.paciente.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id, nombre: p.nombre, apellido: p.apellido, sexo: p.sexo, telefono: p.telefono,
        whatsapp: p.whatsapp, correo: p.correo, direccion: p.direccion,
        fechaNacimiento: new Date(p.fechaNacimiento), estado: p.estado,
        alergias: p.alergias ?? null, antecedentesMedicos: p.antecedentesMedicos ?? null, notas: p.notas ?? null,
      },
    })

    for (const t of p.tratamientos) {
      const tr = tratMap[t.trat]
      if (!tr) continue
      await prisma.pacienteTratamiento.upsert({
        where: { id: t.key },
        update: {},
        create: {
          id: t.key, pacienteId: p.id, tratamientoId: tr.id, costoTotal: t.costo,
          estado: t.estado, piezaDental: t.pieza || null,
        },
      })
      let i = 0
      for (const ab of t.abonos) {
        i++
        await prisma.abono.upsert({
          where: { id: `${t.key}-ab${i}` },
          update: {},
          create: {
            id: `${t.key}-ab${i}`, pacienteId: p.id, pacienteTratamientoId: t.key,
            monto: ab.monto, metodoPago: ab.metodo, numeroRecibo: ab.recibo,
            registradoPorId: registradorId, fecha: diasAtras(ab.dias),
          },
        })
      }
    }

    let ci = 0
    for (const c of p.citas) {
      ci++
      const inicio = dia(c.offset, c.hora)
      const fin = new Date(inicio); fin.setMinutes(fin.getMinutes() + c.dur)
      await prisma.cita.upsert({
        where: { id: `${p.id}-cita${ci}` },
        update: {},
        create: {
          id: `${p.id}-cita${ci}`, pacienteId: p.id, odontologoId: registradorId,
          consultorioId: c.consultorio, titulo: c.titulo, motivo: c.motivo,
          fechaInicio: inicio, fechaFin: fin, estado: c.estado,
        },
      })
    }
  }

  console.log('Seed complete!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
