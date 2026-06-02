# Backend — TUPA UNSAAC

Node.js + Express + TypeScript + Prisma (PostgreSQL).

## Arquitectura por capas
Sigue una arquitectura por capas estricta. Cada petición fluye:

`routes → controllers → services → repositories → (Prisma) → BD`

- **routes/**: definición de endpoints y middlewares (auth, validación).
- **controllers/**: reciben req/res, delegan al service, no contienen lógica de negocio.
- **services/**: lógica de negocio. Independiente de Express y de Prisma directo (usa repositorios).
- **repositories/**: acceso a datos vía Prisma. Aísla la BD del resto (facilita portabilidad).
- **dtos/** + validación con Zod en el borde (entrada de controllers).
- **errors/**: manejo centralizado de errores.

Justificación (AG-C12.02): las capas garantizan consistencia con las especificaciones de usuario, separan responsabilidades (SRP) y permiten sustituir la BD o el framework sin tocar la lógica (DIP).

## Convenciones
- TypeScript estricto (`strict: true`). Sin `any` salvo justificación.
- Nombres en inglés para código; comentarios y commits en español.
- Un service por agregado de dominio (tramite, solicitud, pago, documento, usuario).
- Manejo de estados de solicitud como enum/constante única (fuente de verdad).

## Pruebas (OBLIGATORIO — AG-C12.04)
- Framework: Vitest + Supertest.
- Cada service: pruebas unitarias (casos felices y de error).
- Cada endpoint crítico: prueba de integración.
- Estructura los tests junto al archivo (`*.test.ts`) para facilitar el informe de pruebas.
- No marques una tarea como terminada sin su test correspondiente.

## Base de datos
- Esquema existente: usar `prisma db pull` sobre la BD PostgreSQL migrada.
- Tablas nuevas a crear: tdocumento_solicitud, thistorial_estado, tnotificacion, tauditoria.
- Ver detalle en @../docs/base-datos.md
