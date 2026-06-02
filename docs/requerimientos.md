# Requerimientos Funcionales — Plataforma Web de Gestión del TUPA · UNSAAC

> Documento de especificación de software (AG-C12.01). Versión 2 — dudas cerradas. Cada requerimiento está mapeado a un Objetivo Específico (OE), priorizado con **MoSCoW** y trazado a las tablas de la base `bdtupa` (migrada a PostgreSQL conservando todos los datos históricos).

---

## 1. Alcance del MVP (decisiones cerradas)

| Decisión | Definición acordada |
|---|---|
| **Pagos** | Simulados (cambio de estado, sin pasarela real). |
| **Comprobante** | Genera un **PDF descargable** (D-2). |
| **Actor estudiante** | Realiza todo el proceso. **Sin cuenta**: se identifica por **código de alumno** contra `talumno`. Si el código no existe → mensaje "Estudiante no válido" y no avanza. **Email y teléfono son obligatorios** para continuar (D-1). |
| **Solicitudes duplicadas** | Un alumno **no** puede tener dos solicitudes activas del mismo trámite: se bloquea (D-3). |
| **Transición a `EN PROCESO`** | **Manual**: requiere validación del operador, no es automática (D-4). |
| **Trámite desactivado** | Con solicitudes en curso: **no se permiten nuevas**; las existentes siguen su flujo (D-5). |
| **Roles autenticados** | Operador y Administrador. |
| **Documentos** | Tabla nueva para adjuntos (PDF/imagen) con validación de formato y tamaño. |
| **Notificaciones** | Solo **in-app**. |
| **Base de datos** | Migración MySQL → **PostgreSQL** conservando **todos** los datos históricos, incluidas todas las sedes (D-6, D-7). |
| **Bajas** | Estado **lógico** (sin DELETE físico). |
| **Stack** | Opción A: React+Vite+TS+Tailwind / Node+Express+TS+Prisma / PostgreSQL. |

### Objetivos Específicos
OE1 UX · OE2 Consulta · OE3 Registro/seguimiento · OE4 Notificaciones · OE5 Documentos · OE6 Panel admin · OE7 Reportes · OE8 Accesibilidad/disponibilidad.

### MoSCoW
**M**=Must · **S**=Should · **C**=Could · **W**=Won't.

---

## 2. Actores

| Actor | Auth | Capacidades |
|---|---|---|
| **Estudiante** | No (código de alumno) | Consultar, registrar solicitud, simular pago, descargar comprobante PDF, subir documentos, seguir estado. |
| **Operador** | Sí | Mantenimientos, validación de documentos, transición de estados, dashboard. |
| **Administrador** | Sí | Todo lo del operador + usuarios, perfiles, configuración. |

---

## 3. Requerimientos Funcionales

### 3.1 Público — Consulta (OE2)

**RF-01 · Catálogo de trámites — `M`**
Lista trámites activos con denominación, dependencia y costo.
- *Criterios:* solo muestra trámites activos; paginado; carga < 2 s con datos de prueba.
- *Tablas:* `tcatalogotramite`, `tmontotramite`, `tunidadorganizativa`.

**RF-02 · Búsqueda y filtrado — `M`**
Busca por denominación, filtra por dependencia.
- *Criterios:* búsqueda parcial sin distinguir mayúsculas/tildes; sin resultados → mensaje claro.
- *Tablas:* `tcatalogotramite`, `tunidadtramite`.

**RF-03 · Detalle de trámite — `M`**
Requisitos, monto vigente, dependencia, base legal.
- *Criterios:* lista todos los requisitos y el monto vigente; trámite inexistente/inactivo → 404 controlado.
- *Tablas:* `tcatalogotramite`, `trequisitotramite`, `tmontotramite`.

---

### 3.2 Solicitante — Registro y Seguimiento (OE3)

**RF-04 · Identificación por código de alumno — `M`**
El estudiante ingresa su código; se valida contra `talumno`.
- *Criterios (D-1):*
  - Código existente → carga apellidos y nombres (solo lectura).
  - Código inexistente → mensaje "Estudiante no válido"; no avanza.
  - **Email y teléfono obligatorios**: si `talumno` no los tiene, se solicitan y deben completarse antes de continuar; se guardan en `tsolicitante`.
- *Tablas:* `talumno`, `tsolicitante`.

**RF-05 · Registro de solicitud — `M`**
Selecciona trámite y genera solicitud con estado `SOLICITADO`.
- *Criterios:*
  - Persiste solicitud con fecha, solicitante y trámite; genera código de seguimiento único.
  - **(D-3) Bloqueo de duplicados:** si el alumno ya tiene una solicitud activa (estado distinto de `CERRADO`/`ANULADO`) del mismo trámite, se rechaza con mensaje.
  - **(D-5)** No permite seleccionar trámites desactivados.
- *Tablas:* `tsolicitudtramite`, `tsolicitudtramitedetalle`.

**RF-06 · Seguimiento de estado — `M`**
Consulta el estado por código de seguimiento.
- *Criterios:* muestra estado actual e historial con fecha. Estados (enum ya definido en BD): `SOLICITADO`, `EN PROCESO`, `PAGADO`, `PAGADO SIN ADJUNTO`, `ANULADO`, `CERRADO`.
- *Tablas:* `tsolicitudtramite`, *(nueva `thistorial_estado`)*.

**RF-07 · Pago simulado — `M`**
Ejecuta pago simulado → estado `PAGADO` y registro de comprobante.
- *Criterios:* monto tomado de `tmontotramite`; sin pasarela real; genera comprobante y recibo.
- *Tablas:* `tsolicitudtramite`, `tcomprobantepago`, `tdetallecomprobantepago`, `treciboingreso`, `treciboingresodetalle`.

**RF-08 · Comprobante PDF descargable — `M`** *(D-2)*
Tras el pago simulado, genera un PDF descargable del comprobante.
- *Criterios:* el PDF incluye código de seguimiento, datos del solicitante, trámite, monto y fecha; descargable desde el seguimiento. La ruta se guarda en `tsolicitudtramite.ccomprobantepath`.
- *Tablas:* `tsolicitudtramite`, `tcomprobantepago`.

---

### 3.3 Documentos (OE5)

**RF-09 · Carga de documentos — `M`**
Adjunta PDF/imagen a la solicitud.
- *Criterios:* acepta `pdf/jpg/jpeg/png`, tamaño máx. configurable (5 MB sugerido); inválido → rechazo; válido → guarda metadatos (nombre, tipo, tamaño, ruta, fecha).
- *Tablas:* *(nueva `tdocumento_solicitud`)*, `tsolicitudtramite`.

**RF-10 · Validación de documentos por operador — `S`**
Marca cada documento `validado`/`observado` con comentario.
- *Criterios:* observar puede retornar la solicitud a `EN PROCESO`; el solicitante ve el comentario.
- *Tablas:* `tdocumento_solicitud`, `tsolicitudtramite`.

---

### 3.4 Notificaciones (OE4)

**RF-11 · Notificaciones in-app — `S`**
Notifica al solicitante en cada cambio de estado.
- *Criterios:* cada transición genera notificación visible en el seguimiento; sin correo.
- *Tablas:* *(nueva `tnotificacion`)*, `tsolicitudtramite`.

---

### 3.5 Administrativo — Mantenimientos (OE6)

**RF-12 · Autenticación operador/admin — `M`**
Login con control de acceso por rol.
- *Criterios:* credenciales inválidas → error genérico; sesión por token; rutas admin protegidas por rol.
- *Tablas:* `tusuario`, `tperfil`, `tlogin`, `ttoken`.

**RF-13 · Gestión de trámites — `M`**
Crea, edita y **desactiva lógicamente** trámites.
- *Criterios:* baja lógica (nunca DELETE físico); registra usuario y fecha. **(D-5)** un trámite desactivado no admite nuevas solicitudes.
- *Tablas:* `tcatalogotramite`, `tdetalletramite`.

**RF-14 · Gestión de requisitos y montos — `M`**
Administra requisitos y montos vigentes.
- *Criterios:* asocia/quita requisitos; cambio de monto conserva histórico (`tmontotramite` ya maneja `dfechainicio`/`dfechafin`).
- *Tablas:* `trequisitotramite`, `tmontotramite`.

**RF-15 · Revisión de solicitudes y transición de estados — `M`** *(D-4)*
Lista, filtra y revisa solicitudes; **transiciona manualmente** a `EN PROCESO`, `CERRADO` o `ANULADO`.
- *Criterios:* filtros por estado/fecha/trámite; `EN PROCESO` solo lo marca el operador (no automático); cierre/anulación registra motivo en historial.
- *Tablas:* `tsolicitudtramite`, `thistorial_estado`, `tcomprobantepago`.

**RF-16 · Gestión de usuarios y perfiles — `S`**
El administrador crea operadores y asigna perfiles.
- *Criterios:* solo admin; baja lógica; no se borra al último administrador.
- *Tablas:* `tusuario`, `tperfil`, `tlogin`, `tmenuperfil`, `tmodulo`.

---

### 3.6 Reportes y Dashboard (OE7)

**RF-17 · Dashboard — `M`**
Totales de trámites, solicitudes por estado, ingresos simulados.
- *Tablas:* `tsolicitudtramite`, `treciboingresodetalle`, `tcatalogotramite`.

**RF-18 · Reportes operativos — `S`**
Top 10 por ingreso, solicitudes por mes, trámites sin requisitos. Exportar CSV es `C`.
- *Tablas:* `treciboingresodetalle`, `tcatalogotramite`, `trequisitotramite`.

---

### 3.7 Transversales (OE1, OE8)

**RF-19 · UI responsiva y accesible — `S`** · OE1, OE8.
**RF-20 · Auditoría básica — `C`** · registra login, alta/baja de trámite, anulación. *Tabla nueva `tauditoria`.*

---

## 4. Requerimientos No Funcionales

| ID | RNF | Meta |
|---|---|---|
| RNF-01 | Rendimiento | Listados < 2 s con datos de prueba. |
| RNF-02 | Disponibilidad (OE8) | Despliegue en nube con health check. |
| RNF-03 | Seguridad | Hash de contraseñas; control por rol; validación de entradas. |
| RNF-04 | Mantenibilidad | TypeScript estricto, SOLID, arquitectura por capas. |
| RNF-05 | Portabilidad | Lógica desacoplada de la BD vía repositorios. |
| RNF-06 | Integridad de datos (D-7) | Migración conserva todos los datos históricos de todas las sedes. |

---

## 5. Tablas nuevas a crear

| Tabla | Propósito | RF |
|---|---|---|
| `tdocumento_solicitud` | Adjuntos PDF/imagen con metadatos y validación | RF-09, RF-10 |
| `thistorial_estado` | Historial de transiciones de estado | RF-06, RF-15 |
| `tnotificacion` | Notificaciones in-app | RF-11 |
| `tauditoria` | Acciones sensibles | RF-20 |

El resto reutiliza el esquema existente. Detalle en `base-datos.md`.
