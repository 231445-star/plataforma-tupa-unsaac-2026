# Base de Datos — Plataforma TUPA UNSAAC

> Esquema operativo en PostgreSQL, migrado desde el dump MySQL `bdtupa` conservando **todos** los datos históricos de **todas las sedes** (D-6, D-7).

---

## 1. Estrategia de migración MySQL → PostgreSQL

1. Restaurar el dump original en MySQL local.
2. Migrar datos y esquema a PostgreSQL (herramienta sugerida: `pgloader`, que maneja bien tipos MySQL→PG y conjuntos de caracteres).
3. Conservar **todos** los registros históricos, incluidas las tablas por sede (`talumnocusco`, `talumnocalca`, `talumnochecacupe`, además de `talumno`).
4. Una vez en PostgreSQL, generar el cliente con `prisma db pull` (introspección) seguido de `prisma generate`.
5. Las tablas nuevas se agregan con migraciones de Prisma (`prisma migrate`).

Notas de migración a vigilar:
- El dump usa charsets mezclados (`utf8mb3`, `utf8mb4`, `latin1`); normalizar a UTF-8 en PostgreSQL.
- Fechas tipo `varchar` (p. ej. `talumno.fechanac`, `fechanac` como texto) se conservan como vienen; no forzar conversión que pierda datos históricos.
- Hay valores `0000-00-00` en MySQL que PostgreSQL no acepta como fecha: mapear a `NULL` durante la migración.

---

## 2. Tablas existentes reutilizadas (esquema real del dump)

### `talumno` — padrón de estudiantes (fuente de identificación, RF-04)
Campos clave: `codigoalumno` (PK), `apalumno`, `amalumno`, `nombresalumno`, `dni`, `telefono`, `email`, `codigosede`, `activo`.
> Tiene `email` y `telefono`, pero muchos registros los traen vacíos → de ahí la regla de completarlos obligatoriamente (RF-04, D-1).

### `tsolicitante` — datos del solicitante de un trámite
`ccodigosolicitante` (PK), `cnumerodocumento`, `cnombres`, `capellidopaterno`, `capellidomaterno`.
> Aquí se persisten email/teléfono capturados en RF-04 (ver §4, requiere ampliar la tabla).

### `tcatalogotramite` — trámites TUPA
`ccodigo` (PK), `cdenominaciontramite`, `cdescripcion`, `ccodigobanco`, `btienemontofijo`.
> Necesita un campo de estado para baja lógica (ver §4).

### `trequisitotramite`
`nidtrequisitotramite` (PK), `ccodigo` (FK→tcatalogotramite), `cdescripcionrequisito`.

### `tmontotramite` — montos con vigencia
`nidtmontotramite` (PK), `ccodigo` (FK), `nmonto`, `cdescripcionpago`, `dfechainicio`, `dfechafin`.
> Ya soporta histórico de montos vía fechas de vigencia (RF-14).

### `tsolicitudtramite` — solicitudes (núcleo del flujo)
`nidtsolicitudtramite` (PK), `ccodigosolicitante` (FK), `dfechapeticion`, `dfecharegistro`, `ccomprobantepath`, `cnumerotransaccion`, `dfechapago`, **`cestado` enum** (`SOLICITADO`,`EN PROCESO`,`PAGADO`,`ANULADO`,`CERRADO`,`PAGADO SIN ADJUNTO`), `cidtsolicitudtramite` (código de seguimiento).
> El enum de estados y `ccomprobantepath` (ruta del PDF, RF-08) ya existen.

### `tsolicitudtramitedetalle`
`nidtsolicitudtramitedetalle` (PK), `nidtsolicitudtramite` (FK), `ccodigo` (FK), `nidtmontotramite` (FK), `ncantidad`, `nmontotramite`.

### `tcomprobantepago` / `tdetallecomprobantepago`
Comprobante con PK compuesta (`cnumerocomprobante`,`cserie`). Soporta RF-07/08.

### `treciboingreso` / `treciboingresodetalle`
Recibos de ingreso, base de los reportes de ingresos (RF-17/18).

### Seguridad: `tusuario`, `tperfil`, `tlogin`, `ttoken`, `tmenuperfil`, `tmodulo`
- `tusuario`: `cidtusuario` (PK), `cnombres`, `cpaterno`, `cmaterno`, `ccorreo`, `ctelefono`.
- `tlogin`: `clogin` (PK), `cidtusuario` (FK), `nidtperfil` (FK), `ccontrasenia`.
- `tperfil`: `nidtperfil` (PK), `cdescripcionperfil`.
> La columna `ccontrasenia` debe almacenar **hash** (RNF-03), no texto plano.

### Organización: `tunidadorganizativa`, `tunidadtramite`, `tserieunidadtramite`.

---

## 3. Diagrama de relaciones (núcleo del MVP)

```
talumno ──(código)──► tsolicitante ──1:N──► tsolicitudtramite ──1:N──► tsolicitudtramitedetalle
                                                   │                          │
                                                   │                          ├──► tcatalogotramite ──1:N──► trequisitotramite
                                                   │                          └──► tmontotramite
                                                   ├──1:N──► thistorial_estado        (NUEVA)
                                                   ├──1:N──► tdocumento_solicitud      (NUEVA)
                                                   ├──1:N──► tnotificacion             (NUEVA)
                                                   └──► tcomprobantepago ──► treciboingreso ──► treciboingresodetalle

tusuario ──1:N──► tlogin ──► tperfil          (autenticación operador/admin)
acciones sensibles ──► tauditoria             (NUEVA)
```

---

## 4. Ajustes a tablas existentes

| Tabla | Ajuste | Motivo / RF |
|---|---|---|
| `tcatalogotramite` | Agregar `bactivo` (boolean, default true) | Baja lógica de trámites (RF-13, D-5). |
| `tsolicitante` | Agregar `cemail`, `ctelefono` | Email/teléfono obligatorios (RF-04, D-1). |
| `tlogin` | Garantizar `ccontrasenia` con hash | Seguridad (RNF-03). |

---

## 5. Tablas nuevas (DDL conceptual para PostgreSQL)

### `tdocumento_solicitud` — RF-09, RF-10
```
nid              SERIAL PK
nidtsolicitudtramite  BIGINT FK → tsolicitudtramite
cnombrearchivo   VARCHAR(255)
ctipo            VARCHAR(10)        -- pdf, jpg, jpeg, png
ntamanio         INT                -- bytes
cruta            VARCHAR(500)
cestado          VARCHAR(20) DEFAULT 'PENDIENTE'  -- PENDIENTE/VALIDADO/OBSERVADO
cobservacion     VARCHAR(500)
dfechasubida     TIMESTAMP DEFAULT now()
```

### `thistorial_estado` — RF-06, RF-15
```
nid              SERIAL PK
nidtsolicitudtramite  BIGINT FK → tsolicitudtramite
cestadoanterior  VARCHAR(20)
cestadonuevo     VARCHAR(20)
cmotivo          VARCHAR(500)
cusuario         VARCHAR(20)        -- quién hizo la transición (operador)
dfecha           TIMESTAMP DEFAULT now()
```

### `tnotificacion` — RF-11
```
nid              SERIAL PK
nidtsolicitudtramite  BIGINT FK → tsolicitudtramite
cmensaje         VARCHAR(300)
bleida           BOOLEAN DEFAULT false
dfecha           TIMESTAMP DEFAULT now()
```

### `tauditoria` — RF-20
```
nid              SERIAL PK
cusuario         VARCHAR(20)
caccion          VARCHAR(100)       -- LOGIN, BAJA_TRAMITE, ANULACION, etc.
cdetalle         VARCHAR(500)
dfecha           TIMESTAMP DEFAULT now()
```

---

## 6. Índices y restricciones recomendadas

- Índice en `tsolicitudtramite(ccodigosolicitante, cestado)` para acelerar el chequeo de duplicados (RF-05).
- Índice en `tsolicitudtramite(cidtsolicitudtramite)` para búsqueda por código de seguimiento (RF-06).
- Restricción de aplicación (no de BD) para el bloqueo de solicitud duplicada activa del mismo trámite: se valida en `SolicitudService` porque depende del estado.

---

## 7. Datos de prueba

Tras la migración, el padrón `talumno` ya trae miles de registros reales: úsalos como datos de prueba para RF-04. Para solicitudes/pagos, generar un conjunto controlado en estados variados que alimente el dashboard (RF-17).
