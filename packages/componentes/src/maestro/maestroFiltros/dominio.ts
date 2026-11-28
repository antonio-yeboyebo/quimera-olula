import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { localeActual } from "@olula/lib/i18n/i18n.ts";
import { tLib } from "@olula/lib/i18n/textos.ts";
import { tComponentes } from "../../i18n/textos.ts";
import type { MetaCampoFiltro, MetaFiltro } from "./MaestroFiltrosActivoControlado.tsx";

/** Textos de los atajos de fecha (los mismos que ofrece QDateInterval), en el idioma activo. */
const ATAJOS_FECHA = {
  "@hoy": "hoy",
  "@ayer": "ayer",
  "@mañana": "manana",
  "@esta-semana": "estaSemana",
  "@semana-anterior": "semanaAnterior",
  "@semana-siguiente": "semanaSiguiente",
  "@este-mes": "esteMes",
  "@mes-anterior": "mesAnterior",
  "@mes-siguiente": "mesSiguiente",
  "@este-año": "esteAno",
  "@año-anterior": "anoAnterior",
  "@año-siguiente": "anoSiguiente",
} as const;

const atajoFecha = (valor: string): string | undefined => {
  const clave = ATAJOS_FECHA[valor as keyof typeof ATAJOS_FECHA];
  return clave ? tComponentes(`filtros.atajos.${clave}`) : undefined;
};

const nombreMes = (mes: number): string =>
  tComponentes(`filtros.meses.m${mes}` as `filtros.meses.m${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`);

const vacio = (v: unknown) => v === undefined || v === null || v === "" || Number.isNaN(v);

const fecha = (v: unknown): string | null => {
  if (vacio(v)) return null;
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString("es-ES"); // dd/mm/aaaa también en inglés (pendiente de decidir)
};

const numero = (v: unknown): string | null =>
  vacio(v) ? null : Number(v).toLocaleString(localeActual());

/** «desde–hasta», «≥ desde» o «≤ hasta»; null si no hay ninguno. */
const intervalo = (desde: string | null, hasta: string | null): string | null => {
  if (desde && hasta) return `${desde} – ${hasta}`;
  if (desde) return `≥ ${desde}`;
  if (hasta) return `≤ ${hasta}`;
  return null;
};

/**
 * Texto legible del valor de un filtro para su chip («Este año», «≥ 1.000»,
 * «Pendiente, Emitida»…). null si el campo no filtra nada.
 */
export const describirValorFiltro = (
  campo: MetaCampoFiltro,
  valor: unknown
): string | null => {
  if (vacio(valor)) return null;
  if (campo.describir) return campo.describir(valor);

  const tipo = campo.tipo as string | undefined;
  if (tipo === "intervalo_fechas") {
    if (Array.isArray(valor)) return intervalo(fecha(valor[0]), fecha(valor[1]));
    return atajoFecha(String(valor)) ?? fecha(valor);
  }
  if (tipo === "intervalo_numeros" && Array.isArray(valor)) {
    return intervalo(numero(valor[0]), numero(valor[1]));
  }
  if (tipo === "mes_año") {
    if (Array.isArray(valor)) return intervalo(fecha(valor[0]), fecha(valor[1]));
    const [anyo, mes] = String(valor).split("-").map(Number);
    return anyo && mes ? `${nombreMes(mes)} ${anyo}` : String(valor);
  }
  if (tipo === "multiseleccion") {
    const valores = Array.isArray(valor) ? valor.map(String) : [String(valor)];
    if (valores.length === 0) return null;
    return valores
      .map((v) => campo.opciones?.find((o) => o.valor === v)?.descripcion ?? v)
      .join(", ");
  }
  if (tipo === "checkbox") {
    return valor === true || valor === "true" ? tLib("si") : tLib("no");
  }
  if (tipo === "fecha") return fecha(valor);
  if (Array.isArray(valor)) return valor.filter((v) => !vacio(v)).join(" – ") || null;
  return String(valor);
};

export type ChipFiltro = {
  id: string;
  etiqueta: string;
  texto: string;
  /** Se puede quitar: no es un filtro fijo de la pantalla (filtroInicial). */
  quitable: boolean;
};

const campoApi = (meta: MetaFiltro, id: string) => meta[id]?.campo ?? id;

/** Un chip por campo con valor; los de filtroInicial se muestran pero no se quitan. */
export const chipsFiltro = (
  filtro: ClausulaFiltro[],
  filtroInicial: ClausulaFiltro[],
  meta: MetaFiltro,
  valores: Record<string, unknown>
): ChipFiltro[] => {
  const iniciales = new Set(filtroInicial.map((c) => JSON.stringify(c)));
  const usados = new Set(filtro.map(([campo]) => campo));

  return Object.values(meta).flatMap((campo) => {
    if (!usados.has(campoApi(meta, campo.id))) return [];
    const texto = describirValorFiltro(campo, valores[campo.id]);
    if (texto === null) return [];
    const clausulas = filtro.filter(([c]) => c === campoApi(meta, campo.id));
    return [{
      id: campo.id,
      etiqueta: campo.label,
      texto,
      quitable: clausulas.some((c) => !iniciales.has(JSON.stringify(c))),
    }];
  });
};

const ANCHOS = new Set(["intervalo_fechas", "mes_año", "multiseleccion"]);

/** Campo que ocupa las dos columnas del panel (fechas y casillas). */
export const campoAncho = (campo: MetaCampoFiltro) => ANCHOS.has(campo.tipo as string);

/** Orden del panel: primero las fechas (el filtro más usado), luego el resto tal cual. */
export const ordenarCamposPanel = (meta: MetaFiltro): MetaCampoFiltro[] => {
  const campos = Object.values(meta);
  const esFecha = (c: MetaCampoFiltro) =>
    ["intervalo_fechas", "mes_año", "fecha"].includes(c.tipo as string);
  return [...campos.filter(esFecha), ...campos.filter((c) => !esFecha(c))];
};

/** «nombreProveedor» → «nombre_proveedor» (nombres de campo de la API). */
export const camelASnake = (id: string) =>
  id.replace(/[A-Z]/g, (letra) => `_${letra.toLowerCase()}`);
