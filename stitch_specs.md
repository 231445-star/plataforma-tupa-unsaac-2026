# Especificación de Interfaces Faltantes - TUPA Digital UNSAAC

Este documento sirve como instrucción y especificación de diseño detallada para que un agente de generación de interfaces de usuario (como Stitch) cree las pantallas que completan el sistema **TUPA Digital UNSAAC**.

---

## 🎨 Sistema de Diseño y Estilos Comunes

Para mantener la consistencia con las interfaces ya construidas (`index.html`, `tramite.html` y `admin.html`), todas las nuevas pantallas deben cumplir con las siguientes reglas:

1. **Framework y Recursos:**
   - Usar **Tailwind CSS** mediante CDN: `<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>`
   - Tipografía: **Inter** desde Google Fonts.
   - Iconografía: **Material Symbols Outlined** de Google.

2. **Paleta de Colores (Extendida en Tailwind):**
   - `primary`: `#610000` (Rojo Granate UNSAAC)
   - `garnet`: `#4A0000` (Granate oscuro)
   - `background`: `#fcf9f8` (Blanco hueso suave)
   - `surface-container-low`: `#f6f3f2`
   - `outline-variant`: `#e3beb8`
   - `on-surface-variant`: `#5a403c`
   - `secondary`: `#775a19` (Dorado/Bronce andino)

3. **Elementos Visuales Identitarios:**
   - **Patrón Andino (`.andean-pattern`):** Un fondo sutil con patrón geométrico andino.
     ```css
     .andean-pattern {
         background-image: url("https://www.transparenttextures.com/patterns/az-subtle.png");
         opacity: 0.03;
     }
     ```
   - **Logotipo Oficial:** Usar el logo de la UNSAAC disponible en:
     `https://lh3.googleusercontent.com/aida-public/AB6AXuDVFd-TZtaXSGb3fCSFs0TjSMry8VQqIdXr0TWO5v1I5SwtRo28ckuWlMIeO7XIcU0PbHGKYCymwSnCtu76-3npt8d1y5SCfYsKR9eqA16KTYBuV-BoB45N9q3T1nK2rrjCCQ0shapsBPVTIfau0PE0H11f4mbK1s26PMQ7Gfn7jPQNZzWkYYBztj2M11QnroeeLgAbPPnaNgUQon_QTNC1T4JKKrLtiuCidCrR-GTrDXNYqoOGSYyRqRVBBBZxUDGYFXHko9d2CN0`

---

## 🖥️ Pantallas a Crear

### 1. Formulario de Nueva Solicitud (`solicitud.html`)
Esta pantalla permite al estudiante iniciar un trámite (como el Traslado Externo o la Constancia de Bachiller), ingresar sus datos, subir los documentos requeridos y registrar la información de pago.

- **Diseño de Interfaz:**
  - **Encabezado:** Barra de navegación idéntica a `index.html`.
  - **Layout:** Contenedor centralizado de ancho máximo `3xl` (tarjeta blanca con bordes redondeados `3xl` y sombra sutil).
  - **Secciones del Formulario (Paso a Paso o Acordeón):**
    1. **Datos del Solicitante:** Código de estudiante, DNI, nombres completos, correo y teléfono.
    2. **Selección del Trámite:** Selector desplegable con buscador para elegir el trámite (ej. "Traslado Externo", "Constancia de Egreso"). Debe mostrar el costo asociado de forma dinámica al seleccionar.
    3. **Subida de Requisitos:** Un área de arrastrar y soltar (drag & drop) para cada uno de los archivos necesarios (ej. "Certificado de estudios (PDF)", "Copia DNI (PDF)").
    4. **Comprobante de Pago:** Campos para ingresar el número de recibo de caja de la UNSAAC, la fecha de transacción y un selector para subir la foto del comprobante.
  - **Acciones:** Botón de "Enviar Solicitud" (color rojo granate, con micro-animación de carga al presionar) y botón "Cancelar".
- **Lógica Frontend (Mock JS):**
  - Validación en tiempo real para asegurarse de que todos los archivos requeridos están adjuntos y los campos llenos.
  - Petición `POST /api/solicitudes` simulada que envíe los datos en un formato `FormData`.

---

### 2. Detalle del Expediente para Administradores (`admin-detalle.html`)
Esta vista es utilizada por los tramitadores dentro de la bandeja de expedientes (`admin.html`) para revisar a fondo una solicitud, visualizar los PDF cargados por el usuario, y cambiar el estado (Aprobar/Observar/Anular).

- **Diseño de Interfaz:**
  - **Layout:** Dos columnas asimétricas (Sidebar de control de estado a la derecha `col-span-4`, área de documentos e información a la izquierda `col-span-8`).
  - **Columna Izquierda (Información y Archivos):**
    - Panel con datos del solicitante (Nombres, DNI, Código, Facultad).
    - Lista de requisitos presentados con un visor embebido de archivos (o botones interactivos de "Ver Documento" que abran una vista previa flotante en un modal).
    - Detalles del pago ingresado (Número de recibo, monto y miniatura del ticket de pago).
  - **Columna Derecha (Panel de Control de Estado):**
    - Tarjeta flotante con el estado actual del expediente.
    - Área de texto para añadir notas internas o comentarios de retroalimentación para el alumno.
    - **Botones de Acción Rápida:**
      - **Aprobar Trámite:** Cambia el estado a `PAGADO` o `CERRADO`. Abre un modal de éxito para subir la resolución firmada digitalmente si aplica.
      - **Observar Trámite:** Cambia el estado a `OBSERVADO` y activa un cuadro de texto obligatorio donde se listan los errores encontrados (ej. "El DNI está borroso").
      - **Anular Trámite:** Cambia el estado a `ANULADO` pidiendo una justificación oficial.
- **Lógica Frontend (Mock JS):**
  - Cargar el ID del expediente desde los parámetros de la URL (`?id=XXX`).
  - Peticiones `PATCH /api/expediente/${id}` para cambiar el estado.

---

### 3. Catálogo Completo de Trámites (`catalogo.html`)
Permite a los usuarios e interesados explorar todos los trámites disponibles en el TUPA de la UNSAAC con buscadores y filtros avanzados por categorías.

- **Diseño de Interfaz:**
  - **Buscador Principal:** Barra de búsqueda gigante en la parte superior con sugerencias automáticas.
  - **Filtros Laterales:** Categorías (Académico, Admisión, Matrícula, Grados, Administrativo), rango de costos, plazos de atención y tipo de silencio administrativo (positivo/negativo).
  - **Grilla de Trámites:** Tarjetas compactas e informativas (layout de 3 o 4 columnas) que muestren:
    - Nombre del trámite.
    - Costo y plazo estimado en días hábiles.
    - Botón "Ver Requisitos" (va a `tramite.html`) y "Iniciar" (va a `solicitud.html`).
- **Lógica Frontend (Mock JS):**
  - Consumir el endpoint `GET /api/tramites` y poblar dinámicamente la grilla con soporte de filtrado instantáneo en caliente.

---

### 4. Configuración del TUPA para Administradores (`configuracion.html`)
Acceso para administradores globales del sistema para editar requisitos, costos y plazos de los trámites en la base de datos.

- **Diseño de Interfaz:**
  - **Estructura:** Tabla de gestión tipo CRUD con controles para Crear, Editar y Desactivar trámites.
  - **Formulario Modal de Edición/Creación:**
    - Campos: Código TUPA, Denominación, Descripción, Costo (S/.), Plazo de atención (Días), Silencio Administrativo.
    - Lista dinámica de requisitos editables (botón de añadir/eliminar filas para definir qué documentos debe subir el alumno).
- **Lógica Frontend (Mock JS):**
  - Conectar con métodos `PUT` y `POST` a `/api/tramites`.
