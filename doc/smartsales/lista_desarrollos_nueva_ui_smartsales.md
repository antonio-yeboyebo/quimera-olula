# Nueva UI de SmartSales (Sanhigía): lista de desarrollos

Este documento recoge **qué hay que desarrollar** para la nueva interfaz de SmartSales a partir de la maqueta **"Flujo completo del comercial"** y de lo acordado con el cliente. Para cada desarrollo indica qué se ve en pantalla, qué datos necesita, qué hay que hacer en el backend y qué en la UI.

---

## 1. Cómo leer este documento

### 1.1 Pantallas de la maqueta

Las referencias *(pantalla N)* siguen la numeración de la imagen de la maqueta:

| Nº | Pantalla | Nº | Pantalla |
|---|---|---|---|
| 1 | Inicio / Hoy | 8 | Campañas |
| 2 | Agenda | 9 | Tratos |
| 3 | Mapa | 10 | Rendimiento |
| 4 | Ficha de cliente | 11 | Objetivo de nuevos clientes |
| 5 | Crear visita/tarea | 12 | Filtros de prospección |
| 6 | Visita en curso | 13 | Resultados en el mapa |
| 7 | Finalizar visita | — | Barra inferior y botón (+) |

Las pantallas o elementos que hay que desarrollar y **no aparecen en la maqueta** van marcados con **🆕 No está en la maqueta**.

### 1.2 Estructura de cada desarrollo

Cada desarrollo tiene un **ID** (por ejemplo `HOY-03`) para poder citarlo, y estos apartados:

- **Qué:** lo que ve y hace el usuario.
- **Datos:** la información que necesita la pantalla y de dónde sale.
- **Backend:** lo que hay que hacer en pinebooapi. Empieza por una de estas etiquetas:
  - **Sin cambios:** la acción ya existe y devuelve lo necesario.
  - **Ampliar:** acción existente a la que hay que añadir campos o un parámetro opcional.
  - **Acción nueva:** lógica nueva sobre datos que ya existen.
  - **Modelo:** tablas o campos nuevos.
- **UI:** lo que hay que hacer en quimera-olula.
- **⚠️ Pendiente:** solo si queda algo por decidir. Indica qué se puede hacer mientras tanto.

Los cambios de modelo de datos y las acciones nuevas o ampliadas de backend están resumidos al final (§17 y §18).

---

## 2. Usuarios y dispositivos

- **Quién la usa:** los comerciales sobre todo, pero también Marketing y otros grupos. **Todos tienen los mismos accesos y pantallas.** Lo que cambia es **qué datos ve cada uno**, con el filtro por agente que ya existe:
  - el **comercial** ve lo suyo;
  - el **supervisor** ve lo suyo por defecto y puede elegir a sus supervisados;
  - el **superusuario** y los grupos con visión global ven todo.

  El filtro es `agentes_permitidos` para tareas y tratos, y `filtro_clientes_x_agente` para clientes (agente principal y agentes adicionales de `clientesagente`).
- **Dispositivo:** se usará sobre todo desde **móvil y tablet**. El diseño debe ser **mobile-first** y verse bien en tablet; en escritorio basta con que funcione.

---

## 3. Modelo de datos de SmartSales que hay que tener presente

- **Cliente ≠ contacto.**
  - Un **cliente** (`clientes`) es la empresa o clínica del ERP: tiene direcciones (`dirclientes`, con coordenadas en `geo_latitud` / `geo_longitud` / `geo_estadogeo`), ventas, pedidos y facturas.
  - Un **contacto** (`crm_contactos`) es una persona (doctor, asistente a un curso, lead de una campaña). Puede estar asociado a un cliente o no.
  - En la app web **no se dan de alta clientes**, solo contactos.
- **Tratos** (`ss_tratos`): son las oportunidades de venta.
  - Datos: tipo (`ss_tipostrato`, que decide la tarea inicial y si exige pedido), valor, cliente y/o contacto, campo de texto `familias` (informativo) y estado: `-` (pendiente), `Ganado` o `Perdido`, con causa de pérdida.
  - Pueden tener un **agente observador** (`codagenteobservador`), por ejemplo en los de licencia farmacéutica.
  - Los de campaña tienen `idcampania` y se ven cuando están publicados (`estadoasigagente = 'Publicado'`).
  - Desde el trato se crean presupuestos y pedidos y se envían a la PDA.
- **Tareas** (`ss_tareas`):
  - **Siempre cuelgan de un trato o de una incidencia.** No hay tareas sueltas: su cliente o contacto es el del trato o la incidencia.
  - **Tipos:** Llamada, Email, Whatsapp y Cita. En la nueva UI, "Cita" se muestra como **"Visita"**.
  - Una tarea está completada o no. Al completarla se guardan la fecha, la hora y la latitud/longitud de fin, y la dirección se calcula después por un evento (`crm.tarea.completada`).
  - Se sincronizan con Google Calendar.
- **Afinidad:** la calcula un modelo de recomendación externo por **cliente + dirección + subfamilia** (`recomendacion_subfamilias.sup_unsup_rec_score`, de 0 a 1). No depende del comercial. Se usa siempre la **dirección de facturación**.
  - **Niveles:** Muy alta ≥ 85 %, Alta ≥ 70 % y Media ≥ 50 %. Son los mismos en todas las pantallas.
  - **Sin subfamilia concreta:** se muestra la afinidad **máxima** del cliente.
- **Objetivos:**
  - **Ventas:** por agente y trimestre, en `sh_previsiones`.
  - **Clientes nuevos y unidades por producto:** por agente y trimestre, en `sh_kpiporagente` y sus líneas.
- **Criterio de ventas del progreso:** es el que usa "Ventas realizadas" (`usuarios_api.get_ventas_periodo`):
  - suma `lineasfacturascli.pvptotal` (importe neto de línea, sin IVA) de las facturas de cliente del agente;
  - solo cuenta los artículos de familias con `incluirenprev = true`;
  - excluye las series configuradas en `factppal_general.seriesexcluidos`.

  Las acciones nuevas que calculen ventas usan **este mismo criterio**, salvo que se indique otra cosa (ver PAN10-03).

---

## 4. Arquitectura: UI moderna de quimera-olula sobre el backend legacy (pinebooapi)

### 4.1 Frontend (quimera-olula)

- **Dónde:** `apps/sanhigia/src/contextos/smartsales/`, un módulo por pantalla o recurso, con la estructura moderna de 4 ficheros (`diseño.ts`, `dominio.ts`, `infraestructura.ts`, `vistas/`). Se parte de las plantillas de `packages/contextos/src/_plantilla/modulo/`.
  - Componentes comunes de SmartSales en `apps/sanhigia/src/contextos/smartsales/comun/`.
- **Llamadas al backend: siempre a pinebooapi**, con `LegacyAPI` (`@olula/lib/api/legacy_api.ts`), no con `RestAPI`:
  - `legacyUrl(modelo, { id, action, staticAction, params })` construye `modelo[/id][/-static-]/accion?filter=…&page=…`;
  - `legacyFilterFromCriteria(filtro, base)` traduce los filtros de `useLista` al formato `{"and": [[campo, op, valor], …]}` de pinebooapi;
  - el token es el mismo que usa legacy (`token-refresco`, cabecera `Token …`) y la URL base es `VITE_LEGACY_API_URL`;
  - las respuestas de pinebooapi vienen como `{ data, page }`, y los mappers de `infraestructura.ts` las pasan a camelCase.
- **Módulo de referencia:** `apps/sanhigia/src/contextos/ventas/devoluciones/`. Es un módulo moderno completo (maestro, detalle, crear y máquina de estados) que trabaja solo con `LegacyAPI`. Sirve de modelo para todos los módulos de esta lista.
- **Única excepción:** las **comunicaciones** (PAN1-08) ya existen en la API de olula_servidor y se siguen llamando con `RestAPI`, reutilizando `ComunicacionesResumen.tsx`.
- **Patrones:** `useMaquina` para los flujos de varios pasos (visita en curso, finalizar visita, nueva campaña) y `useLista` para los listados.
- **Componentes y librerías disponibles:**
  - `@olula/componentes/calendario`, para la agenda;
  - `recharts`, para los gráficos (ya se usa en `predicciones`);
  - `@olula/lib/voz`, para dictar notas (`useReconocimientoVoz`).
- **Rutas y menú:** las rutas nuevas se registran en el router de la app (`apps/sanhigia/src/router_factory.ts`) y en el menú de SmartSales (`apps/sanhigia/src/contextos/smartsales/menu.ts`). La pantalla **Hoy** sustituye a `/ss/dashboard` como inicio de SmartSales. Las vistas legacy que no se rehacen siguen en sus rutas `/ss/...`.

### 4.2 Backend (pinebooapi / Eneboo)

- **Dónde se cambia:** las APIs y tablas de SmartSales vienen de la extensión genérica `extensiones_2.5.0/smartsales`, y Sanhigía las extiende en `extensiones_2.5.0/fun_jsenar`. **Todos los cambios van en `fun_jsenar/patches/fun_jsenar/`**, nunca en `build/final`, que es el resultado del montaje.
  - APIs: `*_api.py` (`ss_tareas_api.py`, `ss_tratos_api.py`, `ss_campanias_api.py`, `ss_recomendaciones_api.py`, `usuarios_api.py`, `clientes_api.py`, `contactos_api.py`, `sh_timelinecontacto_api.py`, `ss_graficos_api.py`…).
  - Tablas: `.mtd`. Los cambios de modelo se hacen con parche del `.mtd` en `fun_jsenar` más `dbupdate`.
- **No romper legacy:** la web legacy y el escritorio siguen usando las acciones actuales (`get_for_agenda`, `get_for_dia`, `get_direcciones_mapa`, `dame_kpi_progreso`, `get_historico_prevision`…). No se cambia su comportamiento. Lo nuevo va en **acciones nuevas** o en **parámetros opcionales**.
- **Seguridad:** toda acción nueva aplica en el servidor el filtro por agente (`agentes_permitidos` o `filtro_clientes_x_agente`). Nunca debe fiarse de un filtro de agente enviado por el frontend.

---

## 5. Componentes comunes

### COM-01 · Indicador de progreso con tiempo transcurrido
- **Qué:** en todos los porcentajes de "conseguido sobre un periodo" (pantallas 1, 10 y 11), el círculo o la barra muestran **dos valores superpuestos**:
  - en **color suave** (por ejemplo rojo claro), el **tiempo transcurrido** del periodo hasta hoy;
  - en **color fuerte** (rojo oscuro), lo **conseguido** sobre el objetivo.

  Ejemplo: a mitad de trimestre y con el 10 % del objetivo conseguido, se ve un 50 % claro y un 10 % oscuro.
- **Datos:**
  - % conseguido = alcanzado / objetivo **total** del periodo, no el prorrateado;
  - % de tiempo = días transcurridos / días del periodo, calculado en el frontend con las fechas del periodo.
- **Backend:** depende del indicador:
  - **Ventas:** `dame_kpi_progreso` ya da `percent` contra el objetivo total.
  - **Clientes nuevos y unidades por producto:** el KPI devuelve `objetivo` y `alcanzada` por línea. Su campo `porcentaje` va contra el objetivo prorrateado por días y **no sirve** para este indicador. Si la respuesta no incluye las fechas del periodo KPI, hay que **ampliarla** con ellas.
- **UI:** componente reutilizable (círculo y barra).

### COM-02 · Selector de agente (supervisores y superusuarios)
- **Qué:** por defecto cada usuario ve lo suyo, también el supervisor. Quien puede ver a otros agentes tiene un **selector con autocompletado** para elegir uno. Afecta a Hoy, Agenda, Tratos, Rendimiento y Objetivo de nuevos clientes.
- **Datos:** los agentes que el usuario puede ver.
- **Backend:** **Ampliar** o **Acción nueva**: una acción que devuelva la lista de agentes permitidos del usuario (a partir de `agentes_permitidos`). Las acciones de tareas, tratos y KPIs ya admiten filtrar por `codagente`.
- **UI:** selector y estado global del "agente seguido". Solo se muestra a quien puede ver a otros agentes.

### COM-03 · Selector de periodo
- **Qué:**
  - en Rendimiento (pantalla 10): uno o varios trimestres, o un periodo de fechas concreto;
  - en Objetivo de nuevos clientes (pantalla 11): **solo trimestres**, uno o varios.

  Es el mismo funcionamiento que el bloque "Progreso" actual.
- **UI:** componente reutilizable con pestañas, como en la maqueta: **Trimestre** (año y T1–T4, uno o varios), **Año** (los cuatro trimestres del año) e **Histórico** (fechas desde y hasta). En el modo "solo trimestres" no aparece Histórico.

### COM-04 · Tarjeta de tarea
- **Qué:** hora, **cliente y contacto** (los dos si el trato tiene ambos), descripción y **dos etiquetas** en posiciones fijas: **tipo** (Visita, Llamada, Email, Whatsapp) y **estado** (Atrasada, En curso). Se reutiliza en Hoy, Agenda y la ficha de cliente.
- **Tarea atrasada:** no completada y cuya **fecha y hora ya han pasado**. Una tarea de hoy cuya hora ya ha pasado también está atrasada. Si no tiene hora, está atrasada cuando su fecha es anterior a hoy.
- **UI:** componente reutilizable.

### COM-05 · Niveles de afinidad
- **Qué:** etiqueta Muy alta (≥ 85 %), Alta (≥ 70 %) o Media (≥ 50 %) a partir del score (0–1 → 0–100 %).
- **UI:** función en `dominio.ts` común, usada en Mapa, Ficha, Crear visita y Campañas.

---

## 6. Navegación global (barra inferior y botón +)

### NAV-01 · Contenedor de la app y barra inferior
- **Qué:** layout móvil con la barra inferior **Hoy · Agenda · (+) · Clientes · Campañas**. Sustituye al inicio actual de SmartSales.
  - **Clientes** abre el listado de clientes y contactos (PAN4-01).
  - **Campañas** abre las campañas del comercial (pantalla 8).
- **Backend:** Sin cambios.
- **UI:** layout, rutas y entrada de menú. Durante la transición, el resto de opciones del menú actual siguen enlazando a legacy.

### NAV-02 · Botón (+)
- **Qué:** el (+) abre el menú de acciones rápidas: **Nuevo trato** (PAN9-03), **Nueva tarea o visita** (PAN5-01) y **Nuevo contacto** (PAN4-07). No se dan de alta clientes. Es el único punto de alta: no se ponen accesos repetidos en la pantalla Hoy, para no sobrecargarla.
- **Backend:** Sin cambios (los de cada formulario).
- **UI:** menú de acciones rápidas.

### NAV-03 · Lo que no se rehace
Sigue en legacy o en escritorio, sin cambios:
- el maestro de campañas de Marketing (crear, lanzar y publicar, ActiveCampaign, Meta);
- Lead Pacientes;
- Business Intelligence;
- Tipos de trato;
- Licencias farmacéuticas;
- la gestión de cursos y eventos;
- la carga de histórico de ventas.

---

## 7. Pantalla 1 · Hoy

**Periodo:** Hoy muestra siempre **el trimestre en curso**, sin selector. Para cambiar de periodo:
- al pulsar las ventas se abre Rendimiento (pantalla 10);
- al pulsar los clientes nuevos se abre Objetivo de nuevos clientes (pantalla 11).

### PAN1-01 · Avisos bajo el mensaje de bienvenida
- **Qué:** debajo del saludo, tres avisos con **fondo rojo del tema y letra blanca**, cada uno con su contador y enlace a su listado:
  - "Contactos de cursos";
  - "Contactos más activos en últimos meses";
  - "Pedidos de clientes de su zona hechos por otros agentes".
- **Datos y backend:** Sin cambios.
  - Contadores de contactos: `sh_timelinecontacto.get_counter_interacciones`.
  - Listados de contactos: `get_contactos_ultimo_evento` y `get_contactos_activos`.
  - Pedidos de otros agentes: `get_count_pedidos_otro_agente` (contador) y el listado y detalle que usa hoy la vista legacy `PedidosCliOtrosAgentes`.
- **UI:** los avisos y **sus tres listados** 🆕 *No está en la maqueta*. Como alternativa inicial, los listados pueden enlazar a las vistas legacy (`/ss/contactos/cursos/`, `/ss/contactos/activos/` y la de pedidos de otros agentes).

### PAN1-02 · Mi progreso comercial
- **Qué:** ventas del trimestre en curso, objetivo, % de cumplimiento con COM-01, comparativa con el mismo periodo del año anterior y etiqueta "T4 2026". Al pulsar la cifra de ventas se abre Rendimiento.
- **Datos:** `dame_kpi_progreso` con el trimestre actual: `total`, `percent` e `increment`. `increment` es la comparación con el mismo periodo del año anterior hasta la misma fecha.
- **Backend:** **Ampliar** `dame_kpi_progreso`. Ya calcula `goal` (objetivo absoluto), `relative_goal` y `previous_year_sold`, pero no los devuelve: hay que añadirlos a la respuesta.
- **UI:** bloque de progreso.

### PAN1-03 · Clientes nuevos por familia
- **Qué:** una barra por familia con COM-01. Al pulsar se abre la pantalla 11.
- **Datos:** `dame_kpi_progreso` → `kpi_nuevos_clientes_familia` (por familia: `objetivo` y `alcanzada`; periodo KPI vigente).
- **Backend:** Sin cambios, salvo las fechas del periodo (ver COM-01).
- **UI:** lista de barras.

### PAN1-04 · Unidades por producto
- **Qué:** el KPI actual "Unidades por producto" (objetivo frente a alcanzado por grupo de referencias), con COM-01. 🆕 *No está en la maqueta*.
- **Datos:** `dame_kpi_progreso` → `kpi_unidades_producto`.
- **Backend:** Sin cambios, salvo las fechas del periodo (ver COM-01).
- **UI:** reutiliza el componente de PAN1-03.

### PAN1-05 · Tareas de hoy y atrasadas
- **Qué:**
  - primero las tareas **de hoy**, marcando como atrasadas las que ya han pasado de hora, y después las **atrasadas de días anteriores**. Esto solo ocurre en la pantalla Hoy: en la Agenda las atrasadas no se arrastran (PAN2-03);
  - con la tarjeta COM-04;
  - incluye las tareas de incidencias.
- **Datos:** acción de rango de tareas (PAN2-01) con `conAtrasadas`.
- **Backend:** ver PAN2-01 y PAN2-02.
- **UI:** lista con COM-04.

### PAN1-06 · Aviso de tareas atrasadas
- **Qué:** sustituye a la ventana emergente actual. Es un aviso en Hoy con el número de tareas atrasadas; al pulsarlo se abre **la lista de tareas atrasadas** 🆕 *No está en la maqueta*.
- **Datos:** tareas atrasadas (definición en COM-04) de cualquier fecha.
- **Backend:** Sin cambios: GET de `ss_tareas` con `completada = false` y fecha (y hora) anteriores a ahora.
- **UI:** aviso y lista.

### PAN1-07 · Tratos abiertos
- **Qué:** los últimos tratos abiertos del comercial. Al pulsar uno se abre su detalle (PAN9-02). 🆕 *No está en la maqueta*.
- **Datos y backend:** Sin cambios: `trato.get` con estado distinto de Ganado y Perdido.
- **UI:** lista corta.

### PAN1-08 · Comunicaciones
- **Qué:** resumen de comunicaciones sin leer, con enlace al listado. 🆕 *No está en la maqueta*.
- **Backend:** Sin cambios. Es la API de olula_servidor (`/comun/comunicacion`), la única excepción a `LegacyAPI`.
- **UI:** reutilizar `ComunicacionesResumen.tsx`.

**Desaparecen de Hoy** los accesos "Tratos de venta de formación" y "Tratos de licencia farmacéutica": esos tratos se ven en la lista de Tratos con un chip (PAN9-01).

---

## 8. Pantalla 2 · Agenda

### PAN2-01 · Acción de tareas por rango (backend)
- **Qué:** una sola acción para la Agenda (Día, Semana y Mes), los bloques Hoy / Mañana / Próximamente y la lista de la pantalla Hoy.
- **Backend:** **Acción nueva** en `ss_tareas_api.py`, por ejemplo `get_for_rango {desde, hasta, conAtrasadas}`:
  - devuelve las tareas no completadas **cuya fecha está dentro del rango** `[desde, hasta]`, también las de **incidencias**. Las que ya están atrasadas (COM-04) se devuelven marcadas (por ejemplo `atrasada = true`), pero **solo si su fecha cae dentro del rango**;
  - `conAtrasadas = true` añade además las atrasadas con fecha **anterior** al rango. **Solo lo usa la pantalla Hoy** (PAN1-05); la Agenda no lo usa nunca;
  - aplica `agentes_permitidos` y admite filtrar por `codagente` (COM-02);
  - **no** devuelve tratos.

  `get_for_agenda` y `get_for_dia` no se tocan, porque las usa legacy y solo devuelven tareas de tratos abiertos.

### PAN2-02 · Cliente y contacto en las tareas (backend)
- **Backend:** **Ampliar** el mapa de `ss_tareas`. Hoy solo devuelve `nombrecontacto`, que es el contacto o, si no hay, el cliente. Hay que añadir el nombre del cliente y el del contacto por separado. Los joins ya existen.

### PAN2-03 · Pantalla Agenda
- **Qué:**
  - **Tres pestañas: Día, Semana y Mes.** La pestaña Mes 🆕 *no está en la maqueta*. Cada una muestra **solo las tareas cuya fecha cae en el periodo que se está viendo**, con navegación al anterior y al siguiente.
  - **Las atrasadas solo se ven dentro de su periodo**, en su fecha original y con un **color diferente**. No se arrastran al periodo actual. Por ejemplo, si hoy es miércoles:
    - **Día (hoy):** solo las tareas de hoy. Las de hoy cuya hora ya ha pasado salen como atrasadas. Las atrasadas de ayer **no** salen: para verlas hay que ir al día de ayer.
    - **Semana (esta semana):** las tareas de lunes a domingo. Una atrasada del martes sí sale, en el martes. Una de la semana pasada no.
    - **Mes (este mes):** las tareas del mes, incluidas las atrasadas de días anteriores del mismo mes.
  - Se mantienen los bloques **Hoy / Mañana / Próximamente (30 días)** 🆕 *No está en la maqueta*.
  - **Historial de tareas completadas** 🆕 *No está en la maqueta*.
  - "+ Añadir a la agenda" abre PAN5-01.
- **Datos:** PAN2-01 con `desde` y `hasta` iguales al periodo visible y **sin** `conAtrasadas`. Para el historial, GET de `ss_tareas` con `completada = true`.
- **Backend:** ver PAN2-01 y PAN2-02.
- **UI:** a partir de `@olula/componentes/calendario` y COM-04.

### PAN2-04 · Google Calendar
- **Qué:** la sincronización de tareas con Google Calendar sigue funcionando.
- **Backend:** verificar que `crear/actualizar/borrar_tarea_google_calendar` (en el POST, PATCH y DELETE de `ss_tareas_api.py`) siguen funcionando con los campos nuevos (§17) y con la tarea única (PAN5-02).

---

## 9. Pantallas 3, 12 y 13 · Mapa y prospección

### PAN3-01 · Componente de mapa
- **Qué:** mapa con pines, popup y movimiento (pan y zoom) que recarga los clientes de la zona visible.
- **UI:** no hay componente de mapa moderno. Legacy usa Plotly + Mapbox (`@quimera/thirdparty`). Hay que integrar una librería y encapsularla en un componente reutilizable.
- **⚠️ Pendiente:** elegir librería y teselas (Leaflet o MapLibre; OSM o Mapbox; licencia y coste). Mientras tanto se puede montar el componente con una interfaz propia (pines, popup, centro, zoom, evento de movimiento) para cambiar la librería sin tocar las pantallas.

### PAN3-02 · Acción de prospección (backend)
- **Qué:** una sola acción para el mapa (pantalla 3), los filtros (pantalla 12) y los resultados (pantalla 13).
- **Backend:** **Acción nueva**, por ejemplo `ss_recomendaciones.get_clientes_mapa`. **No se modifica `get_direcciones_mapa`**: lo usa `/informe-mapa`, exige un cliente como centro, limita a 200 resultados, excluye a los clientes sin compras y devuelve HTML. Requisitos:
  - **Centro:** lat/lon (la posición del comercial, la capital elegida o el cliente buscado) y radio en km. Distancia con **haversine** sobre un bbox prefiltrado.
  - **Dirección:** solo la **de facturación** con `geo_estadogeo = 'OK'`. Las direcciones sin coordenadas no se geocodifican y no salen.
  - **Clientes sin compras:** incluidos.
  - **Clientes:** solo los asignados al comercial (`filtro_clientes_x_agente`).
  - **Campos por cliente:**
    - código, nombre, dirección, lat y lon;
    - **ventas de 12 meses**, con el criterio de ventas del progreso aplicado al cliente (todas sus ventas, no solo las del agente). Solo para el supervisor y los agentes asignados al cliente, principal y adicionales; para el resto, vacío;
    - **fecha del último pedido**;
    - **afinidad:** la de la subfamilia filtrada o, si no hay filtro, la máxima del cliente.
  - **Filtros:**
    - radio;
    - afinidad mínima;
    - última compra (por ejemplo "más de 12 meses");
    - ventas de 12 meses mínimas;
    - subfamilia a recomendar;
    - **artículos comprados** ("Más filtros").
  - **Total** de resultados, para el botón "Ver N clientes".
  - **Orden:** por afinidad o por **distancia**.

### PAN3-03 · Pantalla Mapa
- **Qué:**
  - buscador de cliente: al elegir un cliente, el mapa se centra en él; al moverse, se recargan los clientes de la zona;
  - popup con nombre, ventas de 12 meses, última compra, distancia y afinidad;
  - tarjeta con dirección, datos y **oportunidades** (subfamilias con afinidad, COM-05);
  - botones **Ver cliente** (PAN4-02) y **+ Añadir visita** (PAN5-01);
  - botón de filtros (pantalla 12).
- **Datos:** PAN3-02 y, para las oportunidades, `ss_recomendaciones.get_subfamilias_by_cliente`.
- **UI:** pantalla sobre PAN3-01.

### PAN3-04 · Distancia
- **Qué:** distancia en **línea recta** del comercial al cliente. Se muestra en el mapa, los resultados, las campañas y la agenda.
- **UI:** haversine en el frontend con la posición del navegador. Necesita permiso de geolocalización y HTTPS.

### PAN12-01 · Pantalla Filtros de prospección
- **Qué:**
  - **Zona:** un **selector de capitales de provincia**. Por defecto aparece **la capital de la provincia en la que está el agente** (la más cercana a su posición GPS). Si no hay permiso de ubicación, se usa la última elegida.
  - Radio, afinidad mínima, última compra, ventas de 12 meses mínimas y subfamilia a recomendar.
  - "Más filtros", con artículos comprados.
  - Botón "**Ver N clientes**", con el contador de PAN3-02 actualizado al cambiar los filtros.
- **Datos:** coordenadas de las capitales (lista fija en el frontend: 50 capitales más Ceuta y Melilla) y PAN3-02.
- **Backend:** ver PAN3-02. La zona no necesita geocodificación.
- **UI:** formulario de filtros.

### PAN13-01 · Pantalla Resultados en el mapa
- **Qué:** mapa más lista de los clientes encontrados, ordenable por **afinidad** o **distancia**. Cada cliente muestra afinidad (COM-05), distancia, ventas de 12 meses o última compra, y "+ Visita". Al pulsar un cliente se abre su ficha.
- **Datos:** PAN3-02.
- **UI:** lista y mapa.

---

## 10. Pantalla 4 · Clientes, contactos y ficha de cliente

### PAN4-01 · Listado de clientes y contactos
- **Qué:** la opción **Clientes** de la barra abre un listado con **dos pestañas, Clientes y Contactos**, cada una con su buscador. 🆕 *No está en la maqueta* (la pantalla 4 es solo la ficha). El buscador del mapa solo encuentra clientes.
- **Datos y backend:** Sin cambios.
  - Clientes: `clientes.dame_clientes` o `ss_recomendaciones.get_clientes`, ya filtrados por agente.
  - Contactos: `contactos.get_contactos_with_summary`.
- **UI:** maestro con pestañas.

### PAN4-02 · Ficha de cliente: cabecera y resumen
- **Qué:**
  - nombre, ciudad y acciones **Llamar, Email, WhatsApp y Cómo llegar**;
  - **Cliente activo:** ha comprado en los últimos X meses y no está de baja;
  - **Cliente desde:** fecha de alta o, si falta, la de su primera compra;
  - **Ventas de 12 meses:** importe neto facturado de **todas** las ventas del cliente. Solo lo ven el supervisor y los agentes asignados al cliente (principal y adicionales);
  - **Tratos abiertos:** contador;
  - **Última visita:** última tarea de tipo Cita completada, de cualquier comercial;
  - **Última compra:** fecha del **último pedido**.
- **Datos:** `clientes`, `dirclientes`, `facturascli` y `lineasfacturascli`, `pedidoscli`, `ss_tratos` y `ss_tareas`.
- **Backend:** **Acción nueva** de resumen por cliente que devuelva todo en una llamada:
  - parámetro de configuración nuevo para la X de "activo" (por ejemplo en `facturac_general`);
  - regla de visibilidad de los importes (principal, adicionales de `clientesagente` y supervisores).
- **UI:** cabecera (nombre, ciudad, estado "activo", "cliente desde" y botones de acción) y casillas con los datos del cliente: ventas de 12 meses, tratos abiertos, última visita y última compra.

### PAN4-03 · Aviso "Sin próxima acción"
- **Qué:** si el cliente no tiene ninguna tarea futura pendiente, se muestra el aviso con el botón **"Programar visita"** (PAN5-01).
- **Backend:** incluido en PAN4-02: contar las tareas futuras no completadas de los tratos del cliente, incluidas las tareas únicas.

### PAN4-04 · Oportunidades recomendadas
- **Qué:** subfamilias con su afinidad y nivel (COM-05) y botón **"Crear trato"** (PAN9-04).
- **Datos y backend:** Sin cambios: `ss_recomendaciones.get_subfamilias_by_cliente`, con la dirección de facturación.
- **UI:** lista.

### PAN4-05 · Pestañas de la ficha
- **Resumen:** PAN4-02 a PAN4-04.
- **Actividad:** las tareas con el cliente, pendientes y completadas, con COM-04.
  - **Backend: Ampliar** el GET de `ss_tareas` para filtrar por el cliente del trato (el mapa ya expone `codcliente`), más las tareas de sus incidencias.
- **Tratos:** los tratos del cliente, abiertos y cerrados.
  - **Backend:** Sin cambios (`get_tratos_pendiente_por_cliente` y `trato.get` filtrado por cliente).
- **Documentos:** presupuestos, pedidos y facturas del cliente, con descarga del PDF.
  - **Backend:** Sin cambios en lo básico (GET de presupuestos, pedidos y facturas por `codcliente`, PDF por Jasper). Hay que revisar que el control de acceso permita verlos a los agentes adicionales y a los supervisores.
- **UI:** pestañas.

### PAN4-06 · Ficha de contacto
- **Qué:** datos del contacto, cliente asociado, tratos y tareas. 🆕 *No está en la maqueta*.
- **Backend:** Sin cambios (acciones de contactos que usa hoy la vista legacy `ContactoMD`).
- **UI:** detalle.

### PAN4-07 · Nuevo contacto
- **Qué:** alta de contacto desde el botón + y desde la pestaña Contactos. 🆕 *No está en la maqueta*.
- **Backend:** Sin cambios (POST de contactos, como la vista legacy `NuevoContacto`).
- **UI:** formulario.

---

## 11. Pantallas 5, 6 y 7 · Crear, hacer y finalizar visitas

### PAN5-01 · Crear visita o tarea
- **Qué:**
  - cliente (buscador), tipo (Visita, Llamada, Email, Whatsapp; **no hay "Otro"**), fecha, hora y notas;
  - **Motivo:** lista desplegable editable por el administrador;
  - **Producto:** a elegir entre **artículo, familia o subfamilia**;
  - **Sugerencias:** subfamilias del cliente con afinidad **superior al 70 %**, con opción **"ver más"**;
  - si el cliente no tiene trato, se crea como **tarea única** (PAN5-02);
  - al guardar, la tarea queda programada. La visita se inicia después con "Iniciar visita" (PAN6-01).
- **Datos:** clientes, motivos, artículos, familias y subfamilias, y `get_subfamilias_by_cliente` para las sugerencias.
- **Backend:**
  - **Modelo:**
    - tabla nueva de motivos de tarea (por ejemplo `sh_motivostarea`: id, descripción, activo), con su mantenimiento en escritorio;
    - campos nuevos en `ss_tareas`: motivo y producto (ver §17).
  - **Ampliar** el POST y el PATCH de `ss_tareas` con esos campos.
- **UI:** formulario con selector de producto en tres niveles y sugerencias.

### PAN5-02 · Tarea única (visita a un cliente sin trato)
- **Qué:** se permite crear una tarea para un cliente sin trato. Internamente se crea un trato que tendrá **una sola tarea**. Se completa como cualquier otra: al ser la última del trato, **se pregunta cómo cerrarlo** (ganado o perdido con causa). No hay tareas sin cliente.
- **Backend:**
  - **Modelo (configuración):** tipo de trato "Tarea única" en `ss_tipostrato`, sin tarea inicial automática, identificado en `facturac_general` igual que el tipo farma.
  - **Acción nueva:** crea el trato y su tarea en una sola llamada.
- **UI:** en PAN5-01, crear sin trato ofrece la tarea única.

### PAN6-01 · Visita en curso
- **Qué:**
  - botón **"Iniciar visita"**: registra la hora y la **ubicación de inicio**, y la visita pasa a **en curso** (validado con RRHH y protección de datos);
  - **solo una visita en curso** por comercial; si intenta iniciar otra, se le avisa de la que tiene pendiente;
  - si no se finaliza, **se da por finalizada al pasar un día**;
  - **interlocutor:** opcional, elegido entre los contactos del cliente;
  - notas con **dictado por voz** (PAN7-02);
  - botón **"Finalizar"**, que abre PAN7-01.

  No hay campo de resultado.
- **Datos:** la tarea y los contactos del cliente.
- **Backend:**
  - **Modelo:** campos nuevos en `ss_tareas` (§17).
  - **Acción nueva** `iniciar_visita`: valida que no haya otra en curso del mismo agente y guarda el inicio.
  - **Cierre automático** de las visitas en curso de más de un día, con un proceso programado diario o cerrándolas al consultar.
  - **Dirección de inicio (opcional):** igual que la de fin, que hoy se calcula por un evento posterior.
- **UI:** estado "en curso" en COM-04, pantalla de visita en curso y aviso de visita pendiente, con `useMaquina`.

### PAN7-01 · Finalizar visita
- **Qué:**
  - hora de fin automática y **editable**, más la ubicación de fin (ya existe);
  - nota con dictado (PAN7-02);
  - **Siguiente paso:** **Enviar presupuesto**, **Crear pedido** o **Ninguno**. Las dos primeras usan **la misma lógica actual** que los botones "Crear presupuesto" y "Crear pedido" del trato;
  - "Generar siguiente tarea", como hoy;
  - si era la última tarea del trato (también en la tarea única), **se pregunta si el trato se ha ganado o perdido** (con causa), como hoy;
  - "Guardar y cerrar" vuelve a la Agenda.
- **Backend:** Sin cambios: `tarea.patch` (completada, fecha, hora, lat/lon de fin) y las acciones del trato `crear_presupuesto_trato` y `crear_pedido_trato`, con sus validaciones (por ejemplo, el tipo de trato que exige pedido).
- **UI:** rehacer en moderno el flujo de legacy (vistas `Tarea` y `EstadoTrato`), con `useMaquina`.

### PAN7-02 · Dictar nota
- **Qué:** botón de micrófono para dictar la nota en las pantallas 6 y 7.
- **Backend:** Sin cambios. Se guarda en `ss_tareas.nota`, que tiene un **máximo de 1000 caracteres**.
- **UI:** `@olula/lib/voz` (`useReconocimientoVoz`): añade el texto reconocido a la nota y avisa al acercarse al límite.

---

## 12. Pantalla 8 · Campañas del comercial

**Qué son:** cada comercial **crea sus propias campañas**, que son listas de **sus** clientes sobre los que hacer acciones. Cada cliente de la campaña tiene un trato.
- **Alcance:** solo los clientes asignados al comercial.
- **Exclusiones:** siempre se excluyen los clientes marcados con `sh_excluirclientecampanias`.
- **Qué no son:** no son las campañas de Marketing (emails, ActiveCampaign, Meta), que siguen en escritorio.

**Principio: no se modifica la lógica que ya existe en las campañas.** Los generadores, la publicación, los contadores y las vistas actuales de Marketing se quedan como están. Si algo no sirve tal cual, se **añade**: una función, una acción, un tipo de campaña o un campo nuevos. Lo existente se puede **reutilizar llamándolo** o tomarlo como referencia, pero no se cambia.

**Tres tipos.** Para cada uno, la lógica existente de `ss_campanias_api.py` que sirve de base y lo que hay que añadir:

| Tipo | Lógica existente de referencia | Qué hace hoy | Qué hay que añadir |
|---|---|---|---|
| **Clientes inactivos** (por artículo o subfamilia) | "Repetición", `generate_contactos_repeticion` | Selecciona los clientes que **han comprado** el artículo o la subfamilia en los últimos N días y guarda sus emails | **Añadir el criterio:** clientes que compraron el artículo o la subfamilia alguna vez y **no** en los últimos N días. Devuelve clientes, no emails, y no exige email |
| **Venta cruzada** | `dame_clientes_venta_cruzada`, `dame_clientes_venta_cruzada_por_facturacion` y `generar_trato_cliente_campania` | Clientes que compran unos productos (incluidos) y no otros (excluidos) en un periodo. Ya crea un trato por cliente | **Añadir la selección** para el comercial: la misma selección de clientes, limitada a sus clientes y sin los excluidos de campañas |
| **Afinidad a un producto** | "Captación", `generate_contactos_captacion` | Clientes con afinidad ≥ umbral a una subfamilia (`recomendacion_subfamilias`) o a artículos; guarda emails | **Añadir la selección:** el mismo criterio de afinidad, devolviendo clientes (no emails), con la dirección de facturación y limitado a los clientes del comercial |

### PAN8-01 · Modelo de campaña del comercial
- **Backend: Modelo** (solo adiciones en `ss_campanias`, en el `.mtd` de `fun_jsenar`):
  - **valor nuevo** de `cuentamarketing` para las campañas del comercial (por ejemplo `'comercial'`) o un campo nuevo de agente creador;
  - **tipo nuevo** de campaña "inactivos";
  - **campo nuevo** de **descripción u objetivo**, que escribe el comercial.
- **Vistas de Marketing:** la lista actual de campañas ya filtra por `cuentamarketing` (`'sanhigia'` o `'leadspacientes'`), así que con un valor nuevo las campañas del comercial **no aparecen** en ella y no hay que modificarla. Verificarlo al implementar.

### PAN8-02 · Crear campaña y generar sus tratos
- **Qué:** asistente **"Nueva campaña"** 🆕 *No está en la maqueta*: tipo, parámetros (días sin compra, artículos o subfamilia, productos incluidos y excluidos, umbral de afinidad), descripción, **vista previa de clientes** y confirmación.
- **Backend: Acciones nuevas**, sin modificar los generadores existentes:
  - **vista previa:** devuelve los clientes que entrarían en la campaña sin crear nada. Selección de **clientes** según el tipo (tabla anterior), limitada con `filtro_clientes_x_agente` y sin los excluidos;
  - **crear campaña:** guarda la campaña y crea **un trato por cliente**, reutilizando `generar_trato_cliente_campania`, asignado al comercial;
  - **publicar** los tratos directamente (`estadoasigagente = 'Publicado'`) desde la acción nueva, sin el paso de Marketing. No se usa ni se modifica `publicar_tratos_campania`, que además depende del email del contacto del trato y los tratos de cliente pueden no tenerlo.
- **UI:** asistente con `useMaquina`.

### PAN8-03 · Lista y detalle de campaña
- **Qué:**
  - **lista de campañas** del comercial 🆕 *No está en la maqueta*;
  - **detalle:** nombre, descripción y dos barras:
    - **Clientes trabajados:** clientes con el trato de la campaña **cerrado, ganado o perdido**, sobre el total;
    - **Clientes conseguidos:** clientes con el trato de la campaña **ganado**;
  - **pestañas:**
    - **Recomendados:** tratos pendientes de la campaña, ordenados por afinidad;
    - **Trabajados:** clientes con el trato cerrado;
    - **Resultados:** **ventas de la subfamilia a los clientes de la campaña desde su creación**;
  - en cada cliente: afinidad (COM-05), distancia (PAN3-04), ventas de 12 meses o última compra, y **"+ Visita"**, que crea la tarea en el trato de la campaña (PAN5-01);
  - al pulsar el cliente se abre su ficha.
- **Datos:** campañas del agente, tratos de la campaña, afinidad y ventas.
- **Backend: Acciones nuevas:**
  - **lista de campañas del agente:** las del comercial (`cuentamarketing` nuevo) creadas por él o visibles según `agentes_permitidos`;
  - **resumen de una campaña:**
    - totales, ganados y perdidos por agente;
    - datos de cada cliente: afinidad, ventas de 12 meses, último pedido, lat/lon;
    - ventas de la subfamilia desde la creación.

  `dame_datos_tratos_campania`, que cuenta totales, ganados y perdidos sin filtrar por agente, sirve de referencia pero **no se modifica**.
- **UI:** maestro y detalle.

---

## 13. Pantalla 9 · Tratos

### PAN9-01 · Lista de tratos
- **Qué:**
  - una sola lista con pestañas **"Mis tratos"** y **"Todos"**. "Todos" solo para quien puede ver a otros agentes (COM-02);
  - **"Mis tratos" muestra todos los tratos del agente:** aquellos en los que es **propietario directo** (`ss_tratos.codagente`) y aquellos en los que es **agente observador** (`ss_tratos.codagenteobservador`). Hoy solo los tratos de licencia farmacéutica llevan agente observador (su propietario es el agente FARMA), así que se reconocen por el chip **farma** y no hace falta una marca "observador";
  - **chip de procedencia** en cada trato, con el mismo criterio que la vista actual `/ss/tratos` (`MasterTratos`):
    - **mkt:** el trato tiene campaña (`idcampania`) de Marketing;
    - **farma:** el tipo de trato es el de licencia farmacéutica (`idtipotrato` = `facturac_general.idtipotratolicenciafarma`, que en el frontend legacy llega como `tratolicenciafarma` del usuario);
    - uno distinto para las **campañas del comercial**, por ejemplo "campaña".

    Más adelante el chip podría ser configurable según el origen del trato; de momento se mantiene este criterio;
  - **contadores** Abiertos, Ganados y Perdidos **del periodo filtrado**;
  - **filtros:** título, contacto, código de cliente, CIF/NIF del cliente, agente, fecha desde y fecha hasta (los mismos que la vista legacy `MasterTratos`);
  - cada trato muestra título (lo escribe el comercial), cliente o contacto, valor, estado y fecha. **No hay** probabilidad ni etapas.
- **Datos:** `trato.get` y `trato.get_totales`.
- **Backend:**
  - Sin cambios para la lista, los filtros y los contadores. `trato.get` y `get_totales` ya devuelven los tratos en los que el agente es propietario **o** observador (`codagente` u `codagenteobservador` dentro de sus agentes permitidos), siempre que **no** se pase `sinAgenteObservador`. La nueva UI no debe enviar ese parámetro. También aceptan los filtros genéricos, incluido el de fechas.
  - **Ampliar** el mapa del trato para que devuelva el tipo o el origen de la campaña. Hoy "mkt" se deduce de `idcampania`, y las campañas del comercial también lo tendrán.
- **UI:** maestro con pestañas, chips, filtros y contadores.
- **⚠️ Pendiente:** confirmar si se mantiene el filtro "con tareas atrasadas" (`conTareasAtrasadas`), ahora que el aviso de Hoy lleva a las tareas atrasadas. Mientras tanto, se puede dejar como un filtro más.

### PAN9-02 · Detalle del trato
- **Qué:** al pulsar un trato se abre su detalle **con sus tareas**. 🆕 *No está en la maqueta*. Es la funcionalidad actual con la nueva estética:
  - edición de datos, notas y tareas;
  - cierre como ganado o perdido con causa;
  - presupuesto o pedido y envío a la PDA;
  - datos de licencia farma.
- **Backend:** Sin cambios (acciones actuales de `ss_tratos`, `ss_tareas`, notas, `crear_presupuesto_trato` y `crear_pedido_trato`).
- **UI:** rehacer en moderno las vistas legacy `Trato` y `EstadoTrato`.

### PAN9-03 · Alta de trato
- **Qué:** el mismo formulario de alta actual, con la nueva estética. 🆕 *No está en la maqueta*.
- **Backend:** Sin cambios (POST de `ss_tratos`, con la asignación de agente y la tarea inicial según el tipo).
- **UI:** formulario (vista legacy `NuevoTrato` como referencia).

### PAN9-04 · Crear trato desde una oportunidad
- **Qué:** desde una oportunidad de la ficha de cliente (pantalla 4, "Crear trato") se abre el alta de trato precargada:
  - tipo **"Venta de producto"**;
  - **valor:** el precio del artículo según la **tarifa del cliente** si la tiene (igual que en un pedido) y si no el PVP, o **0** si es una familia;
  - el trato queda **ligado** al artículo, la familia o la subfamilia, para poder medir resultados;
  - el campo de texto `familias` del trato se rellena también con la familia, como en el resto de tratos.
- **Backend:**
  - **Modelo:** campos nuevos de producto ligado en `ss_tratos` (§17) y tipo "Venta de producto" configurado en `ss_tipostrato`.
  - **Ampliar** el POST de `ss_tratos` con esos campos.
  - Cálculo del precio por defecto reutilizando la lógica de precios de pedidos.
- **UI:** PAN9-03 precargado.

---

## 14. Pantalla 10 · Rendimiento

Se abre al pulsar la cifra de ventas en Hoy.

### PAN10-01 · Ventas del periodo
- **Qué:** selector de periodo (COM-03: uno o varios trimestres o fechas concretas), ventas, objetivo, % con COM-01 y comparación con el mismo periodo del año anterior.
- **Datos y backend:** `dame_kpi_progreso` con trimestres o `customDates`, con la ampliación de PAN1-02.
- **UI:** pantalla con COM-03 y COM-01.
- **⚠️ Pendiente:** el botón "Ver detalle" de la maqueta está en suspenso hasta que el cliente decida qué debe mostrar. Mientras tanto no se desarrolla.

### PAN10-02 · Gráfico de evolución de ventas
- **Qué:** barras con las **ventas por mes** del año seleccionado (las columnas de la maqueta son los 12 meses), comparadas con el **objetivo** y la **predicción**.
- **Datos:** `graficoHistoricoPrevision.get_historico_prevision`. Hoy devuelve series mensuales en **% acumulado del objetivo anual**: ventas, objetivo, predicción (con banda del 80 %) y las mismas series del total de empresa.
- **Backend:** **Ampliar** `get_historico_prevision` con un parámetro opcional que devuelva **importes mensuales en €**, con el criterio de ventas del progreso. La salida actual la usan el dashboard legacy y `/ss/historico/`.
- **UI:** gráfico con `recharts`.

### PAN10-03 · Ventas por familia
- **Qué:** la sección funciona **como el informe "Ventas por familia", añadiendo la comparación con el año anterior**. Una fila por familia, **ordenadas de mayor a menor importe de ventas** y desplegables a sus subfamilias (también de mayor a menor).
  - **Familias:**
    - importe del periodo;
    - **% conseguido sobre el objetivo** de la familia, con COM-01;
    - **% de variación** respecto al mismo periodo del año anterior.
  - **Subfamilias:** importe del periodo y % de variación, **sin % sobre objetivo**. Los objetivos de subfamilia de la previsión son en unidades y sirven para la comisión, no se usan aquí.
- **Datos:**
  - **Ventas:** con el criterio del informe "Ventas por familia" (`/informe-ventas-familia`, Jasper `i_sh_ventasfamilia`), con **todas las series**. Es la suma de `lineasfacturascli.pvptotal` (importe neto, sin IVA) de las facturas del agente por familia y subfamilia, sin filtro de "incluir en previsión" ni de series excluidas. Por eso su total puede ser mayor que "Ventas realizadas" (pantalla 1).
  - **Objetivo por familia (en euros)**, en este orden:
    1. **El objetivo de la previsión:** `sh_familiasbonificacion.objetivo`, en la pestaña Familias de cada previsión del agente (`sh_previsiones`, por trimestre), en el formulario de Previsiones de Eneboo. Para el periodo seleccionado se suman los objetivos de la familia en las previsiones del agente de ese periodo.
    2. **Si no está informado:** el **importe de ventas de esa familia en el mismo periodo del año anterior**, con el mismo criterio del informe.
    3. **Si tampoco hay ventas el año anterior:** no hay objetivo y el campo **% conseguido se deja vacío**.

    En el caso 2, el % conseguido coincide con la variación más 100 (por ejemplo, +12 % de variación = 112 % conseguido). Está **confirmado con el cliente**: se muestra igual que el resto, sin ninguna marca especial.
  - **Coherencia de los objetivos:** la suma de los objetivos por familia de una previsión debe ser igual al objetivo total del agente en ese trimestre. Hoy nada lo valida y se rellena a mano en el escritorio. Esta pantalla solo lee los objetivos, no los comprueba.
- **Backend: Acción nueva** que devuelva en JSON:
  - las ventas agregadas por familia y subfamilia, ordenadas por importe, con la consulta del informe (su `WHERE` y su filtro de agentes) sin serie;
  - el mismo cálculo para el mismo periodo del año anterior;
  - el objetivo de cada familia con la regla anterior.
- **UI:** lista desplegable. COM-01 en las familias con objetivo; en las subfamilias, solo importe y variación.
- **Antes de implementar:** comprobar en la base de datos que `sh_familiasbonificacion.objetivo` está relleno en las previsiones actuales, para saber cuántas familias usarán la previsión y cuántas el año anterior.

---

## 15. Pantalla 11 · Objetivo de nuevos clientes

Se abre al pulsar "Clientes nuevos" en Hoy.

### PAN11-01 · Clientes nuevos por familia y subfamilia
- **Qué:**
  - selector de **trimestres** (COM-03, sin fechas libres);
  - total de clientes nuevos conseguidos sobre el objetivo, con COM-01;
  - barras por familia y subfamilia;
  - **lista de los clientes nuevos** 🆕 *No está en la maqueta*.
- **Datos:** `dame_kpi_progreso` → `kpi_nuevos_clientes_familia` (líneas `sh_kpinuevosclientesfamilia` del registro `sh_kpiporagente`).
- **Backend:**
  - **Ampliar** `get_kpi_nuevos_clientes_familia`. Hoy usa siempre el registro de `sh_kpiporagente` que contiene la fecha de hoy. Hay que admitir los trimestres seleccionados y elegir los registros del agente que les corresponden. Si se combinan varios, se suman por línea los objetivos y lo alcanzado.
  - **Acción nueva** que liste **qué clientes** son nuevos por familia y subfamilia, con el mismo criterio del KPI. El KPI solo da contadores, y una misma venta cuenta en la fila de familia y en la de subfamilia.
- **UI:** pantalla con COM-03 y COM-01.

### PAN11-02 · Unidades por producto
- **Qué:** debajo de "Nuevos clientes por familia", el KPI "Unidades por producto" de los mismos trimestres, con COM-01. 🆕 *No está en la maqueta*.
- **Backend:** **Ampliar** `get_kpi_unidades_producto` con el mismo parámetro de trimestres que PAN11-01.
- **UI:** reutiliza el componente de PAN1-04.

### PAN11-03 · Ver clientes recomendados
- **Qué:** el botón "Ver clientes recomendados" muestra los recomendados para **todas las familias** del objetivo.
- **Backend:** **Ampliar** `ss_recomendaciones.get_clientes_by_subfamilia`, que hoy filtra por una sola subfamilia, para admitir una familia o varias subfamilias.
- **UI:** lista de clientes con afinidad (COM-05), reutilizable con PAN13-01.

---

## 16. Resumen de pendientes

| Tema | Desarrollo | Qué falta | Mientras tanto |
|---|---|---|---|
| Librería de mapas | PAN3-01 | Elegir librería y teselas | Componente con interfaz propia |
| "Ver detalle" de ventas | PAN10-01 | El cliente decidirá qué muestra | No se desarrolla |
| Filtro "con tareas atrasadas" en Tratos | PAN9-01 | Confirmar si se mantiene | Se deja como un filtro más |

---

## 17. Cambios de modelo de datos (en `fun_jsenar`, `.mtd` + `dbupdate`)

Conviene agruparlos en una sola actualización.

| Tabla | Cambio | Para |
|---|---|---|
| `ss_tareas` | Motivo (`idmotivo`) | PAN5-01 |
| `ss_tareas` | Producto: `referencia`, `codfamilia`, `codsubfamilia` (o tipo + código) | PAN5-01 |
| `ss_tareas` | Fecha y hora de inicio, latitud y longitud de inicio, dirección de inicio (opcional), indicador "en curso" | PAN6-01 |
| `ss_tareas` | Interlocutor (`codcontacto`) | PAN6-01 |
| `sh_motivostarea` (nueva) | id, descripción, activo, con mantenimiento en escritorio | PAN5-01 |
| `ss_tratos` | Producto ligado: `referencia`, `codfamilia`, `codsubfamilia` | PAN9-04 |
| `ss_campanias` | Añadir: valor nuevo de `cuentamarketing` (o agente creador), tipo "inactivos" y descripción u objetivo | PAN8-01 |
| `ss_tipostrato` (datos) | Tipos "Tarea única" y "Venta de producto" | PAN5-02, PAN9-04 |
| `facturac_general` | Identificador del tipo "Tarea única" y parámetro de meses para "cliente activo" | PAN5-02, PAN4-02 |

---

## 18. Acciones de backend nuevas o ampliadas (pinebooapi)

| Acción | Tipo | Para |
|---|---|---|
| Lista de agentes permitidos del usuario | Nueva | COM-02 |
| `dame_kpi_progreso`: devolver `goal`, `relative_goal` y `previous_year_sold` (y las fechas del periodo KPI si faltan) | Ampliar | PAN1-02, COM-01 |
| `ss_tareas.get_for_rango {desde, hasta, conAtrasadas}` | Nueva | PAN1-05, PAN2-03 |
| Mapa de `ss_tareas`: nombre de cliente y de contacto por separado; filtro por cliente | Ampliar | PAN2-02, PAN4-05 |
| POST y PATCH de `ss_tareas`: motivo, producto, interlocutor | Ampliar | PAN5-01, PAN6-01 |
| `ss_tareas.iniciar_visita` + cierre diario de visitas en curso | Nueva | PAN6-01 |
| Crear tarea única (trato + tarea) | Nueva | PAN5-02 |
| `ss_recomendaciones.get_clientes_mapa` (prospección) | Nueva | PAN3-02, PAN12-01, PAN13-01 |
| Resumen de la ficha de cliente | Nueva | PAN4-02, PAN4-03 |
| Mapa de `ss_tratos`: origen de la campaña | Ampliar | PAN9-01 |
| POST de `ss_tratos`: producto ligado y precio por tarifa del cliente | Ampliar | PAN9-04 |
| Campañas del comercial: vista previa, crear con tratos (y publicarlos), lista y resumen; sin modificar los generadores existentes | Nueva | PAN8-02, PAN8-03 |
| `get_historico_prevision`: importes mensuales en € (parámetro opcional) | Ampliar | PAN10-02 |
| Ventas por familia y subfamilia (periodo, año anterior y objetivo de la previsión o, si falta, ventas del año anterior) | Nueva | PAN10-03 |
| `get_kpi_nuevos_clientes_familia` y `get_kpi_unidades_producto`: trimestres seleccionados | Ampliar | PAN11-01, PAN11-02 |
| Clientes nuevos por familia y subfamilia (lista) | Nueva | PAN11-01 |
| `get_clientes_by_subfamilia`: familia o varias subfamilias | Ampliar | PAN11-03 |
