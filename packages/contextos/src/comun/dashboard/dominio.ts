import { pareceImporte } from "@olula/componentes/maestro/widgets/dominio.ts";
import { posicionLibre } from "@olula/componentes/rejilla/dominio.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { DIMENSIONES_GEOGRAFICAS } from "./geografia.ts";
import {
  ComponenteDashboard,
  ConsultaComponente,
  Dashboard,
  DefinicionTipoComponente,
  FormatoValor,
  Granularidad,
  GrupoAgregado,
  PropuestaComponente,
  PropuestaDashboard,
  RangoPeriodo,
  RespuestaAgregado,
  TipoComponente,
} from "./diseño.ts";
import { tComun } from "../i18n/index.ts";

export const MAX_COMPONENTES = 40;

/**
 * La rejilla del dashboard usa medias filas (36 px): así una tarjeta mide
 * lo mismo que los widgets del maestro (h = 2 → 88 px). Una «fila» de diseño son 2 unidades.
 */
export const ALTO_FILA_DASHBOARD = 36;

export const CATALOGO: DefinicionTipoComponente[] = [
  { tipo: "tarjeta", get nombre() { return tComun("dashboard.tarjeta"); }, get descripcion() { return tComun("dashboard.unValorYSuComparacionCon"); }, grupo: "Indicadores", w: 3, h: 2, disponible: true },
  { tipo: "objetivo", get nombre() { return tComun("dashboard.objetivo"); }, get descripcion() { return tComun("dashboard.valorFrenteAUnaMeta"); }, grupo: "Indicadores", w: 3, h: 2, disponible: true },
  { tipo: "temporal", get nombre() { return tComun("dashboard.temporal"); }, get descripcion() { return tComun("dashboard.evolucionPorDiaMesOAno"); }, grupo: "Gráficos", w: 8, h: 8, disponible: true },
  { tipo: "barras", get nombre() { return tComun("dashboard.barras"); }, get descripcion() { return tComun("dashboard.compararCategorias"); }, grupo: "Gráficos", w: 6, h: 8, disponible: true },
  { tipo: "circular", get nombre() { return tComun("dashboard.circular"); }, get descripcion() { return tComun("dashboard.repartoEntrePocasCategorias"); }, grupo: "Gráficos", w: 4, h: 8, disponible: true },
  { tipo: "embudo", get nombre() { return tComun("dashboard.embudo"); }, get descripcion() { return tComun("dashboard.presupuestoPedidoFactura"); }, grupo: "Gráficos", w: 4, h: 8, disponible: true },
  { tipo: "mapa", get nombre() { return tComun("dashboard.mapa"); }, get descripcion() { return tComun("dashboard.ventasYClientesPorProvinciaO"); }, grupo: "Gráficos", w: 6, h: 12, disponible: true },
  { tipo: "ranking", get nombre() { return tComun("dashboard.ranking"); }, get descripcion() { return tComun("dashboard.losPrimerosNClientesArticulos"); }, grupo: "Datos", w: 6, h: 8, disponible: true },
  { tipo: "tabla", get nombre() { return tComun("dashboard.tablaFiltrada"); }, get descripcion() { return tComun("dashboard.filasDeUnListadoConSu"); }, grupo: "Datos", w: 12, h: 8, disponible: true },
  { tipo: "tabla_resumen", get nombre() { return tComun("dashboard.tablaResumen"); }, get descripcion() { return tComun("dashboard.cruceDeDosDimensiones"); }, grupo: "Datos", w: 6, h: 8, disponible: false },
  { tipo: "avisos", get nombre() { return tComun("dashboard.avisos"); }, get descripcion() { return tComun("dashboard.umbralesQuePidenAtencion"); }, grupo: "Otros", w: 6, h: 6, disponible: false },
  { tipo: "pregunta_ia", get nombre() { return tComun("dashboard.preguntaALaIa"); }, get descripcion() { return tComun("dashboard.describeLoQueQuieresVer"); }, grupo: "Otros", w: 6, h: 8, disponible: true },
  { tipo: "accesos", get nombre() { return tComun("dashboard.accesosRapidos"); }, get descripcion() { return tComun("dashboard.enlacesAPantallas"); }, grupo: "Otros", w: 6, h: 4, disponible: false },
  { tipo: "texto", get nombre() { return tComun("dashboard.texto"); }, get descripcion() { return tComun("dashboard.unaNotaLibre"); }, grupo: "Otros", w: 4, h: 4, disponible: true },
];

export const definicionTipo = (tipo: TipoComponente): DefinicionTipoComponente =>
  CATALOGO.find((d) => d.tipo === tipo) as DefinicionTipoComponente;

/** Los que no consultan datos (sin consultas ni permisos). */
export const sinDatos = (tipo: TipoComponente) => tipo === "texto" || tipo === "accesos";

// ---------------------------------------------------------------------------
// Consultas
// ---------------------------------------------------------------------------

/** Query string de GET /comun/agregado/<recurso> para una consulta guardada. */
export const queryConsulta = (consulta: ConsultaComponente): string => {
  const parametros = new URLSearchParams();
  const { recurso: _recurso, filtros, limite, ...resto } = consulta;
  Object.entries(resto).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== "") {
      parametros.set(clave, String(valor));
    }
  });
  if (limite !== undefined) parametros.set("limite", String(limite));
  if (filtros && filtros.length > 0) parametros.set("filtros", JSON.stringify(filtros));
  const query = parametros.toString();
  return query ? `?${query}` : "";
};

/** `suma:total,conteo` → [`suma_total`, `conteo`]: claves de la respuesta. */
export const aliasMetricas = (metricas: string | undefined): string[] =>
  (metricas ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)
    .map((m) => m.replace(":", "_"));

export const campoMetrica = (metrica: string | undefined): string | undefined =>
  (metrica ?? "").split(",")[0]?.split(":")[1] || undefined;

/** `fecha:mes` → ["fecha", "mes"]; `cliente` → ["cliente", undefined]. */
export const leerAgrupacion = (
  agrupar: string | undefined
): [string | undefined, Granularidad | undefined] => {
  const [dimension, granularidad] = (agrupar ?? "").split(",")[0].split(":");
  return [dimension || undefined, (granularidad as Granularidad) || undefined];
};

export const leerPeriodo = (
  periodo: string | undefined
): [string | undefined, RangoPeriodo | undefined] => {
  const [dimension, rango] = (periodo ?? "").split(":");
  return [dimension || undefined, (rango as RangoPeriodo) || undefined];
};

/** Formato por defecto: importe si la métrica suma/media un campo que lo parece. */
export const formatoPorDefecto = (metricas: string | undefined): FormatoValor => {
  const campo = campoMetrica(metricas);
  const operacion = (metricas ?? "").split(":")[0];
  return campo && operacion !== "conteo_distinto" && pareceImporte(campo)
    ? "moneda"
    : "numero";
};

// ---------------------------------------------------------------------------
// Valores
// ---------------------------------------------------------------------------

export const formatearValor = (
  valor: number | null | undefined,
  formato: FormatoValor = "numero"
): string => {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  if (formato === "moneda") return formatearMoneda(valor, "EUR");
  return valor.toLocaleString("es-ES", { maximumFractionDigits: 2 });
};

/** Valor abreviado para ejes: 184.320 → «184k». */
export const formatearCorto = (valor: number): string => {
  const absoluto = Math.abs(valor);
  if (absoluto >= 1_000_000) return `${(valor / 1_000_000).toLocaleString("es-ES", { maximumFractionDigits: 1 })}M`;
  if (absoluto >= 1_000) return `${(valor / 1_000).toLocaleString("es-ES", { maximumFractionDigits: 0 })}k`;
  return valor.toLocaleString("es-ES", { maximumFractionDigits: 1 });
};

export type Variacion = { texto: string; positiva: boolean };

/** Variación porcentual frente al otro periodo; null si no se puede calcular. */
export const variacion = (
  actual: number | null | undefined,
  anterior: number | null | undefined
): Variacion | null => {
  if (actual == null || anterior == null || anterior === 0) return null;
  const porcentaje = ((actual - anterior) / Math.abs(anterior)) * 100;
  const signo = porcentaje > 0 ? "+" : "";
  return {
    texto: `${signo}${porcentaje.toLocaleString("es-ES", { maximumFractionDigits: 1 })} %`,
    positiva: porcentaje >= 0,
  };
};

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Etiqueta del eje para el inicio de un tramo (`2026-10-01`, mes → «oct 26»). */
export const etiquetaTramo = (iso: string, granularidad: Granularidad | undefined): string => {
  const [año, mes, dia] = iso.split("-").map(Number);
  if (!año || !mes) return iso;
  const añoCorto = String(año).slice(2);
  switch (granularidad) {
    case "año":
      return String(año);
    case "trimestre":
      return `T${Math.floor((mes - 1) / 3) + 1} ${añoCorto}`;
    case "mes":
      return `${MESES[mes - 1]} ${añoCorto}`;
    default:
      return `${dia} ${MESES[mes - 1]}`;
  }
};

export type PuntoSerie = { etiqueta: string; actual: number | null; anterior: number | null };

/**
 * Serie temporal con su comparación alineada por posición (el servidor devuelve un
 * tramo por cada día/mes… del periodo, también los vacíos, en los dos periodos).
 */
export const serieTemporal = (
  respuesta: RespuestaAgregado,
  consulta: ConsultaComponente
): PuntoSerie[] => {
  const [dimension, granularidad] = leerAgrupacion(consulta.agrupar);
  const [alias] = aliasMetricas(consulta.metricas);
  if (!dimension || !alias) return [];
  const anteriores = respuesta.comparacion?.grupos ?? [];
  return respuesta.grupos.map((grupo, i) => ({
    etiqueta: etiquetaTramo(String(grupo[dimension]), granularidad),
    actual: numero(grupo[alias]),
    anterior: anteriores[i] ? numero(anteriores[i][alias]) : null,
  }));
};

export type Categoria = { clave: string; etiqueta: string; valor: number };

/** Grupos de una dimensión con su nombre (`cliente_nombre`) si el servidor lo da. */
export const categorias = (
  respuesta: RespuestaAgregado,
  consulta: ConsultaComponente
): Categoria[] => {
  const [dimension] = leerAgrupacion(consulta.agrupar);
  const [alias] = aliasMetricas(consulta.metricas);
  if (!dimension || !alias) return [];
  return respuesta.grupos.map((grupo) => {
    const clave = grupo[dimension];
    const nombre = grupo[`${dimension}_nombre`];
    return {
      clave: String(clave ?? ""),
      etiqueta: textoCategoria(clave, nombre),
      valor: numero(grupo[alias]) ?? 0,
    };
  });
};

const textoCategoria = (clave: GrupoAgregado[string], nombre: GrupoAgregado[string]) => {
  if (clave === null || clave === undefined || clave === "") return tComun("dashboard.sinValor");
  if (clave === true) return tComun("dashboard.si");
  if (clave === false) return tComun("dashboard.no");
  return nombre ? String(nombre) : String(clave);
};

const numero = (valor: unknown): number | null =>
  typeof valor === "number" ? valor : valor == null ? null : Number(valor);

/** Circular legible: las N mayores y el resto sumado en «Otros». */
export const agruparResto = (lista: Categoria[], maximo = 6): Categoria[] => {
  if (lista.length <= maximo) return lista;
  const ordenadas = [...lista].sort((a, b) => b.valor - a.valor);
  const resto = ordenadas.slice(maximo - 1).reduce((suma, c) => suma + c.valor, 0);
  return [...ordenadas.slice(0, maximo - 1), { clave: "__otros", etiqueta: tComun("dashboard.otros"), valor: resto }];
};

// ---------------------------------------------------------------------------
// Componentes
// ---------------------------------------------------------------------------

/** Consulta con la que arranca el editor para un tipo y un recurso. */
export const consultaPorDefecto = (
  tipo: TipoComponente,
  recurso: string,
  medida: string | undefined,
  dimensionFecha: string | undefined
): ConsultaComponente => {
  const metricas = medida ? `suma:${medida}` : "conteo";
  const periodo = dimensionFecha ? `${dimensionFecha}:este_año` : undefined;
  switch (tipo) {
    case "tarjeta":
    case "objetivo":
      return {
        recurso,
        metricas,
        periodo: dimensionFecha ? `${dimensionFecha}:este_mes` : undefined,
        comparar: tipo === "tarjeta" && dimensionFecha ? "año_anterior" : undefined,
      };
    case "temporal":
      return {
        recurso,
        metricas,
        agrupar: dimensionFecha ? `${dimensionFecha}:mes` : undefined,
        periodo: dimensionFecha ? `${dimensionFecha}:ultimos_12_meses` : undefined,
        comparar: dimensionFecha ? "año_anterior" : undefined,
        limite: 100,
      };
    case "tabla":
      return { recurso, columnas: "", limite: 10 };
    case "mapa":
      return { recurso, metricas: metricasMapa(metricas), agrupar: "provincia", periodo, limite: 100 };
    default:
      return { recurso, metricas, periodo, limite: tipo === "circular" ? 20 : 10 };
  }
};

export const nuevoComponente = (
  tipo: TipoComponente,
  existentes: ComponenteDashboard[]
): ComponenteDashboard => {
  const { w, h, nombre } = definicionTipo(tipo);
  const ids = new Set(existentes.map((c) => c.id));
  let n = existentes.length + 1;
  while (ids.has(`c${n}`)) n++;
  return {
    id: `c${n}`,
    tipo,
    titulo: tipo === "texto" ? "" : nombre,
    ...posicionLibre(existentes, w, h),
    w,
    h,
    consultas: [],
    opciones: tipo === "texto" ? { texto: "" } : {},
  };
};

/** ¿Se puede guardar? Un componente con datos necesita qué medir y, si lo pide, por qué agrupar. */
export const problemaComponente = (componente: ComponenteDashboard): string | null => {
  if (sinDatos(componente.tipo)) return null;
  const [consulta] = componente.consultas;
  if (!consulta?.recurso) return tComun("dashboard.eligeDeDondeSalenLosDatos");
  if (componente.tipo === "embudo") {
    return componente.consultas.length >= 2 ? null : tComun("dashboard.eligeUnCircuitoConAlMenos");
  }
  if (componente.tipo === "tabla") {
    return consulta.columnas ? null : tComun("dashboard.eligeAlMenosUnaColumna");
  }
  if (!consulta.metricas) return tComun("dashboard.eligeQueMedir");
  const agrupa = ["temporal", "barras", "circular", "ranking"].includes(componente.tipo);
  if (agrupa && !consulta.agrupar) return tComun("dashboard.eligePorQueAgrupar");
  if (componente.tipo === "objetivo" && !componente.opciones.meta) return tComun("dashboard.indicaLaMeta");
  if (componente.tipo === "mapa" && !esGeografica(leerAgrupacion(consulta.agrupar)[0])) {
    return tComun("dashboard.eligeProvinciaOComunidad");
  }
  return null;
};

export const sustituirComponente = (
  componentes: ComponenteDashboard[],
  componente: ComponenteDashboard
): ComponenteDashboard[] =>
  componentes.some((c) => c.id === componente.id)
    ? componentes.map((c) => (c.id === componente.id ? componente : c))
    : [...componentes, componente];

export const RANGOS_PERIODO: { valor: RangoPeriodo; descripcion: string }[] = [
  { valor: "hoy", get descripcion() { return tComun("dashboard.hoy"); } },
  { valor: "ayer", get descripcion() { return tComun("dashboard.ayer"); } },
  { valor: "esta_semana", get descripcion() { return tComun("dashboard.estaSemana"); } },
  { valor: "semana_anterior", get descripcion() { return tComun("dashboard.semanaAnterior"); } },
  { valor: "este_mes", get descripcion() { return tComun("dashboard.esteMes"); } },
  { valor: "mes_anterior", get descripcion() { return tComun("dashboard.mesAnterior"); } },
  { valor: "este_trimestre", get descripcion() { return tComun("dashboard.esteTrimestre"); } },
  { valor: "trimestre_anterior", get descripcion() { return tComun("dashboard.trimestreAnterior"); } },
  { valor: "este_año", get descripcion() { return tComun("dashboard.esteAno"); } },
  { valor: "año_anterior", get descripcion() { return tComun("dashboard.anoAnterior"); } },
  { valor: "ultimos_7_dias", get descripcion() { return tComun("dashboard.ultimos7Dias"); } },
  { valor: "ultimos_30_dias", get descripcion() { return tComun("dashboard.ultimos30Dias"); } },
  { valor: "ultimos_90_dias", get descripcion() { return tComun("dashboard.ultimos90Dias"); } },
  { valor: "ultimos_12_meses", get descripcion() { return tComun("dashboard.ultimos12Meses"); } },
];

export const GRANULARIDADES: { valor: Granularidad; descripcion: string }[] = [
  { valor: "dia", get descripcion() { return tComun("dashboard.dia"); } },
  { valor: "semana", get descripcion() { return tComun("dashboard.semana"); } },
  { valor: "mes", get descripcion() { return tComun("dashboard.mes"); } },
  { valor: "trimestre", get descripcion() { return tComun("dashboard.trimestre"); } },
  { valor: "año", get descripcion() { return tComun("dashboard.ano"); } },
];

export const OPERACIONES: { valor: string; descripcion: string; conCampo: boolean }[] = [
  { valor: "suma", get descripcion() { return tComun("dashboard.sumaDe"); }, conCampo: true },
  { valor: "conteo", get descripcion() { return tComun("dashboard.numeroDeRegistros"); }, conCampo: false },
  { valor: "promedio", get descripcion() { return tComun("dashboard.mediaDe"); }, conCampo: true },
  { valor: "maximo", get descripcion() { return tComun("dashboard.maximoDe"); }, conCampo: true },
  { valor: "minimo", get descripcion() { return tComun("dashboard.minimoDe"); }, conCampo: true },
];

const ETIQUETAS_PIE: Record<string, string> = {
  get suma() { return tComun("dashboard.suma"); },
  get conteo() { return tComun("dashboard.recuento"); },
  get conteo_distinto() { return tComun("dashboard.distintos"); },
  get promedio() { return tComun("dashboard.media"); },
  get minimo() { return tComun("dashboard.minimo"); },
  get maximo() { return tComun("dashboard.maximo"); },
};

/** «Este año», «Últimos 12 meses»…: el periodo de la consulta, o vacío si no tiene. */
export const etiquetaPeriodo = (consulta: ConsultaComponente | undefined): string => {
  const [, rango] = leerPeriodo(consulta?.periodo);
  return RANGOS_PERIODO.find((r) => r.valor === rango)?.descripcion ?? "";
};

/**
 * Pie de una tarjeta, como los widgets del maestro: «Suma de total · Este mes».
 * La métrica siempre; el periodo, si la consulta lo tiene.
 */
export const pieTarjeta = (consulta: ConsultaComponente | undefined): string => {
  const primera = (consulta?.metricas ?? "").split(",")[0]?.trim() ?? "";
  const [op, campo] = primera.split(":");
  const etiquetaOp = ETIQUETAS_PIE[op] ?? op;
  const metrica = !op
    ? ""
    : !campo
      ? etiquetaOp || tComun("dashboard.recuento")
      : `${etiquetaOp} de ${campo === campo.toUpperCase() ? campo : campo.toLowerCase()}`;
  const periodo = etiquetaPeriodo(consulta);
  if (metrica && periodo) return `${metrica} · ${periodo}`;
  return metrica || periodo || "";
};

/**
 * Los que el usuario puede ver: todos los recursos de sus consultas están entre los
 * que le permite el servidor (lo mismo que hace el servidor con los guardados).
 */
export const componentesVisibles = (
  componentes: ComponenteDashboard[],
  recursosPermitidos: string[]
): ComponenteDashboard[] =>
  componentes.filter((c) => c.consultas.every((q) => recursosPermitidos.includes(q.recurso)));

/** Dashboard de módulo aún sin versión del usuario: el de código, sin id. */
export const dashboardPorDefecto = (
  clave: string,
  definicion: { nombre: string; componentes: ComponenteDashboard[] },
  recursosPermitidos: string[]
): Dashboard => ({
  id: "",
  nombre: definicion.nombre,
  clave,
  compartido: false,
  propietario: "",
  esPropio: true,
  actualizadoEn: "",
  componentes: componentesVisibles(definicion.componentes, recursosPermitidos),
  componentesOcultos: 0,
});

// ---------------------------------------------------------------------------
// Mapa
// ---------------------------------------------------------------------------

export const esGeografica = (dimension: string | undefined): boolean =>
  dimension !== undefined && dimension in DIMENSIONES_GEOGRAFICAS;

/** La métrica elegida más los clientes distintos, si el recurso tiene clientes. */
export const metricasMapa = (principal: string, conClientes = true): string => {
  const primera = principal.split(",")[0];
  return conClientes ? `${primera},conteo_distinto:cliente` : primera;
};

export type PuntoMapa = {
  codigo: string;
  nombre: string;
  centro: [number, number];
  valor: number;
  clientes: number | null;
};

export type DatosMapa = {
  puntos: PuntoMapa[];
  /** Lo que no se puede situar: sin provincia o fuera de España. */
  sinSituar: number;
};

/** Grupos por provincia o comunidad (código INE) con su posición en el mapa. */
export const datosMapa = (
  respuesta: RespuestaAgregado,
  consulta: ConsultaComponente
): DatosMapa => {
  const [dimension] = leerAgrupacion(consulta.agrupar);
  const lugares = DIMENSIONES_GEOGRAFICAS[dimension ?? ""] ?? {};
  const [alias, aliasClientes] = aliasMetricas(consulta.metricas);
  const puntos: PuntoMapa[] = [];
  let sinSituar = 0;
  respuesta.grupos.forEach((grupo) => {
    const valor = numero(grupo[alias]) ?? 0;
    const lugar = lugares[String(grupo[dimension ?? ""] ?? "")];
    if (!lugar) {
      sinSituar += valor;
      return;
    }
    puntos.push({
      codigo: String(grupo[dimension ?? ""]),
      nombre: lugar.nombre,
      centro: lugar.centro,
      valor,
      clientes: aliasClientes ? numero(grupo[aliasClientes]) : null,
    });
  });
  return { puntos: puntos.sort((a, b) => b.valor - a.valor), sinSituar };
};

/** Canarias queda lejos: el encuadre se ajusta a la península y Baleares. */
const enCanarias = (p: PuntoMapa) => p.centro[1] < 30;

export type Encuadre = {
  limites: [[number, number], [number, number]] | null;
  /** Zonas con datos que quedan fuera del encuadre (Canarias), para nombrarlas aparte. */
  fuera: PuntoMapa[];
};

/** Rectángulo que contiene los puntos (sin Canarias si hay otros). */
export const encuadreMapa = (puntos: PuntoMapa[]): Encuadre => {
  const peninsula = puntos.filter((p) => !enCanarias(p));
  const visibles = peninsula.length > 0 ? peninsula : puntos;
  if (visibles.length === 0) return { limites: null, fuera: [] };
  const lons = visibles.map((p) => p.centro[0]);
  const lats = visibles.map((p) => p.centro[1]);
  return {
    limites: [
      [Math.min(...lons), Math.min(...lats)],
      [Math.max(...lons), Math.max(...lats)],
    ],
    fuera: peninsula.length > 0 ? puntos.filter(enCanarias) : [],
  };
};

// ---------------------------------------------------------------------------
// Embudo
// ---------------------------------------------------------------------------

export const CIRCUITOS: Record<string, { nombre: string; pasos: { recurso: string; etiqueta: string }[] }> = {
  ventas: {
    nombre: "Ciclo de venta",
    pasos: [
      { recurso: "ventas.presupuesto", get etiqueta() { return tComun("dashboard.presupuestos"); } },
      { recurso: "ventas.pedido", get etiqueta() { return tComun("dashboard.pedidos"); } },
      { recurso: "ventas.albaran", get etiqueta() { return tComun("dashboard.albaranes"); } },
      { recurso: "ventas.factura", get etiqueta() { return tComun("dashboard.facturas"); } },
    ],
  },
  compras: {
    nombre: "Ciclo de compra",
    pasos: [
      { recurso: "compras.pedido", get etiqueta() { return tComun("dashboard.pedidos"); } },
      { recurso: "compras.albaran", get etiqueta() { return tComun("dashboard.albaranes"); } },
      { recurso: "compras.factura", get etiqueta() { return tComun("dashboard.facturas"); } },
    ],
  },
};

/**
 * Una consulta por paso del circuito con la misma métrica y periodo. Solo los pasos
 * que el usuario puede ver (un embudo sin presupuestos empieza en pedidos).
 */
export const consultasEmbudo = (
  circuito: string,
  metricas: string,
  rango: RangoPeriodo | undefined,
  recursosPermitidos: string[]
): ConsultaComponente[] =>
  (CIRCUITOS[circuito]?.pasos ?? [])
    .filter((p) => recursosPermitidos.includes(p.recurso))
    .map((p) => ({
      recurso: p.recurso,
      metricas,
      ...(rango ? { periodo: `fecha:${rango}` } : {}),
    }));

export type PasoEmbudo = {
  etiqueta: string;
  valor: number;
  /** Respecto al paso anterior (null en el primero o si el anterior es 0). */
  conversion: number | null;
  /** Ancho relativo al mayor, de 0 a 1. */
  proporcion: number;
};

export const pasosEmbudo = (
  respuestas: RespuestaAgregado[],
  consultas: ConsultaComponente[]
): PasoEmbudo[] => {
  const etiquetas = Object.fromEntries(
    Object.values(CIRCUITOS).flatMap((c) => c.pasos.map((p) => [p.recurso, p.etiqueta]))
  );
  const valores = consultas.map((consulta, i) => {
    const [alias] = aliasMetricas(consulta.metricas);
    return numero(respuestas[i]?.totales[alias]) ?? 0;
  });
  const maximo = Math.max(...valores, 0);
  return consultas.map((consulta, i) => ({
    etiqueta: etiquetas[consulta.recurso] ?? consulta.recurso,
    valor: valores[i],
    conversion: i > 0 && valores[i - 1] > 0 ? valores[i] / valores[i - 1] : null,
    proporcion: maximo > 0 ? valores[i] / maximo : 0,
  }));
};

// ---------------------------------------------------------------------------
// Pregunta a la IA
// ---------------------------------------------------------------------------

/** Tipos que pueden pintar la misma consulta (para cambiar el que propone la IA). */
export const alternativasTipo = (consulta: ConsultaComponente): TipoComponente[] => {
  if (consulta.columnas) return ["tabla"];
  const [dimension, granularidad] = leerAgrupacion(consulta.agrupar);
  if (!dimension) return ["tarjeta"];
  if (granularidad) return ["temporal"];
  if (esGeografica(dimension)) return ["mapa", "ranking", "barras"];
  return ["ranking", "barras", "circular"];
};

/**
 * El componente que sale de una propuesta, en el sitio del que se estaba creando: su
 * tamaño es el del tipo propuesto (sin salirse de la rejilla).
 */
export const componenteDesdePropuesta = (
  base: ComponenteDashboard,
  propuesta: PropuestaComponente,
  pregunta: string
): ComponenteDashboard => {
  const { w, h } = definicionTipo(propuesta.tipo);
  return {
    ...base,
    tipo: propuesta.tipo,
    titulo: propuesta.titulo,
    x: Math.min(base.x, 12 - w),
    w,
    h,
    consultas: [propuesta.consulta],
    opciones: { pregunta },
  };
};

export const cambiarTipo = (
  componente: ComponenteDashboard,
  tipo: TipoComponente
): ComponenteDashboard => {
  const { w, h } = definicionTipo(tipo);
  return { ...componente, tipo, w, h, x: Math.min(componente.x, 12 - w) };
};

/**
 * Componentes de un dashboard propuesto por la IA, colocados en orden de lectura en el
 * primer hueco libre: las tarjetas llenan la primera fila y los gráficos van debajo.
 */
export const componentesDesdePropuestaDashboard = (
  propuesta: PropuestaDashboard
): ComponenteDashboard[] =>
  propuesta.componentes.slice(0, MAX_COMPONENTES).reduce<ComponenteDashboard[]>(
    (colocados, { tipo, titulo, consulta }, i) => {
      const { w, h } = definicionTipo(tipo);
      return [
        ...colocados,
        {
          id: `c${i + 1}`,
          tipo,
          titulo,
          ...posicionLibre(colocados, w, h),
          w,
          h,
          consultas: [consulta],
          opciones: {},
        },
      ];
    },
    []
  );
