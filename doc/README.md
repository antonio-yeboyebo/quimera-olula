# Documentación — Quimera Olula

Índice de toda la documentación del proyecto.

---

## Manual de usuario

Cómo se usa la aplicación (para usuarios finales y para quien los forma).

| Documento | Descripción |
|-----------|-------------|
| [Personalizar lo que ves](./usuario/vistas.md) | Columnas, botones de los documentos, tarjetas, vistas con nombre y, para administradores, compartir vistas y bloquear pantallas |

---

## Arquitectura

Cómo está estructurado el código y qué patrones seguimos.

| Documento | Descripción |
|-----------|-------------|
| [Guía DDD de vistas](./arquitectura/ddd_vistas.md) | Filosofía principal: capas diseño/dominio/infraestructura/vistas, máquinas de estado, patrón maestro/detalle |
| [Sobrecarga por cliente](./arquitectura/sobrecarga.md) | Inyección de dependencias con Factory para personalizar componentes por app |
| [El ecosistema Quimera Olula](./arquitectura/ecosistema.md) | Cómo encajan este frontend, el backend `olula_servidor` (FastAPI/CQRS) y el servidor `olula_mcp` (tools para agentes de IA) |

---

## Hooks propios

Referencia completa de todos los hooks de `@olula/lib`.

| Hook | Descripción |
|------|-------------|
| [useMaquina](./hooks/useMaquina.md) | Máquina de estados finitos — el hook de orquestación central |
| [useLista](./hooks/useLista.md) | Lista de entidades con selección activa |
| [useModelo](./hooks/useModelo.md) | Formulario con validación declarativa vía MetaModelo |
| [useForm](./hooks/useForm.md) | Aceptar/cancelar en modales con protección contra doble envío |
| [useLayout](./hooks/useLayout.md) | Toggle tarjeta/tabla con soporte responsive |
| [useEsMovil](./hooks/useEsMovil.md) | Detección reactiva de viewport móvil |
| [useFocus](./hooks/useFocus.md) | Auto-foco en input al montar un componente |

Ver también: [índice de hooks](./hooks/README.md)

---

## Guías de desarrollo

Cómo hacer cosas concretas.

| Documento | Descripción |
|-----------|-------------|
| [Control de acceso](./guias/control_acceso.md) | Sistema de reglas jerárquicas y función `puede()` |
| [Estilos de formulario](./guias/estilos_formulario.md) | Grid CSS de 12 columnas (desktop) / 2 columnas (móvil) |
| [Filtros](./guias/filtros.md) | MetaFiltro: tipos de filtro, constructores, personalización |
| [URL params y lista activa](./guias/url_params.md) | `ListaActivaEntidades`, `getUrlParams`, sincronización con la URL |
| [React best practices](./guias/react_best_practices.md) | Optimizaciones: hoist, lazy loading, estado derivado |
| [Testing](./guias/testing.md) | Tests con Vitest: máquinas de estado y componentes |
| [Specs](./guias/specs.md) | Desarrollo mediante specs: asociar specs a un módulo existente o crear uno nuevo |
| [Legacy](./guias/instrucciones_legacy.md) | Integrar apps Quimera legacy en Olula |

---

## Despliegue

| Documento | Descripción |
|-----------|-------------|
| [Guía de despliegue](./despliegue/README.md) | Estrategia por rama cliente, plantillas Docker/SCP/Offline |

---

## Plantillas

Código de arranque para crear nuevos módulos.

| Recurso | Descripción |
|---------|-------------|
| [plantilla/contexto/modulo/](./plantilla/contexto/modulo/) | Estructura completa de un módulo DDD con maestro, detalle, crear y borrar |

---

## Obsoleto

Documentos retirados de la guía activa. Se conservan como referencia histórica.

| Documento | Motivo |
|-----------|--------|
| [Estructuras useModel](./obsoleto/estructuras_usemodel.md) | Describe work-in-progress (`por hacer`) del patrón ClienteVenta; parcialmente superado |
| [Módulos](./obsoleto/modulos.md) | Stub sin desarrollar |
| [Informe permisos legacy](./obsoleto/permisos_legacy_informe.md) | Análisis interno del sistema ACL legacy; útil como referencia pero no como guía activa |
