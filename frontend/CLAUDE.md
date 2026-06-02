# Frontend — TUPA UNSAAC

React + Vite + TypeScript + Tailwind.

## Estructura
```
src/
├── pages/        # vistas por ruta (público, solicitante, admin)
├── components/   # componentes reutilizables
├── features/     # lógica por dominio (tramites, solicitudes, pagos, auth)
├── services/     # cliente HTTP hacia el backend (axios/fetch tipado)
├── hooks/        # hooks reutilizables
├── types/        # tipos compartidos (idealmente generados desde el backend)
└── lib/          # utilidades
```

## Convenciones
- TypeScript estricto. Componentes funcionales con tipado de props.
- Tailwind para estilos; evitar CSS suelto salvo casos puntuales.
- Estado de servidor: usa una librería de fetching (p. ej. TanStack Query) en vez de useEffect manual para llamadas.
- Accesibilidad (OE1/OE8): etiquetas en formularios, contraste suficiente, navegación por teclado.
- Diseño responsivo (móvil y escritorio).

## Áreas de la app
- **Público**: catálogo de trámites, búsqueda, detalle (RF-01 a RF-03).
- **Solicitante**: identificación por código, registro de solicitud, pago simulado, carga de documentos, seguimiento (RF-04 a RF-08).
- **Admin/Operador**: login, mantenimientos, revisión, dashboard y reportes (RF-11 a RF-17).

## Comunicación con backend
- Todas las llamadas pasan por `src/services/`, nunca fetch directo en componentes.
- Tipar las respuestas; manejar estados de carga y error en la UI.

## Pruebas
- Vitest + Testing Library para componentes con lógica.
- Prioriza testear formularios y flujos críticos (registro, pago simulado).
