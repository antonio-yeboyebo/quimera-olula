# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Quimera Olula** is a pnpm monorepo containing a React/TypeScript ERP frontend. The API backend is external (configured via `VITE_API_URL`).

## Commands

### Workspace-wide
```bash
pnpm lint          # Run ESLint across all packages
pnpm type-check    # Run TypeScript type checking
pnpm run ci        # Run all CI checks (lint + type-check + tests)
pnpm test          # Run tests in continuous watch mode
```

`pnpm type-check` lanza 18 procesos `tsc`, uno por paquete, y cada app comprueba además el
código fuente completo de `contextos`. Aun con la caché incremental tarda ~50 s. Para validar
un cambio local usa el filtro por paquete; deja el barrido completo para antes de un PR.

### Per app/package (replace `<nombre_app>` with the package name, e.g. `olula`)
```bash
pnpm run --filter @olula/<nombre_app> dev        # Dev server
pnpm run --filter @olula/<nombre_app> build      # Production build
pnpm run --filter @olula/<nombre_app> test       # Run tests
pnpm run --filter @olula/<nombre_app> type-check # Type check
```

Nombres reales de los paquetes compartidos: `@olula/lib`, `@olula/componentes`, `@olula/ctx`
(este último es `packages/contextos`, ojo que no se llama `@olula/contextos`).

### Running a single test file
```bash
pnpm run --filter @olula/<nombre_app> test src/path/to/test.ts
```

Tests use **Vitest** with jsdom environment and globals enabled (`describe`, `test`, `it` available without import).

### Environment configuration
To change the API URL, create a `.env` file in the app's root with:
```
VITE_API_URL=http://your-api-url
```

## Architecture

### Monorepo structure
- `packages/lib/` — Shared hooks, types, and utilities (`@olula/lib`)
- `packages/componentes/` — Reusable React UI components (`@olula/componentes`)
- `packages/contextos/` — Business domain modules (`@olula/contextos`)
- `apps/` — Standalone applications (`olula`, `guanabana`, `cabrera`, etc.)
- `legacy/` — Deprecated legacy code

### Domain-Driven Design layers

Each business domain in `packages/contextos/src/` follows a strict 4-file convention:

| File | Purpose |
|---|---|
| `diseño.ts` | TypeScript interfaces and function type signatures |
| `dominio.ts` | Business logic, pure functions, empty/default entities |
| `infraestructura.ts` | API calls using `RestAPI` — maps between API snake_case and domain camelCase |
| `maestro/`, `detalle/`, `crear/`, `borrar/`… | One folder per screen or operation, with its React components (see `_plantilla/modulo/`). No `vistas/` folder |

**Domains:** `almacen`, `ventas`, `tpv`, `compras`, `crm`, `auth`, `valores`, `comun`

### Key patterns in `@olula/lib`

**`useMaquina`** — Finite state machine hook for complex UI flows. A `Maquina<Estado>` is a `Record<Estado, Record<EventoName, Estado | OnEvento<Estado>>>`. Events either transition directly to a new state (string) or run an async function that returns the next state.

**`useLista`** — Manages paginated list state with filters and ordering.

**`useForm` / `useModelo`** — Form and model state management.

**`RestAPI`** (`packages/lib/src/api/rest_api.ts`) — Central HTTP client. All infrastructure functions use `RestAPI.get/post/patch/delete`.

**`criteriaQuery`** (`packages/lib/src/infraestructura.ts`) — Converts `Filtro`, `Orden`, `Paginacion` into query string parameters.

### Naming conventions
- Files and folders use `snake_case`
- React components use `PascalCase` inside files, but the files themselves use `snake_case`
- API payloads use `snake_case`; domain models use `camelCase`
- Infrastructure files contain mapper functions (e.g. `ventaDesdeAPI`) to convert between the two

### Path aliases
In `packages/contextos`, use `#/` to reference the package's own `src/`:
```typescript
import ApiUrls from "#/tpv/comun/urls.ts";
```

In cross-package imports, use the package name:
```typescript
import { RestAPI } from "@olula/lib/api/rest_api.ts";
```

### Component URL
A component review page is available at `/docs/componentes` when running the dev server.

### Plantillas de módulo

**Antes de implementar cualquier funcionalidad nueva, comprueba si coincide con alguna plantilla canónica y úsala como base literal.**

Las plantillas se encuentran en `packages/contextos/src/_plantilla/modulo/`:

- **`_plantilla/modulo/`** — módulo simple (maestro-detalle sin sub-recursos). Úsalo como base para cualquier módulo nuevo.
- **`_plantilla/modulo/_con_lineas/`** — delta para módulos con sub-recursos (líneas). Contiene los ficheros que **reemplazan** la base y los que se **añaden** sin equivalente en ella. Ver `_con_lineas/README.md` para instrucciones de uso.

Proceso:
1. ¿Nuevo módulo? → lee `_plantilla/modulo/` completo antes de empezar. Si tiene líneas, lee también `_con_lineas/README.md`.
2. ¿Nueva funcionalidad en módulo existente (modal, estado, sub-recurso)? → localiza el fichero equivalente en la plantilla y compáralo con el módulo real antes de modificar.
3. Copia y adapta (sustituye `Modulo`/`ModLin` por el nombre del dominio). Solo te apartes si el requisito lo hace imposible, e indícalo explícitamente.
4. ¿Auditar un módulo existente? → usa `/audit-modulo ruta/al/modulo` para comparar estructura y patrones contra la plantilla.

### Organización de vistas de sub-recursos (líneas, pagos, etc.)

Los componentes de operación sobre un sub-recurso (crear, cambiar, borrar) NO deben vivir en una subcarpeta genérica `lineas/`. Deben organizarse así, en la raíz del módulo:

```
modulo/
├── crear_linea/          # Modal de alta: CrearLineaXxx.tsx
├── cambiar_linea/        # Modal de edición: CambiarLineaXxx.tsx
├── borrar_linea/         # Modal de borrado: BorrarLineaXxx.tsx
└── detalle/
    └── lineas/           # Lista del sub-recurso + orquestación de modales: LineasXxx.tsx
```

Referencia canónica: `packages/contextos/src/_plantilla/modulo/_con_lineas/` y `packages/contextos/src/tpv/venta/`.

Reglas:

1. **Una carpeta por operación** — `crear_linea/`, `cambiar_linea/`, `borrar_linea/` en la raíz del módulo.
2. **El orquestador** (lista con botones + renderizado condicional de modales) vive en `detalle/lineas/NombreXxx.tsx`.
3. **Modales sin prop `activo`** — el padre controla la visibilidad con `{estado === "X" && <Modal />}`.
4. **`BorrarXxxLinea` usa `useForm`** — no llama directamente a la API ni usa `ContextoError` directamente.
5. **Los modales reciben la entidad ya resuelta** (`linea: LineaXxxConId`), nunca un nullable ni solo un ID.
