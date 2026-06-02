import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Insertando datos de prueba...');

  // ──────────────────────────────────────────
  // Unidades organizativas (dependencias)
  // ──────────────────────────────────────────
  const unidades = await prisma.$transaction([
    prisma.unidadOrganizativa.upsert({
      where: { cidunidadorganizativa: 'SG' },
      update: {},
      create: { cidunidadorganizativa: 'SG', cdescripcion: 'Secretaría General', bactivo: true },
    }),
    prisma.unidadOrganizativa.upsert({
      where: { cidunidadorganizativa: 'OAA' },
      update: {},
      create: { cidunidadorganizativa: 'OAA', cdescripcion: 'Oficina de Asuntos Académicos', bactivo: true },
    }),
    prisma.unidadOrganizativa.upsert({
      where: { cidunidadorganizativa: 'OBU' },
      update: {},
      create: { cidunidadorganizativa: 'OBU', cdescripcion: 'Oficina de Bienestar Universitario', bactivo: true },
    }),
    prisma.unidadOrganizativa.upsert({
      where: { cidunidadorganizativa: 'OGAL' },
      update: {},
      create: { cidunidadorganizativa: 'OGAL', cdescripcion: 'Oficina General de Asesoría Legal', bactivo: true },
    }),
    prisma.unidadOrganizativa.upsert({
      where: { cidunidadorganizativa: 'RA' },
      update: {},
      create: { cidunidadorganizativa: 'RA', cdescripcion: 'Rectorado', bactivo: true },
    }),
  ]);
  console.log(`✔ ${unidades.length} unidades organizativas`);

  // ──────────────────────────────────────────
  // Catálogo de trámites
  // ──────────────────────────────────────────
  const tramites = [
    { ccodigo: 'T001', cdenominaciontramite: 'Constancia de Estudios', cdescripcion: 'Documento que certifica que el alumno es estudiante regular de la UNSAAC.', ccodigobanco: 'BN001', btienemontofijo: true, bactivo: true, unidad: 'SG' },
    { ccodigo: 'T002', cdenominaciontramite: 'Constancia de Egresado', cdescripcion: 'Certifica que el alumno ha concluido satisfactoriamente el plan de estudios de su carrera profesional.', ccodigobanco: 'BN001', btienemontofijo: true, bactivo: true, unidad: 'SG' },
    { ccodigo: 'T003', cdenominaciontramite: 'Constancia de Bachiller', cdescripcion: 'Acredita que el alumno ha obtenido el grado de Bachiller.', ccodigobanco: 'BN001', btienemontofijo: true, bactivo: true, unidad: 'SG' },
    { ccodigo: 'T004', cdenominaciontramite: 'Traslado Externo', cdescripcion: 'Proceso para trasladarse desde otra universidad a la UNSAAC.', ccodigobanco: 'BN002', btienemontofijo: true, bactivo: true, unidad: 'OAA' },
    { ccodigo: 'T005', cdenominaciontramite: 'Traslado Interno', cdescripcion: 'Cambio de escuela profesional dentro de la UNSAAC.', ccodigobanco: 'BN002', btienemontofijo: true, bactivo: true, unidad: 'OAA' },
    { ccodigo: 'T006', cdenominaciontramite: 'Rectificación de Notas', cdescripcion: 'Corrección de calificaciones registradas de forma incorrecta en el sistema.', ccodigobanco: 'BN001', btienemontofijo: true, bactivo: true, unidad: 'OAA' },
    { ccodigo: 'T007', cdenominaciontramite: 'Duplicado de Carné Universitario', cdescripcion: 'Emisión de nuevo carné universitario por pérdida, deterioro o robo.', ccodigobanco: 'BN003', btienemontofijo: true, bactivo: true, unidad: 'OBU' },
    { ccodigo: 'T008', cdenominaciontramite: 'Reconocimiento de Estudios', cdescripcion: 'Validación oficial de cursos aprobados en otra institución educativa reconocida.', ccodigobanco: 'BN002', btienemontofijo: false, bactivo: true, unidad: 'OAA' },
    { ccodigo: 'T009', cdenominaciontramite: 'Certificado de Estudios', cdescripcion: 'Certificado oficial de todos los cursos y calificaciones obtenidas durante la carrera.', ccodigobanco: 'BN001', btienemontofijo: true, bactivo: true, unidad: 'SG' },
    { ccodigo: 'T010', cdenominaciontramite: 'Emisión de Diploma de Grado', cdescripcion: 'Emisión del diploma oficial de Bachiller o Título Profesional.', ccodigobanco: 'BN004', btienemontofijo: true, bactivo: true, unidad: 'RA' },
    { ccodigo: 'T011', cdenominaciontramite: 'Constancia de No Adeudo', cdescripcion: 'Certifica que el alumno no tiene deudas pendientes con la universidad.', ccodigobanco: 'BN001', btienemontofijo: true, bactivo: true, unidad: 'SG' },
    { ccodigo: 'T012', cdenominaciontramite: 'Reserva de Matrícula', cdescripcion: 'Reserva del derecho de matrícula para el semestre siguiente por motivos justificados.', ccodigobanco: 'BN002', btienemontofijo: true, bactivo: true, unidad: 'OAA' },
    { ccodigo: 'T013', cdenominaciontramite: 'Retiro de Matrícula', cdescripcion: 'Anulación oficial de la matrícula del semestre en curso.', ccodigobanco: 'BN002', btienemontofijo: true, bactivo: true, unidad: 'OAA' },
    { ccodigo: 'T014', cdenominaciontramite: 'Constancia de Ingresante', cdescripcion: 'Documento que acredita el ingreso a la UNSAAC por el proceso de admisión correspondiente.', ccodigobanco: 'BN001', btienemontofijo: true, bactivo: true, unidad: 'SG' },
    { ccodigo: 'T015', cdenominaciontramite: 'Apelación de Examen de Admisión', cdescripcion: 'Revisión de respuestas del examen de admisión a solicitud del postulante.', ccodigobanco: 'BN005', btienemontofijo: true, bactivo: false, unidad: 'OAA' },
  ];

  for (const t of tramites) {
    await prisma.tramite.upsert({
      where: { ccodigo: t.ccodigo },
      update: {},
      create: {
        ccodigo: t.ccodigo,
        cdenominaciontramite: t.cdenominaciontramite,
        cdescripcion: t.cdescripcion,
        ccodigobanco: t.ccodigobanco,
        btienemontofijo: t.btienemontofijo,
        bactivo: t.bactivo,
        unidadesTram: {
          create: {
            unidad: { connect: { cidunidadorganizativa: t.unidad } },
          },
        },
      },
    });
  }
  console.log(`✔ ${tramites.length} trámites (14 activos, 1 inactivo)`);

  // ──────────────────────────────────────────
  // Requisitos por trámite
  // ──────────────────────────────────────────
  const requisitos = [
    // T001 - Constancia de Estudios
    { ccodigo: 'T001', cdescripcionrequisito: 'Solicitud dirigida al Rector (formato UNSAAC)' },
    { ccodigo: 'T001', cdescripcionrequisito: 'Recibo de pago por derecho de constancia' },
    // T002 - Constancia de Egresado
    { ccodigo: 'T002', cdescripcionrequisito: 'Solicitud dirigida al Rector (formato UNSAAC)' },
    { ccodigo: 'T002', cdescripcionrequisito: 'Recibo de pago por derecho de constancia' },
    { ccodigo: 'T002', cdescripcionrequisito: 'Copia del DNI vigente' },
    // T003 - Constancia de Bachiller
    { ccodigo: 'T003', cdescripcionrequisito: 'Solicitud dirigida al Rector (formato UNSAAC)' },
    { ccodigo: 'T003', cdescripcionrequisito: 'Recibo de pago correspondiente' },
    { ccodigo: 'T003', cdescripcionrequisito: 'Copia del diploma de Bachiller' },
    // T004 - Traslado Externo
    { ccodigo: 'T004', cdescripcionrequisito: 'Solicitud dirigida al Rector' },
    { ccodigo: 'T004', cdescripcionrequisito: 'Certificado de estudios original de la universidad de origen' },
    { ccodigo: 'T004', cdescripcionrequisito: 'Sílabos de los cursos aprobados (autenticados)' },
    { ccodigo: 'T004', cdescripcionrequisito: 'Copia del DNI vigente' },
    { ccodigo: 'T004', cdescripcionrequisito: 'Recibo de pago por derecho de traslado' },
    // T005 - Traslado Interno
    { ccodigo: 'T005', cdescripcionrequisito: 'Solicitud dirigida al Decano de la Facultad destino' },
    { ccodigo: 'T005', cdescripcionrequisito: 'Récord académico actualizado' },
    { ccodigo: 'T005', cdescripcionrequisito: 'Recibo de pago por derecho de traslado interno' },
    // T006 - Rectificación de Notas
    { ccodigo: 'T006', cdescripcionrequisito: 'Solicitud del docente responsable de la asignatura' },
    { ccodigo: 'T006', cdescripcionrequisito: 'Acta de evaluación con corrección firmada' },
    // T007 - Duplicado de Carné
    { ccodigo: 'T007', cdescripcionrequisito: 'Solicitud simple' },
    { ccodigo: 'T007', cdescripcionrequisito: 'Denuncia policial (en caso de robo o pérdida)' },
    { ccodigo: 'T007', cdescripcionrequisito: 'Fotografía tamaño carné (fondo blanco)' },
    { ccodigo: 'T007', cdescripcionrequisito: 'Recibo de pago por reposición' },
    // T009 - Certificado de Estudios
    { ccodigo: 'T009', cdescripcionrequisito: 'Solicitud dirigida al Rector (formato UNSAAC)' },
    { ccodigo: 'T009', cdescripcionrequisito: 'Recibo de pago por derecho de certificado' },
    { ccodigo: 'T009', cdescripcionrequisito: 'Copia del DNI vigente' },
    // T010 - Emisión de Diploma
    { ccodigo: 'T010', cdescripcionrequisito: 'Solicitud dirigida al Rector' },
    { ccodigo: 'T010', cdescripcionrequisito: 'Certificado de estudios original' },
    { ccodigo: 'T010', cdescripcionrequisito: 'Cuatro fotografías tamaño pasaporte (fondo blanco)' },
    { ccodigo: 'T010', cdescripcionrequisito: 'Copia del DNI vigente' },
    { ccodigo: 'T010', cdescripcionrequisito: 'Constancia de no adeudo' },
    { ccodigo: 'T010', cdescripcionrequisito: 'Recibo de pago por derechos de grado' },
    // T011 - Constancia de No Adeudo
    { ccodigo: 'T011', cdescripcionrequisito: 'Solicitud simple' },
    { ccodigo: 'T011', cdescripcionrequisito: 'Recibo de pago por derecho de constancia' },
    // T014 - Constancia de Ingresante
    { ccodigo: 'T014', cdescripcionrequisito: 'Solicitud simple' },
    { ccodigo: 'T014', cdescripcionrequisito: 'Copia del DNI vigente' },
    { ccodigo: 'T014', cdescripcionrequisito: 'Recibo de pago correspondiente' },
  ];

  await prisma.requisito.deleteMany({});
  await prisma.requisito.createMany({ data: requisitos });
  console.log(`✔ ${requisitos.length} requisitos`);

  // ──────────────────────────────────────────
  // Montos vigentes
  // ──────────────────────────────────────────
  const montos = [
    { ccodigo: 'T001', nmonto: 15.00, cdescripcionpago: 'Derecho de constancia de estudios', dfechainicio: new Date('2024-01-01') },
    { ccodigo: 'T002', nmonto: 15.00, cdescripcionpago: 'Derecho de constancia de egresado', dfechainicio: new Date('2024-01-01') },
    { ccodigo: 'T003', nmonto: 20.00, cdescripcionpago: 'Derecho de constancia de bachiller', dfechainicio: new Date('2024-01-01') },
    { ccodigo: 'T004', nmonto: 250.00, cdescripcionpago: 'Derecho de traslado externo', dfechainicio: new Date('2024-01-01') },
    { ccodigo: 'T005', nmonto: 80.00, cdescripcionpago: 'Derecho de traslado interno', dfechainicio: new Date('2024-01-01') },
    { ccodigo: 'T006', nmonto: 10.00, cdescripcionpago: 'Derecho de rectificación de notas', dfechainicio: new Date('2024-01-01') },
    { ccodigo: 'T007', nmonto: 25.00, cdescripcionpago: 'Reposición de carné universitario', dfechainicio: new Date('2024-01-01') },
    { ccodigo: 'T008', nmonto: 50.00, cdescripcionpago: 'Derecho de reconocimiento de estudios (por curso)', dfechainicio: new Date('2024-01-01') },
    { ccodigo: 'T009', nmonto: 30.00, cdescripcionpago: 'Derecho de certificado de estudios', dfechainicio: new Date('2024-01-01') },
    { ccodigo: 'T010', nmonto: 350.00, cdescripcionpago: 'Derechos de emisión de diploma de grado', dfechainicio: new Date('2024-01-01') },
    { ccodigo: 'T011', nmonto: 10.00, cdescripcionpago: 'Derecho de constancia de no adeudo', dfechainicio: new Date('2024-01-01') },
    { ccodigo: 'T012', nmonto: 40.00, cdescripcionpago: 'Derecho de reserva de matrícula', dfechainicio: new Date('2024-01-01') },
    { ccodigo: 'T013', nmonto: 20.00, cdescripcionpago: 'Derecho de retiro de matrícula', dfechainicio: new Date('2024-01-01') },
    { ccodigo: 'T014', nmonto: 10.00, cdescripcionpago: 'Derecho de constancia de ingresante', dfechainicio: new Date('2024-01-01') },
    { ccodigo: 'T015', nmonto: 100.00, cdescripcionpago: 'Derecho de apelación de examen', dfechainicio: new Date('2024-01-01') },
  ];

  await prisma.monto.deleteMany({});
  await prisma.monto.createMany({ data: montos });
  console.log(`✔ ${montos.length} montos vigentes`);

  // ──────────────────────────────────────────
  // Alumnos de prueba
  // ──────────────────────────────────────────
  const alumnos = [
    { codigoalumno: '184001', apalumno: 'QUISPE', amalumno: 'MAMANI', nombresalumno: 'JUAN CARLOS', dni: '12345678', telefono: '984123456', email: 'jquispe@unsaac.edu.pe', codigosede: 'CUS', activo: true },
    { codigoalumno: '184002', apalumno: 'HUANCA', amalumno: 'CCORI', nombresalumno: 'MARIA ELENA', dni: '23456789', telefono: '', email: '', codigosede: 'CUS', activo: true },
    { codigoalumno: '194003', apalumno: 'FLORES', amalumno: 'SOTO', nombresalumno: 'PEDRO ANTONIO', dni: '34567890', telefono: '951234567', email: 'pflores@unsaac.edu.pe', codigosede: 'CUS', activo: true },
    { codigoalumno: '204010', apalumno: 'CONDORI', amalumno: 'VARGAS', nombresalumno: 'ANA LUCIA', dni: '45678901', telefono: '', email: 'acondori@unsaac.edu.pe', codigosede: 'CUS', activo: true },
    { codigoalumno: '214020', apalumno: 'TTITO', amalumno: 'CHARA', nombresalumno: 'CARLOS EDMUNDO', dni: '56789012', telefono: '962345678', email: '', codigosede: 'CAL', activo: true },
  ];

  for (const a of alumnos) {
    await prisma.alumno.upsert({
      where: { codigoalumno: a.codigoalumno },
      update: {},
      create: a,
    });
  }
  console.log(`✔ ${alumnos.length} alumnos de prueba`);

  // ──────────────────────────────────────────
  // Perfiles de usuario
  // ──────────────────────────────────────────
  const perfilAdmin = await prisma.perfil.upsert({
    where: { nidtperfil: 1 },
    update: {},
    create: { nidtperfil: 1, cdescripcionperfil: 'Administrador' },
  });
  const perfilOperador = await prisma.perfil.upsert({
    where: { nidtperfil: 2 },
    update: {},
    create: { nidtperfil: 2, cdescripcionperfil: 'Operador' },
  });
  console.log(`✔ Perfiles: ${perfilAdmin.cdescripcionperfil}, ${perfilOperador.cdescripcionperfil}`);

  // ──────────────────────────────────────────
  // Usuarios y credenciales
  // ──────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const passwordOpHash = await bcrypt.hash('Operador123!', 10);

  await prisma.usuario.upsert({
    where: { cidtusuario: 'USR001' },
    update: {},
    create: {
      cidtusuario: 'USR001',
      cnombres: 'Carlos',
      cpaterno: 'Ramos',
      cmaterno: 'Torres',
      ccorreo: 'admin@unsaac.edu.pe',
      ctelefono: '984000001',
      bactivo: true,
      logins: {
        create: {
          clogin: 'admin',
          nidtperfil: 1,
          ccontrasenia: passwordHash,
          bactivo: true,
        },
      },
    },
  });

  await prisma.usuario.upsert({
    where: { cidtusuario: 'USR002' },
    update: {},
    create: {
      cidtusuario: 'USR002',
      cnombres: 'Rosa',
      cpaterno: 'Mendoza',
      cmaterno: 'Salas',
      ccorreo: 'operador@unsaac.edu.pe',
      ctelefono: '984000002',
      bactivo: true,
      logins: {
        create: {
          clogin: 'operador1',
          nidtperfil: 2,
          ccontrasenia: passwordOpHash,
          bactivo: true,
        },
      },
    },
  });
  console.log('✔ Usuarios: admin / operador1 (con contraseñas hasheadas)');

  console.log('\n✅ Seed completado exitosamente.');
  console.log('   Login admin:     usuario=admin      contraseña=Admin123!');
  console.log('   Login operador:  usuario=operador1  contraseña=Operador123!');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
