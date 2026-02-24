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

### Per app/package (replace `<nombre_app>` with the package name, e.g. `olula`)
```bash
pnpm run --filter @olula/<nombre_app> dev        # Dev server
pnpm run --filter @olula/<nombre_app> build      # Production build
pnpm run --filter @olula/<nombre_app> test       # Run tests
pnpm run --filter @olula/<nombre_app> type-check # Type check
```

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
| `vistas/` | React components (views) |

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
