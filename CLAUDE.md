# Plataforma Web de Gestión del TUPA — UNSAAC

Proyecto académico (Desarrollo de Software I). Objetivo: alcanzar nivel "Avanzado" en el atributo del graduado AG_C12. Trabajamos en español.

## Contexto del proyecto
- Optimizar la gestión de trámites TUPA de la UNSAAC: consulta de trámites/costos, registro y seguimiento de solicitudes, pago simulado, carga/validación de documentos, panel administrativo y reportes.
- Pagos: SIMULADOS (cambio de estado, sin pasarela real) para el MVP.
- El estudiante NO tiene cuenta: se identifica por su código de alumno (existe en la tabla `talumno`).
- Roles autenticados: Operador y Administrador.
- Notificaciones: solo in-app.
- Base de datos: PostgreSQL (migrada desde el dump MySQL `bdtupa`).

## Documentos de referencia (léelos antes de proponer cambios)
- Requerimientos funcionales: @docs/requerimientos.md
- Arquitectura y convenciones: @docs/arquitectura.md
- Esquema de base de datos: @docs/base-datos.md

## Stack
- Frontend (`/frontend`): React + Vite + TypeScript + Tailwind. Ver @frontend/CLAUDE.md
- Backend (`/backend`): Node.js + Express + TypeScript + Prisma. Ver @backend/CLAUDE.md
- BD: PostgreSQL.

## Reglas globales de trabajo
- Código limpio, modular y tipado. Aplica principios SOLID.
- Toda lógica de negocio, función crítica o endpoint del backend DEBE incluir su prueba (unitaria o de integración). No entregues lógica sin test.
- Trazabilidad: cada funcionalidad nueva se relaciona con un requerimiento (RF-XX) y su objetivo específico.
- Bajas lógicas, nunca DELETE físico de trámites.
- Antes de implementar algo grande, propón un plan y espera aprobación (usa Plan mode).
- Mensajes de commit claros y en español, referenciando el RF cuando aplique.

## Lo que NO debes hacer
- No introducir pasarelas de pago reales.
- No crear cuentas/login para estudiantes.
- No borrar datos físicamente.
- No mezclar frontend y backend en una sola carpeta.
