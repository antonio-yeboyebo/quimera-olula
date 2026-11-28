import { sinTexto } from "#/almacen/comun/dominio.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import {
    AccesosPasillo,
    CarasPasillo,
    NuevoPasillo,
    ParametrosGenerarUbicaciones,
    Pasillo,
} from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

export const carasPasillo: { valor: CarasPasillo; descripcion: string }[] = [
    { valor: "AMBAS", get descripcion() { return tAlmacen("pasillo.ambas"); } },
    { valor: "IZQUIERDA", get descripcion() { return tAlmacen("pasillo.izquierda"); } },
    { valor: "DERECHA", get descripcion() { return tAlmacen("pasillo.derecha"); } },
];

export const accesosPasillo: { valor: AccesosPasillo; descripcion: string }[] = [
    { valor: "AMBOS_EXTREMOS", get descripcion() { return tAlmacen("pasillo.ambosExtremos"); } },
    { valor: "FRENTE", get descripcion() { return tAlmacen("pasillo.soloPorElFrenteModulo1"); } },
    { valor: "FONDO", get descripcion() { return tAlmacen("pasillo.soloPorElFondoUltimoModulo"); } },
];

export const descripcionCaras = (caras: string): string =>
    carasPasillo.find((c) => c.valor === caras)?.descripcion ?? caras;

/** El antiguo UN_EXTREMO era el frente. */
export const normalizarAccesos = (accesos: string): AccesosPasillo =>
    accesos === "UN_EXTREMO" ? "FRENTE" : (accesos as AccesosPasillo);

export const descripcionAccesos = (accesos: string): string =>
    accesosPasillo.find((a) => a.valor === accesos)?.descripcion ?? accesos;

const esEntero = (n: number | null | undefined): n is number =>
    n !== null && n !== undefined && Number.isInteger(n);

/**
 * Módulos válidos de un pasillo con `modulos` módulos por cara:
 * AMBAS 1..2n, IZQUIERDA 1,3,..,2n-1 (impares), DERECHA 2,4,..,2n (pares).
 */
export const modulosValidosPasillo = (caras: CarasPasillo, modulos: number): number[] => {
    if (!esEntero(modulos) || modulos <= 0) return [];
    const todos = Array.from({ length: 2 * modulos }, (_, i) => i + 1);
    if (caras === "IZQUIERDA") return todos.filter((m) => m % 2 === 1);
    if (caras === "DERECHA") return todos.filter((m) => m % 2 === 0);
    return todos;
};

/** Cara deducida del número de módulo: impar a la izquierda, par a la derecha. */
export const caraDeModulo = (modulo: number): "IZQUIERDA" | "DERECHA" =>
    modulo % 2 === 1 ? "IZQUIERDA" : "DERECHA";

/** Devuelve `true` si es válido o el mensaje del primer error. */
export const validarPasillo = (m: Pick<NuevoPasillo, "codigo" | "orden" | "modulos">): string | true => {
    if (sinTexto(m.codigo)) return tAlmacen("pasillo.elCodigoEsObligatorio");
    if (m.codigo.length > 10) return tAlmacen("pasillo.elCodigoAdmiteComoMaximo10");
    if (!esEntero(m.orden) || m.orden < 0) return tAlmacen("pasillo.elOrdenDebeSerUnEntero");
    if (!esEntero(m.modulos) || m.modulos <= 0) return tAlmacen("pasillo.losModulosPorCaraDebenSer");
    return true;
};

/** Devuelve `true` si es válido o el mensaje del primer error. */
export const validarGenerarUbicaciones = (p: ParametrosGenerarUbicaciones): string | true => {
    if (!esEntero(p.nivelDesde) || p.nivelDesde < 0) return tAlmacen("pasillo.elNivelInicialDebeSerUn");
    if (!esEntero(p.nivelHasta) || p.nivelHasta < 0) return tAlmacen("pasillo.elNivelFinalDebeSerUn");
    if (p.nivelHasta < p.nivelDesde) return tAlmacen("pasillo.elNivelFinalNoPuedeSer");
    if (!esEntero(p.huecosPorNivel) || p.huecosPorNivel < 1) return tAlmacen("pasillo.losHuecosPorNivelDebenSer");
    const desde = p.moduloDesde;
    const hasta = p.moduloHasta;
    if (desde !== null && (!esEntero(desde) || desde <= 0)) return tAlmacen("pasillo.elModuloInicialDebeSerUn");
    if (hasta !== null && (!esEntero(hasta) || hasta <= 0)) return tAlmacen("pasillo.elModuloFinalDebeSerUn");
    if (desde !== null && hasta !== null && hasta < desde) return tAlmacen("pasillo.elModuloFinalNoPuedeSer");
    return true;
};

export const mensajeUbicacionesGeneradas = (creadas: number): string => {
    if (creadas === 0) return tAlmacen("pasillo.noSeHaCreadoNingunaUbicacion");
    if (creadas === 1) return tAlmacen("pasillo.seHaCreado1Ubicacion");
    return tAlmacen("pasillo.seHanCreadoCreadasUbicaciones", { creadas });
};

export const pasilloVacio = (): Pasillo => ({
    id: "",
    zonaId: "",
    zona: "",
    codigo: "",
    orden: 0,
    caras: "AMBAS",
    modulos: 1,
    accesos: "AMBOS_EXTREMOS",
});

/** Constante estable (no función) para el formulario de alta. */
export const nuevoPasilloVacio: NuevoPasillo = {
    codigo: "",
    orden: 0,
    caras: "AMBAS",
    modulos: 1,
    accesos: "AMBOS_EXTREMOS",
};

const camposPasillo = {
    codigo: { requerido: true },
    orden: { requerido: true, tipo: "entero" as const },
    caras: { requerido: true },
    modulos: { requerido: true, tipo: "entero" as const },
    accesos: { requerido: true },
};

export const metaNuevoPasillo: MetaModelo<NuevoPasillo> = {
    campos: camposPasillo,
    validacion: validarPasillo,
};

export const metaPasillo: MetaModelo<Pasillo> = {
    campos: camposPasillo,
    validacion: validarPasillo,
};

/** Constante estable para el formulario de generación. */
export const parametrosGenerarUbicacionesIniciales: ParametrosGenerarUbicaciones = {
    nivelDesde: 0,
    nivelHasta: 0,
    huecosPorNivel: 1,
    tipoUbicacionId: null,
    moduloDesde: null,
    moduloHasta: null,
};

export const metaGenerarUbicaciones: MetaModelo<ParametrosGenerarUbicaciones> = {
    campos: {
        nivelDesde: { requerido: true, tipo: "entero" },
        nivelHasta: { requerido: true, tipo: "entero" },
        huecosPorNivel: { requerido: true, tipo: "entero" },
        tipoUbicacionId: { requerido: false },
        moduloDesde: { requerido: false, tipo: "entero" },
        moduloHasta: { requerido: false, tipo: "entero" },
    },
    validacion: validarGenerarUbicaciones,
};
