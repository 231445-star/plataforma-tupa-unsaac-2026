# Arquitectura y Convenciones — Plataforma TUPA UNSAAC

> Justificación de diseño para AG-C12.02: metodología y arquitectura consistentes con las especificaciones de usuario (los RF de `requerimientos.md`).

---

## 1. Decisión arquitectónica

Se adopta **Arquitectura por Capas** en el backend, alineada con principios de Clean Architecture (regla de dependencia hacia adentro). El frontend sigue una organización por **features**.

**Por qué por capas (y no monolito acoplado):**
- Separa responsabilidades (SRP): cada capa tiene una única razón de cambio.
- Aísla la lógica de negocio del framework (Express) y de la BD (Prisma), permitiendo sustituir cualquiera sin reescribir reglas → cumple DIP y RNF-05 (portabilidad).
- Hace cada regla de negocio testeable de forma unitaria → soporta AG-C12.04 (pruebas obligatorias).
- La trazabilidad RF → service → repositorio → tabla queda explícita, lo que respalda AG-C12.01/02.

---

## 2. Estructura de carpetas

```
tupa-unsaac/
├── frontend/
│   └── src/
│       ├── pages/        # vistas por ruta
│       ├── features/     # dominio: tramites, solicitudes, pagos, auth, documentos
│       ├── components/   # UI reutilizable
│       ├── services/     # cliente HTTP tipado al backend
│       ├── hooks/
│       ├── types/
│       └── lib/
└── backend/
    └── src/
        ├── routes/         # endpoints + middlewares
        ├── controllers/    # req/res, sin lógica de negocio
        ├── services/       # lógica de negocio (núcleo)
        ├── repositories/   # acceso a datos vía Prisma
        ├── dtos/           # contratos de entrada/salida (Zod)
        ├── middlewares/    # auth, validación, manejo de errores
        ├── errors/         # errores de dominio
        ├── lib/            # utilidades (pdf, hash, etc.)
        └── prisma/         # schema.prisma y migraciones
```

---

## 3. Flujo de una petición (backend)

```
HTTP → route → middleware (auth/validación) → controller → service → repository → Prisma → PostgreSQL
                                                    ↑              ↑
                                              lógica de        acceso a
                                              negocio          datos
```

Reglas:
- El **controller** nunca contiene reglas de negocio; solo orquesta y traduce a HTTP.
- El **service** no conoce Express ni Prisma directamente; opera sobre repositorios e interfaces.
- El **repository** es el único que importa el cliente Prisma.
- La validación de entrada ocurre en el borde (DTO + Zod) antes del controller.

---

## 4. Principios SOLID aplicados (ejemplos concretos)

- **SRP:** `PagoService` solo simula pagos y genera comprobante; no maneja documentos ni notificaciones.
- **OCP:** las transiciones de estado se definen en una máquina de estados; agregar un estado no obliga a tocar los services existentes.
- **LSP/ISP:** interfaces de repositorio pequeñas y específicas por agregado (`ISolicitudRepository`, `ITramiteRepository`).
- **DIP:** los services dependen de interfaces de repositorio, no de Prisma.

---

## 5. Máquina de estados de la solicitud (regla central)

Estados (enum existente en BD): `SOLICITADO`, `EN PROCESO`, `PAGADO`, `PAGADO SIN ADJUNTO`, `ANULADO`, `CERRADO`.

Transiciones permitidas:
- `SOLICITADO` → `PAGADO` (RF-07, automático tras pago simulado) o `ANULADO`.
- `PAGADO` → `EN PROCESO` (RF-15, **solo operador**, D-4) o `CERRADO`.
- `EN PROCESO` → `CERRADO` o `ANULADO`.
- Cualquier transición se registra en `thistorial_estado` y dispara una notificación (RF-11).

Esta lógica vive en un único módulo (`services/estadoSolicitud.ts`) como fuente de verdad; controllers y UI la consultan, no la duplican.

---

## 6. Reglas de negocio críticas (derivadas de las dudas cerradas)

| Regla | RF | Implementación |
|---|---|---|
| Estudiante sin código válido → "Estudiante no válido" | RF-04 | Validación en `SolicitanteService` contra `talumno`. |
| Email y teléfono obligatorios | RF-04 | DTO obligatorio; si faltan en `talumno`, se piden y guardan en `tsolicitante`. |
| Bloqueo de solicitud duplicada activa del mismo trámite | RF-05 | `SolicitudService` consulta solicitudes activas antes de crear. |
| `EN PROCESO` solo manual por operador | RF-15 | Transición expuesta solo en endpoint con rol operador. |
| Trámite desactivado no admite nuevas solicitudes | RF-05/13 | `TramiteService` valida estado activo al crear solicitud. |
| Baja lógica, nunca DELETE físico | RF-13 | Campo de estado; repositorios sin `delete`. |

---

## 7. Convenciones de código

- TypeScript estricto (`strict: true`); evitar `any`.
- Nombres de código en inglés; comentarios, commits y documentación en español.
- Un service por agregado de dominio.
- Errores de dominio tipados; el middleware de errores traduce a códigos HTTP.
- Variables sensibles en `.env` (nunca en el repo).

---

## 8. Control de versiones (Git)

- Ramas: `main` (estable), `develop`, y `feature/RF-XX-descripcion` por funcionalidad.
- Commits en español referenciando el RF: `feat(RF-07): pago simulado con generación de comprobante`.
- Pull request por feature, revisado por otro integrante antes de fusionar.

---

## 9. Pruebas (AG-C12.04)

- Backend: Vitest (unit) + Supertest (integración). Cada service y cada endpoint crítico con su prueba.
- Frontend: Vitest + Testing Library para formularios y flujos críticos (registro, pago).
- Los tests viven junto al código (`*.test.ts`) para facilitar el informe de pruebas.
- Regla del equipo: ninguna lógica se marca terminada sin su prueba.
