# Nueva UI de SmartSales (Sanhigía): plan de desarrollo

Plan para implementar la [lista de desarrollos](lista_desarrollos_nueva_ui_smartsales.md) a partir de la maqueta "Flujo completo del comercial". Los IDs (`COM-01`, `PAN9-01`…) son los de esa lista.

El estado del backend se ha verificado contra `extensiones_2.5.0/fun_jsenar/build/src` (build del 2026-10-28). Las referencias de fichero son relativas a `build/src/facturacion/`.

## Estado (2026-10-29)

Fases 0 a 6 desarrolladas. Tests de dominio, eslint y type-check de `smartsales/` en verde. Nada probado todavía contra pinebooapi ni la base de datos.

| Pendiente | Situación |
|---|---|
| Mapa (PAN3-01) | Hecho (2026-11-03): `QMapa` compartido en `packages/componentes/src/mapa/` (maplibre + OpenFreeMap), usado en `MapaClientes` (mapa y resultados de prospección). Falta probarlo en móvil (ver §6.3) |
| PDF de pedidos y facturas (PAN4-05) | Falta el nombre del informe Jasper del ERP |
| Gráfico de Rendimiento (PAN10-02) | Barras en CSS; decidir si se usa `recharts` |
| Objetivos por familia (PAN10-03) | Comprobar en la base de datos que `sh_familiasbonificacion.objetivo` está relleno |
| Campañas del comercial | Decidir el alcance de clientes cuando crea la campaña un supervisor y si se excluyen los clientes de baja |

---

## 1. Dónde se trabaja

| Pieza | Repo y ruta | Cómo |
|---|---|---|
| Pantallas | quimera-olula, `apps/sanhigia/src/contextos/smartsales/` | Módulos modernos con `LegacyAPI` (referencia: `apps/sanhigia/src/contextos/ventas/devoluciones/`) |
| Acciones y tablas | `extensiones_2.5.0/fun_jsenar/build/src` | Se edita en `build/src` y se guarda con `eneboo-assembler save fun_jsenar`. Nunca en `build/final` |
| Geolocalización inversa | olula_servidor, `apps/sanhigia/comandos/crm/tarea/aplicacion/geolocalizacion_inversa/` | Solo si se guarda la dirección de inicio de la visita (PAN6-01) |
| Comunicaciones | olula_servidor (`/comun/comunicacion`) | Sin cambios |

Estado actual del frontend:
- `smartsales/` solo tiene `menu.ts` (todo apunta a `/ss/...` legacy), `factory.ts` y `ComunicacionesResumen.tsx`.
- No hay `RouterFactory` de SmartSales. `main.tsx` monta juntos `router` (moderno) y `routerLegacy`, así que las dos UIs pueden convivir.
- Ya existen `LegacyAPI` (`packages/contextos/lib/src/api/legacy_api.ts`), el calendario (`packages/componentes/src/calendario`), la voz (`packages/contextos/lib/src/voz`) y `recharts`.
- **No hay componente de mapa moderno.**

---

## 2. Correcciones a la lista de desarrollos

Puntos en los que el código no coincide con lo que dice la lista y que cambian el trabajo.

| # | Lista | Código | Consecuencia |
|---|---|---|---|
| 1 | Tipos de tarea: Llamada, Email, Whatsapp, Cita | `ss_tareas.tipo` solo admite `Llamada,Email,Cita` (`principal/tables/ss_tareas.mtd:46`) | Añadir `Whatsapp` al `optionslist` |
| 2 | PAN4-05 Documentos: "sin cambios en lo básico" | `facturascli.get` no filtra por agente (`facturacion/restapi/facturascli_api.py:18`). Presupuestos filtra por `codagente`/`codagentemkt` pero no por `clientesagente` (`presupuestoscli_api.py:176`). El Jasper genérico (`informes/restapi/flfactinfo_api.py:18`) no controla el acceso | Sin cambios de acceso. Falta el PDF de pedidos y facturas (Fase 3) |
| 3 | PAN4-01: `dame_clientes` ya filtra por agente con `filtro_clientes_x_agente` | Solo filtra por `codagente` principal (`principal/restapi/clientes_api.py:330`) | Usar el `get` de clientes, que sí aplica `add_allowed_filter` con agentes adicionales |
| 4 | COM-02: las acciones de KPI admiten `codagente` | `dame_kpi_progreso` admite `codAgente` pero **no lo valida** contra `agentes_permitidos`. Sus trimestres son siempre del año en curso, y sin `customDates` da KeyError (`principal/restapi/usuarios_api.py:84-138`) | Validar el agente en el servidor. Admitir el año si Rendimiento debe ver otros años |
| 5 | PAN10-02: solo falta devolver importes en € | `get_historico_prevision` (`informes/restapi/ss_graficos_api.py:664`) tampoco admite `codagente`, y sus ventas no aplican `incluirenprev` ni series excluidas | Añadir parámetro de agente (validado) y aplicar el criterio de ventas del progreso en la salida en € |
| 6 | COM-01: fechas del periodo KPI "si faltan" | Solo llegan como texto: `"KPIs de dd-mm-aaaa a dd-mm-aaaa"` (`usuarios_api.py:552`, `:626`) | Devolver `fechainicio` y `fechafin` sueltas |
| 7 | PAN7-01: validación de "tipo que exige pedido" en el servidor | `ss_tipostrato.exigirgenerarpedido` no se usa en ningún `.py` ni `.qs` del servidor | Replicar la regla en la nueva UI (como hace legacy) o llevarla al servidor |
| 8 | PAN8-01: añadir tipo "inactivos" | `ss_campanias.tipo` admite `repeticion;captacion;medicion`; falta `ventaCruzada`, aunque el código la usa (`principal/tables/ss_campanias.mtd:38`) | Añadir `inactivos` y `ventaCruzada` al `optionslist`. Confirmado: no hay campo de descripción ni de agente creador |
| 9 | PAN6-01: dirección de inicio "igual que la de fin" | La de fin la calcula olula_servidor al consumir `crm.tarea.completada` → `crm.tarea.geolocalizacion_inversa` | Si se quiere la de inicio, hace falta un evento nuevo en `ss_tareas_api.py` y un consumidor en olula_servidor |
| 10 | Cambios de modelo con "`.mtd` + `dbupdate`" | `eneboo-assembler dbupdate` actualiza la lista de extensiones, no la base de datos | Confirmar cómo se aplican los cambios de esquema en el despliegue de Sanhigía |

### Más sencillo de lo previsto

- **COM-02:** el GET de `agentes` ya filtra por `agentes_permitidos` (`principal/restapi/agentes_api.py:15-50`). Probablemente baste con él y no haga falta acción nueva.
- **PAN2-02:** el mapa de `ss_tareas` ya expone `codcliente`, `codcontacto`, `codclienteincidencia`, el teléfono y el email (`ss_tareas_api.py:164-190`). Solo falta separar `nombrecliente` y `nombrecontacto`; hoy `nombrecontacto` es `COALESCE(contacto, cliente, incidencia)`.
- **PAN4-05, Actividad:** el filtro genérico por `codcliente` ya funciona. Para incluir las incidencias hay que combinarlo con OR con `codclienteincidencia`.
- **PAN9-01:** ya existen los filtros `mkt` y `farma`. `get_totales` devuelve `total`, `ganados` y `perdidos`, así que abiertos = total − ganados − perdidos.
- **PAN8-02:** `generar_trato_cliente_campania` asigna el trato a `campania.codagentetratos`. Con el comercial en ese campo sirve tal cual.
- **PAN8-03, Resultados:** ya existe un cálculo de ventas por subfamilia o referencia de una campaña (`get_graphs_campania`, `principal/restapi/ss_campanias_api.py:715-812`).

### Criterios a respetar para que las cifras cuadren

- **Ventas:** todas las acciones filtran por el agente **de la factura** (`facturascli.codagente`), no por el agente del cliente.
- **Clientes nuevos (PAN11-01):** el KPI cuenta por la combinación familia y subfamilia (`usuarios_api.py:815-866`):
  - un cliente puede sumar dos veces en la fila de familia;
  - un cliente que ya compraba la familia en otra subfamilia cuenta como nuevo;
  - `importeminimo` se compara por subfamilia.

  La lista de clientes nuevos tiene que usar el mismo criterio o no coincidirá con los contadores.
- **Objetivo de ventas:** `dame_kpi_progreso` calcula `objetivoinicial − ventas de otros agentes` en el momento de la consulta. El gráfico usa `sh_previsiones.objetivo`, que es el mismo cálculo pero guardado al editar la previsión (`principal/scripts/sh_previsiones.qs:210`). Pueden diferir si hay ventas de otros agentes posteriores a la última edición.
- **Límites:** `get_for_agenda` y `get_for_dia` devuelven como mucho 800 tareas. `get_for_rango` debe limitar o paginar.
- **`sh_familiasbonificacion.objetivo`** no lo usa ningún código. Antes de PAN10-03, comprobar con datos que está relleno y en euros.

### Fallos de legacy vistos de paso (fuera de alcance)

- El POST de tareas crea el evento de Google Calendar antes del `save`, así que la URL de la descripción queda con `idtarea=None` (`ss_tareas_api.py:157`, `:226`).
- La llamada a `enviar_pedido_pda` en `aprobar_presupuesto` está comentada (`ss_tratos_api.py:667`).
- `publicar_tratos_campania` depende del email del contacto. Los tratos de venta cruzada no llevan contacto, así que no se pueden publicar con ella.

---

## 3. Fases

Cada fase indica lo que hay que hacer en el backend (fun_jsenar) y en el frontend (quimera-olula). Los tamaños son estimaciones relativas.

### Fase 0 · Cimientos (M)

Bloquea a todas las demás.

**Backend**
- Paquete de modelo único (§4).
- `dame_kpi_progreso`:
  - devolver `goal`, `relative_goal`, `previous_year_sold`, `fechainicio` y `fechafin` del KPI;
  - validar `codAgente` contra `agentes_permitidos`;
  - que `customDates` sea opcional.

**Frontend**
- `RouterFactorySmartsales` y layout mobile-first con barra inferior y menú (+) (NAV-01, NAV-02).
- Estado global del "agente seguido" y su selector, sobre el GET de `agentes` (COM-02).
- Componentes comunes en `smartsales/comun/`: COM-01, COM-03, COM-04 y COM-05.
- Mappers comunes de tarea y trato.

### Fase 1 · Hoy y Agenda (L)

**Backend**
- `ss_tareas.get_for_rango {desde, hasta, conAtrasadas, codagente}` (PAN2-01):
  - incluye tareas de incidencias;
  - marca `atrasada`;
  - aplica `agentes_permitidos` y el observador, como el GET.
- Mapa de `ss_tareas`: añadir `nombrecliente` y `nombrecontacto` por separado (PAN2-02).

**Frontend**
- Hoy: PAN1-01 a PAN1-08. Los listados de los avisos enlazan a legacy al principio.
- Agenda: PAN2-03, con Día, Semana y Mes, los bloques Hoy, Mañana y Próximamente, y el historial.

### Fase 2 · Ciclo de visita (L)

**Backend**
- Campos nuevos de `ss_tareas` y tabla `sh_motivostarea` (§4).
- Mantenimiento de `sh_motivostarea` igual que `sh_motivosdevolucion`: módulo en olula_servidor y pantalla en quimera-olula (como `ventas/motivoDevolucion`).
- POST y PATCH de `ss_tareas` con motivo, producto e interlocutor.
- `ss_tareas.iniciar_visita`: valida que no haya otra visita en curso del agente.
- Cierre automático de las visitas en curso de más de un día.
- Crear tarea única: trato y tarea en una sola llamada (PAN5-02).
- Opcional: evento de dirección de inicio y su consumidor en olula_servidor.

**Frontend**
- Crear tarea (PAN5-01), con selector de producto en tres niveles y sugerencias.
- Visita en curso y finalizar (PAN6-01, PAN7-01) con `useMaquina`:
  - cierre del trato como ganado o perdido;
  - regla de "exige pedido".
- Dictado de nota (PAN7-02).

### Fase 3 · Clientes, contactos y tratos (L+)

**Backend**
- Acción de resumen de la ficha de cliente (PAN4-02, PAN4-03), con el parámetro de meses para "cliente activo".
- PDF de documentos (PAN4-05): presupuestos usan el `to_pdf` existente (`sh_presupuestoscli`). Pedidos y facturas, pendientes de saber qué informe Jasper usa el ERP para añadirles `to_pdf`. El control de acceso se queda como está.
- Mapa de `ss_tratos` con el origen de la campaña (PAN9-01).
- POST de `ss_tratos` con producto ligado; el valor es el PVP del artículo, ya que Sanhigía no tiene precio por cliente (PAN9-04).

**Frontend**
- Listado de clientes y contactos (PAN4-01), sobre el `get` de clientes.
- Ficha de cliente con sus cuatro pestañas.
- Ficha y alta de contacto.
- Tratos:
  - lista (PAN9-01);
  - **detalle** (PAN9-02, rehace `Trato` y `EstadoTrato`);
  - alta (PAN9-03) y alta desde una oportunidad (PAN9-04).

### Fase 4 · Rendimiento y objetivos (M)

**Backend**
- `get_historico_prevision`: salida en € con el criterio del progreso, y `codagente` validado.
- Acción nueva de ventas por familia y subfamilia (PAN10-03).
- KPIs `get_kpi_nuevos_clientes_familia` y `get_kpi_unidades_producto` por trimestres seleccionados.
- Lista de clientes nuevos con el criterio del KPI.
- `get_clientes_by_subfamilia` para una familia o varias subfamilias.

**Frontend**
- Rendimiento (PAN10-01, PAN10-02, PAN10-03).
- Objetivo de nuevos clientes (PAN11-01, PAN11-02, PAN11-03).

### Fase 5 · Mapa y prospección (L)

Bloqueada por la elección de la librería de mapas. Mientras tanto, se puede montar el componente con una interfaz propia.

**Backend**
- `ss_recomendaciones.get_clientes_mapa` (PAN3-02). Es la consulta más pesada; puede necesitar índices.

**Frontend**
- Componente de mapa (PAN3-01).
- Pantallas Mapa (PAN3-03), Filtros (PAN12-01) y Resultados (PAN13-01).
- Distancia en el navegador (PAN3-04).

### Fase 6 · Campañas del comercial (L)

**Backend**
- Vista previa de clientes según el tipo:
  - inactivos;
  - venta cruzada: solo admite listas de artículos (`ss_campanias_api.py:329-342`);
  - afinidad.
- Crear la campaña, crear los tratos y publicarlos directamente.
- Lista de campañas del comercial y resumen de una campaña.

**Frontend**
- Asistente "Nueva campaña", lista y detalle (PAN8-02, PAN8-03).

---

## 4. Paquete de modelo (fun_jsenar)

Va en una sola entrega.

| Tabla | Cambio | Para |
|---|---|---|
| `ss_tareas` | `tipo`: añadir `Whatsapp` | COM-04, PAN5-01 |
| `ss_tareas` | `idmotivo` | PAN5-01 |
| `ss_tareas` | `referencia`, `codfamilia`, `codsubfamilia` | PAN5-01 |
| `ss_tareas` | `fechainicio`, `horainicio`, `latitudinicio`, `longitudinicio`, `direccioninicio`, `encurso` | PAN6-01 |
| `ss_tareas` | `codcontacto` (interlocutor) | PAN6-01 |
| `sh_motivostarea` (nueva) | `id`, `descripcion`, `activo`, con su formulario de mantenimiento | PAN5-01 |
| `ss_tratos` | `referencia`, `codfamilia`, `codsubfamilia` | PAN9-04 |
| `ss_campanias` | `tipo`: añadir `inactivos` y `ventaCruzada`; `cuentamarketing`: añadir `comercial`; campo `descripcion`. El comercial va en `codagentetratos` (ya existe) | PAN8-01 |
| `facturac_general` | `idtipotratotareaunica`, `idtipotratoventaproducto` y `mesesclienteactivo` (12 por defecto) | PAN5-02, PAN9-04, PAN4-02 |
| `ss_tipostrato` (datos) | Tipos "Tarea única" y "Venta de producto" | PAN5-02, PAN9-04 |

Hecho en `build/src` y guardado en el parche (2026-10-28), salvo los datos de `ss_tipostrato`, que se dan de alta en la base de datos.

---

## 5. Pendientes

| Tema | Quién decide | Mientras tanto |
|---|---|---|
| Librería y teselas de mapa | Equipo | Componente con interfaz propia |
| "Ver detalle" de ventas (PAN10-01) | Cliente | No se desarrolla |
| Filtro "con tareas atrasadas" en Tratos | Cliente | Se deja como filtro |
| Ventas de 12 meses: criterio del progreso (PAN3-02) o todas las ventas (PAN4-02) | Cliente | La misma cifra en las dos pantallas |
| Cierre automático de visitas: hora de fin y qué pasa si era la última tarea del trato | Cliente | Hora de fin = hora de inicio y el trato queda abierto |
| Campañas del comercial: valor de `cuentamarketing` o campo `codagentecreador` | Equipo | — |
| Aplicación de los cambios de esquema en el despliegue | Equipo | — |

---

## 6. Siguiente iteración: ruta de inicio, estilo de la maqueta y mapa

### 6.1 Hoy pasa a `/ss/dashboard`

Hoy la ruta `/ss/dashboard` es la del dashboard legacy: está en `legacy/extensions/sanhigia/smartsales/index.ts:186` (`"/ss/dashboard": { view: "Dashboard" }`) y `crearRouterLegacy` monta la app legacy en esa misma ruta. La nueva pantalla Hoy está en `/ss/hoy`.

| Dónde | Cambio |
|---|---|
| `legacy/extensions/sanhigia/smartsales/index.ts` | `"/ss/dashboard"` → `"/ss/dashboard-legacy"` (nombre a confirmar) |
| `legacy/.../static/appmenu.js` | URL del menú legacy a `/ss/dashboard-legacy` |
| `smartsales/router_factory.ts` | `"ss/hoy"` → `"ss/dashboard"` y `"ss/hoy/atrasadas"` → `"ss/dashboard/atrasadas"` |
| `smartsales/comun/rutas.ts` | `hoy` y `tareasAtrasadas` a las rutas nuevas |
| `smartsales/menu.ts` | "Hoy" a `/ss/dashboard`; "Dashboard" a `/ss/dashboard-legacy` o se quita |

Sin cambios, y pasan a llevar a la nueva Hoy: el logo (`componentes/ExtraLogoSanhigia.tsx`) y los botones "volver" de las vistas legacy de Tratos, TratosMkt, TratosFarma y Tareas, y su Header.

Se renombra la ruta legacy en vez de dejar las dos con la misma: si coinciden, gana la que React Router ordene primero, y la app legacy seguiría resolviendo `/ss/dashboard` por su cuenta.

### 6.2 Estilo de la maqueta

Hoy SmartSales usa el tema genérico de quimera (`--color-primario` = `--mg-4`, gris verdoso `#6C9099`). La maqueta usa el rojo de Sanhigía.

**Tokens (primer paso, bloquea el resto)**
- Redefinir en `.LayoutSmartsales` los tokens del tema (`--color-primario`, `-oscuro`, `-claro`, `-hover`, `-selected`) con el rojo de marca. Así `QBoton`, `QModal` y el resto de componentes de `@olula/componentes` salen en rojo dentro de SmartSales sin cambiar el resto de la app.
- Rojo de marca: hex a confirmar con la guía de Sanhigía (en la maqueta se ve en torno a `#E30613`). Rojo suave para fondos de aviso y para el tiempo transcurrido de COM-01.
- Fondo de página gris claro y tarjetas blancas con radio de unos 12 px y sombra suave.

**Layout**
- Cabecera roja con el logo "Sanhigia SmartSales" y la campana (comunicaciones). Hay que decidir si en móvil sustituye a la cabecera del shell de quimera.
- Barra inferior: destino activo en rojo y botón (+) rojo, circular y elevado (ya está montada; solo cambian los colores).

**Componentes comunes nuevos en `smartsales/comun/componentes/`**
- `Pestañas`, de tipo segmentado: la activa como pastilla roja con texto blanco. Se usa en Día/Semana/Mes, Mis tratos/Todos, Resumen/Actividad/Tratos/Documentos y Recomendados/Trabajados/Resultados. Ahora cada pantalla tiene su propio `role="tablist"`.
- Chips con color fijo por significado:

  | Chip | Color |
  |---|---|
  | Visita | verde |
  | Llamada, Email | azul |
  | Atrasada | rojo |
  | En curso | naranja |
  | Afinidad Muy alta / Alta | verde |
  | Afinidad Media | naranja |

- Icono en cuadrado de color para las filas de listas (campañas, tratos, oportunidades). Botones de acción circulares en la ficha (Llamar, Email, WhatsApp, Cómo llegar).
- Botón principal a todo el ancho ("+ Añadir a la agenda", "Ver cliente", "Guardar y cerrar") y secundario con borde rojo.
- Cifras KPI grandes en negrita, con el objetivo en gris debajo y la variación en rojo o verde.
- Agenda: tira de días de la semana con el día elegido en rojo.

**Pantallas**

Una pasada por pantalla, en el orden de la maqueta (1 → 13), comparando con la imagen. Conviene hacerla a la vez que cada módulo se rehace según la plantilla, para no repetir el trabajo.

**Diferencias entre la maqueta y la lista de desarrollos.** Manda la lista, salvo que el cliente diga otra cosa:

| Maqueta | Lista |
|---|---|
| Tipo de tarea "Otro" | Sin "Otro" (PAN5-01) |
| Campo "Resultado" en visita en curso y finalizar visita | Sin resultado (PAN6-01) |
| Probabilidad (%) y etapas (Propuesta, En negociación) en Tratos | Sin probabilidad ni etapas (PAN9-01) |
| Pestaña "Año" en Objetivo de nuevos clientes | Solo trimestres (PAN11-01) |
| (+) con "Nueva visita", "Nueva tarea" y "Nuevo cliente" | "Nueva tarea o visita" y "Nuevo contacto"; no se dan de alta clientes (NAV-02) |
| (+) con "Nueva campaña" | La lista no la incluye; ya se ha añadido |

### 6.3 Mapa: ¿vale lo que ya hay?

Hay dos piezas:

| Pieza | Qué es | ¿Sirve? |
|---|---|---|
| `smartsales/comun/componentes/Mapa.tsx` | Plano SVG provisional sin teselas. Interfaz: `centro`, `radioKm`, `puntos`, `seleccionado`, `onSeleccionar`, `onMover` | La interfaz sí; el dibujo no |
| `packages/contextos/src/comun/dashboard/vistas/componentes/Mapa.tsx` | maplibre-gl 6.14 con teselas de OpenFreeMap (sin clave y con uso comercial permitido; se cambia con `VITE_MAPA_ESTILO`). Carga diferida, worker configurado para Vite, popups con nodos DOM | La librería y su configuración sí; el componente no, porque está atado a los datos del dashboard (burbujas por provincia) |

**Conclusión:** maplibre cubre todo lo que piden PAN3-01, PAN3-03 y PAN13-01: pines, popup, pan y zoom con recarga de la zona, centrar en un cliente y posición del comercial. No hace falta otra librería ni pagar teselas.

**Plan**
1. Componente genérico de mapa sobre maplibre con la interfaz del SVG actual, para que Mapa, Resultados y Campañas no cambien. Hay dos sitios posibles:
   - en `packages/componentes`, recomendado: lo pueden reutilizar otras apps y el dashboard puede migrar a él más adelante;
   - en `smartsales/comun/componentes`, añadiendo `maplibre-gl` a `apps/sanhigia/package.json`.
2. Copiar del mapa del dashboard la configuración del worker, el estilo y la carga diferida.
3. Ajustes para móvil:
   - sin `cooperativeGestures`, porque el mapa ocupa la pantalla;
   - pines de color según la afinidad y pin elegido resaltado;
   - punto azul con la posición del comercial.
4. `onMover`: al acabar el movimiento (`moveend`), pasar los límites visibles a centro y radio, que es lo que espera `get_clientes_mapa`.
5. Comprobar que el tamaño del bundle sigue bien (maplibre solo se carga en las pantallas con mapa) y que el mapa funciona con HTTPS y permiso de ubicación en el móvil.

### 6.4 Orden propuesto

1. Rutas (6.1). Es pequeño e independiente.
2. Tokens, layout y componentes comunes de estilo (6.2).
3. Componente de mapa (6.3).
4. Pasada de estilo pantalla a pantalla, junto con la alineación de cada módulo a la plantilla.

**Decidido (2026-11-03)**
- Ruta legacy: `/ss/dashboard-legacy`. Se mantiene en el menú como "Dashboard". **Hecho.**
- Rojo de marca: no hay guía. Se usa `#c8202f` (indicado por Juanma el 2026-11-04; antes `#e30613`, sacado de la maqueta) en la variable `--rojo-sanhigia` de `LayoutSmartsales.css`; para cambiarlo basta con tocar esa variable. **Hecho.**
- Cabecera: la general de la app, no una propia de SmartSales.
- Componente de mapa: compartido, en `packages/componentes`. **Hecho** (`QMapa`).
- Estilos comunes en `LayoutSmartsales.css` (fondo gris, `.tarjeta` blanca con sombra, `.pestañas` en pastilla roja), tarjeta de tarea con icono y color por tipo, afinidad "Alta" en verde, y pasada de estilo de Hoy, Agenda, Mapa/Resultados, Ficha de cliente, Crear visita/tarea, Visita (en curso y finalizar, con mapa de la ubicación de inicio), Campañas, Tratos (lista y alta), Rendimiento y Objetivo de nuevos clientes. **Hecho.** Siguiente: Filtros de prospección (pantalla 12).
- SmartSales prioriza la vista móvil. Por eso, maestro y detalle van como páginas separadas por ruta, no como `MaestroConDetalle`. Hay que añadir esa variante a `_plantilla/modulo/` antes de rehacer los módulos.
