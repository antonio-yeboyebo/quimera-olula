import { ClausulaFiltro, Filtro } from "@olula/lib/diseño.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import {
  CampoWidget,
  ConfigWidgets,
  DefinicionWidget,
  FormatoWidget,
  OperacionWidget,
  PuntoWidget,
  RecursoAgregable,
  TipoWidget,
} from "./diseño.ts";
import { tComponentes } from "../../i18n/textos.ts";

/** Parámetro `metricas` del servidor: `suma:total`, `conteo`... */
export const metricaWidget = (widget: DefinicionWidget): string =>
  widget.campo ? `${widget.operacion}:${widget.campo}` : widget.operacion;

/** Clave con la que el servidor devuelve la métrica en `totales`. */
export const aliasWidget = (widget: DefinicionWidget): string =>
  widget.campo ? `${widget.operacion}_${widget.campo}` : widget.operacion;

/** Filtro del listado más la condición propia del widget. */
export const filtroWidget = (
  filtroListado: Filtro | undefined,
  widget: DefinicionWidget
): Filtro => {
  const base = filtroListado ?? [];
  const extra = widget.filtro ?? [];
  if (extra.length === 0) return base;

  const esListaDeClausulas =
    Array.isArray(base) && (base.length === 0 || Array.isArray(base[0]));
  if (esListaDeClausulas) return [...(base as ClausulaFiltro[]), ...extra];

  return { and: [base, ...extra] } as Filtro;
};

/** Una petición por cada filtro distinto: los widgets que comparten filtro van juntos. */
export const agruparPorFiltro = (
  widgets: DefinicionWidget[]
): DefinicionWidget[][] => {
  const grupos = new Map<string, DefinicionWidget[]>();
  widgets.forEach((widget) => {
    const clave = JSON.stringify(widget.filtro ?? []);
    grupos.set(clave, [...(grupos.get(clave) ?? []), widget]);
  });
  return [...grupos.values()];
};

const pies: Record<OperacionWidget, string> = {
  get suma() { return tComponentes("ui.maestro.suma"); },
  get conteo() { return tComponentes("ui.maestro.recuento"); },
  get promedio() { return tComponentes("ui.maestro.media"); },
  get minimo() { return tComponentes("ui.maestro.minimo"); },
  get maximo() { return tComponentes("ui.maestro.maximo"); },
};

export const pieWidget = (
  widget: DefinicionWidget,
  campos: CampoWidget[] = []
): string => {
  if (widget.pie) return widget.pie;
  if (!widget.campo) return pies[widget.operacion];
  const etiqueta =
    campos.find((campo) => campo.id === widget.campo)?.etiqueta ?? widget.campo;
  // En minúscula salvo siglas (IVA, IRPF...)
  const enFrase =
    etiqueta === etiqueta.toUpperCase() ? etiqueta : etiqueta.toLowerCase();
  return `${pies[widget.operacion]} de ${enFrase}`;
};

export const operacionesWidget: {
  valor: OperacionWidget;
  descripcion: string;
}[] = [
  { valor: "suma", get descripcion() { return tComponentes("ui.maestro.suma"); } },
  { valor: "promedio", get descripcion() { return tComponentes("ui.maestro.media"); } },
  { valor: "conteo", get descripcion() { return tComponentes("ui.maestro.recuento"); } },
  { valor: "maximo", get descripcion() { return tComponentes("ui.maestro.maximo"); } },
  { valor: "minimo", get descripcion() { return tComponentes("ui.maestro.minimo"); } },
];

export const formatosWidget: { valor: FormatoWidget; descripcion: string }[] = [
  { valor: "moneda", get descripcion() { return tComponentes("ui.maestro.importe"); } },
  { valor: "numero", get descripcion() { return tComponentes("ui.maestro.numero"); } },
];

/** Widget nuevo a partir de lo elegido en el panel de personalización. */
export const nuevoWidget = (
  titulo: string,
  operacion: OperacionWidget,
  campo: CampoWidget | undefined,
  existentes: DefinicionWidget[],
  formato?: FormatoWidget,
  compacto: Pick<DefinicionWidget, "tipo" | "agrupar" | "meta"> = {}
): DefinicionWidget => {
  const base = `${operacion}_${campo?.id ?? "registros"}`;
  let id = base;
  for (let n = 2; existentes.some((w) => w.id === id); n++) id = `${base}_${n}`;
  return {
    id,
    titulo: titulo.trim(),
    operacion,
    ...(operacion === "conteo" ? {} : { campo: campo?.id }),
    formato:
      operacion === "conteo"
        ? "numero"
        : (formato ?? campo?.formato ?? "numero"),
    ...(compacto.tipo && compacto.tipo !== "tarjeta" ? { tipo: compacto.tipo } : {}),
    ...(compacto.agrupar ? { agrupar: compacto.agrupar } : {}),
    ...(compacto.tipo === "objetivo" && compacto.meta ? { meta: compacto.meta } : {}),
  };
};

export const tiposWidget: { valor: TipoWidget; descripcion: string }[] = [
  { valor: "tarjeta", get descripcion() { return tComponentes("ui.maestro.tarjetaUnValor"); } },
  { valor: "temporal", get descripcion() { return tComponentes("ui.maestro.evolucionPorMeses"); } },
  { valor: "circular", get descripcion() { return tComponentes("ui.maestro.repartoAnillo"); } },
  { valor: "ranking", get descripcion() { return tComponentes("ui.maestro.los3Primeros"); } },
  { valor: "objetivo", get descripcion() { return tComponentes("ui.maestro.objetivoBarraDeProgreso"); } },
];

export const esAgrupado = (widget: DefinicionWidget): boolean =>
  ["temporal", "circular", "ranking"].includes(widget.tipo ?? "tarjeta") &&
  Boolean(widget.agrupar);

/**
 * Parámetros de agrupación para un widget agrupado (además de metricas y el filtro del
 * listado): los 12 meses más recientes del temporal, las 6 mayores del anillo (el resto
 * se ve como «Otros» con el total) y las 3 primeras del ranking.
 */
export const agrupacionWidget = (widget: DefinicionWidget): string => {
  const alias = aliasWidget(widget);
  const parametros =
    widget.tipo === "temporal"
      ? { agrupar: `${widget.agrupar}:mes`, orden: `${widget.agrupar}:desc`, limite: "12" }
      : { agrupar: widget.agrupar ?? "", orden: `${alias}:desc`, limite: widget.tipo === "ranking" ? "3" : "6" };
  return new URLSearchParams(parametros).toString();
};

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const MESES_TEMPORAL = 12;

const etiquetaMes = (año: number, mes: number) => `${MESES[mes - 1]} ${String(año).slice(2)}`;

/**
 * Meses seguidos, sin saltarse los vacíos (a 0): hasta 12 que acaban en el último mes con
 * datos del filtro. El servidor da los 12 más recientes CON datos, así que dentro de esa
 * ventana no falta ninguno; si hay menos, la ventana empieza en el primero que haya.
 */
const mesesSeguidos = (puntos: PuntoWidget[]): PuntoWidget[] => {
  const mesDe = (clave: string) => {
    const [año, mes] = clave.split("-").map(Number);
    return año * 12 + (mes - 1);
  };
  const validos = puntos.filter((p) => !Number.isNaN(mesDe(p.clave)));
  if (validos.length === 0) return puntos;
  const porMes = new Map(validos.map((p) => [mesDe(p.clave), p]));
  const ultimo = mesDe(validos[validos.length - 1].clave);
  const primero = Math.max(mesDe(validos[0].clave), ultimo - (MESES_TEMPORAL - 1));
  const serie: PuntoWidget[] = [];
  for (let n = primero; n <= ultimo; n++) {
    const año = Math.floor(n / 12);
    const mes = (n % 12) + 1;
    serie.push(
      porMes.get(n) ?? {
        clave: `${año}-${String(mes).padStart(2, "0")}-01`,
        etiqueta: etiquetaMes(año, mes),
        valor: 0,
      }
    );
  }
  return serie;
};

/** Grupos del servidor → puntos: el temporal en meses seguidos, en orden cronológico. */
export const puntosWidget = (
  widget: DefinicionWidget,
  grupos: Record<string, unknown>[]
): PuntoWidget[] => {
  const dimension = widget.agrupar ?? "";
  const alias = aliasWidget(widget);
  const puntos = grupos.map((grupo) => {
    const clave = String(grupo[dimension] ?? "");
    const nombre = grupo[`${dimension}_nombre`];
    const [año, mes] = clave.split("-").map(Number);
    const etiqueta =
      widget.tipo === "temporal" && año && mes
        ? etiquetaMes(año, mes)
        : nombre
          ? String(nombre)
          : clave || tComponentes("ui.maestro.sinValor");
    return { clave, etiqueta, valor: Number(grupo[alias] ?? 0) };
  });
  return widget.tipo === "temporal" ? mesesSeguidos(puntos.reverse()) : puntos;
};

export const MAX_WIDGETS = 8;

/**
 * Recurso agregable del maestro de una pantalla. Varios recursos pueden compartir
 * pantalla (p. ej. las líneas): se prefiere el que se llama como la ruta
 * (`/ventas/factura` → `ventas.factura`) y si no, el primero que no sea de líneas.
 */
export const recursoParaRuta = (
  recursos: RecursoAgregable[],
  ruta: string
): RecursoAgregable | undefined => {
  const candidatos = recursos.filter(
    (r) => ruta === r.ruta || ruta.startsWith(`${r.ruta}/`)
  );
  const homonimo = candidatos.find(
    (r) => r.id === r.ruta.replace(/^\//, "").replace(/\//g, ".")
  );
  return homonimo ?? candidatos.find((r) => !r.id.endsWith(".linea"));
};

/** Heurística por el nombre de la medida: ¿es un importe (se formatea como moneda)? */
export const pareceImporte = (id: string) =>
  /total|neto|importe|saldo|precio|pvp|coste|cobrad|pagad|pendiente/i.test(id);

const enMayuscula = (texto: string) =>
  texto.charAt(0).toUpperCase() + texto.slice(1);

/**
 * Configuración para un maestro que no define widgets propios: sin widgets por
 * defecto (los crea el usuario) y con las medidas que publica el servidor.
 */
export const configDesdeRecurso = (
  recurso: RecursoAgregable
): ConfigWidgets => ({
  recurso: recurso.id,
  // Las descripciones del registro son para el asistente: "Clientes (una fila
  // por cliente) — cuántos hay por…" → "Clientes".
  titulo: enMayuscula(
    recurso.descripcion.split(/\s*[(—]/)[0].replace(/\.$/, "")
  ),
  widgets: [],
  campos: recurso.medidas.map((medida) => ({
    id: medida.id,
    etiqueta: enMayuscula(medida.descripcion),
    formato: pareceImporte(medida.id) ? "moneda" : "numero",
  })),
});

export const formatearValorWidget = (
  valor: number | null | undefined,
  widget: DefinicionWidget
): string => {
  if (valor === null || valor === undefined) return "—";
  if (widget.formato === "moneda") return formatearMoneda(valor, "EUR");
  return valor.toLocaleString("es-ES", { maximumFractionDigits: 2 });
};

const AGRUPACIONES_PREFERIDAS = [
  "agente", "cliente", "proveedor", "estado", "serie", "forma_pago", "almacen",
  "familia", "comunidad", "provincia",
];

/**
 * Dimensiones por las que tiene sentido agrupar un reparto o un ranking: sin ids, sin el
 * código del propio documento (cada uno es único) ni el nombre copiado que acompaña a un
 * código (ya sale como etiqueta); primero las más útiles.
 */
export const dimensionesAgrupables = (
  dimensiones: NonNullable<RecursoAgregable["dimensiones"]>,
  recursoId: string
): NonNullable<RecursoAgregable["dimensiones"]> => {
  const documento = recursoId.split(".")[1];
  const ids = new Set(dimensiones.map((d) => d.id));
  const posicion = (id: string) => {
    const i = AGRUPACIONES_PREFERIDAS.indexOf(id);
    return i === -1 ? AGRUPACIONES_PREFERIDAS.length : i;
  };
  return dimensiones
    .filter(
      (d) =>
        d.tipo !== "fecha" &&
        d.tipo !== "numero" &&
        d.id !== documento &&
        !(d.id.startsWith("nombre_") && ids.has(d.id.replace("nombre_", "")))
    )
    .sort((a, b) => posicion(a.id) - posicion(b.id));
};
