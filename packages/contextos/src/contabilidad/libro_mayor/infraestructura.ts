import ApiUrls from "#/contabilidad/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    BloqueLibroMayor,
    CabeceraLibroMayor,
    CambiosLibroMayor,
    CriterioOrdenMayor,
    DeleteLibroMayor,
    GetLibroMayor,
    GetListaLibroMayor,
    GetReportLibroMayor,
    GetResultadoLibroMayor,
    LibroMayor,
    LineaLibroMayor,
    NuevoLibroMayor,
    PatchLibroMayor,
    PostLibroMayor,
    ResultadoLibroMayor,
    SentidoOrden,
} from "./diseño.ts";
import { ASCENDENTE } from "./dominio.ts";
import { tContabilidad } from "../i18n/index.ts";

const urls = new ApiUrls();
const baseUrl = urls.LIBRO_MAYOR;

interface RangoSubcuentasApi {
    todas: boolean;
    desde: string | null;
    hasta: string | null;
}

interface OrdenApi {
    criterio: string;
    sentido: string;
}

export interface LibroMayorApi {
    id: number;
    descripcion: string;
    ejercicio_id: string;
    fecha_desde: string | null;
    fecha_hasta: string | null;
    subcuentas: RangoSubcuentasApi;
    saldo_inicial: boolean;
    excluir_partidas_cero: boolean;
    orden: OrdenApi;
}

export const libroMayorDesdeApi = (api: LibroMayorApi): LibroMayor => ({
    id: String(api.id),
    descripcion: api.descripcion,
    ejercicioId: api.ejercicio_id,
    fechaDesde: api.fecha_desde ?? "",
    fechaHasta: api.fecha_hasta ?? "",
    todasSubcuentas: api.subcuentas.todas,
    subcuentaDesde: api.subcuentas.desde ?? "",
    subcuentaHasta: api.subcuentas.hasta ?? "",
    saldoInicial: api.saldo_inicial,
    excluirPartidasCero: api.excluir_partidas_cero,
    orden: api.orden.criterio as CriterioOrdenMayor,
    tipoOrden: (api.orden.sentido as SentidoOrden) || ASCENDENTE,
});

interface CabeceraLibroMayorApi {
    subcuenta_id: number;
    codigo_subcuenta: string;
    descripcion_subcuenta: string;
    saldo_inicial: number;
    saldo_final: number;
}

interface LineaLibroMayorApi {
    partida_id: number;
    asiento_id: number;
    asiento_numero: number;
    fecha: string;
    concepto: string;
    debe: number;
    haber: number;
    saldo: number;
}

interface BloqueLibroMayorApi {
    cabecera: CabeceraLibroMayorApi;
    lineas: LineaLibroMayorApi[];
    total: number;
    total_debe: number;
    total_haber: number;
}

export interface ResultadoLibroMayorApi {
    cabecera: CabeceraLibroMayorApi;
    lineas: LineaLibroMayorApi[];
    total: number;
    subcuentas?: BloqueLibroMayorApi[];
}

const fechaDesdeApi = (fecha: string): Date => new Date(`${fecha}T12:00:00`);

const cabeceraDesdeApi = (
    api: CabeceraLibroMayorApi
): CabeceraLibroMayor => ({
    subcuentaId: api.subcuenta_id,
    codigoSubcuenta: api.codigo_subcuenta,
    descripcionSubcuenta: api.descripcion_subcuenta,
    saldoInicial: api.saldo_inicial,
    saldoFinal: api.saldo_final,
});

const lineaDesdeApi = (api: LineaLibroMayorApi): LineaLibroMayor => ({
    id: String(api.partida_id),
    partidaId: api.partida_id,
    asientoId: api.asiento_id,
    asientoNumero: api.asiento_numero,
    fecha: fechaDesdeApi(api.fecha),
    concepto: api.concepto ?? "",
    debe: api.debe,
    haber: api.haber,
    saldo: api.saldo,
});

const bloqueDesdeApi = (api: BloqueLibroMayorApi): BloqueLibroMayor => ({
    cabecera: cabeceraDesdeApi(api.cabecera),
    lineas: api.lineas.map(lineaDesdeApi),
    total: api.total,
    totalDebe: api.total_debe,
    totalHaber: api.total_haber,
});

/** La API repite la primera subcuenta fuera de `subcuentas` por compatibilidad
 * con el mayor de una sola cuenta; aquí solo interesan los bloques. */
export const resultadoDesdeApi = (
    api: ResultadoLibroMayorApi
): ResultadoLibroMayor => ({
    subcuentas: (api.subcuentas ?? []).map(bloqueDesdeApi),
});

const textoONulo = (valor: string): string | null => {
    const limpio = (valor ?? "").trim();
    return limpio === "" ? null : limpio;
};

type ConRangoSubcuentas = Pick<
    LibroMayor,
    "todasSubcuentas" | "subcuentaDesde" | "subcuentaHasta"
>;

const subcuentasAApi = (m: ConRangoSubcuentas): RangoSubcuentasApi => ({
    todas: m.todasSubcuentas,
    desde: m.todasSubcuentas ? null : textoONulo(m.subcuentaDesde),
    hasta: m.todasSubcuentas ? null : textoONulo(m.subcuentaHasta),
});

const ordenAApi = (
    criterio: CriterioOrdenMayor,
    sentido: SentidoOrden
): OrdenApi => ({ criterio, sentido: sentido || ASCENDENTE });

export const nuevoLibroMayorAApi = (nuevo: NuevoLibroMayor) => ({
    descripcion: nuevo.descripcion,
    ejercicio_id: nuevo.ejercicioId,
    fecha_desde: textoONulo(nuevo.fechaDesde),
    fecha_hasta: textoONulo(nuevo.fechaHasta),
    subcuentas: subcuentasAApi(nuevo),
    saldo_inicial: nuevo.saldoInicial,
    excluir_partidas_cero: nuevo.excluirPartidasCero,
    orden: ordenAApi(nuevo.orden, nuevo.tipoOrden),
});

const TIENE_RANGO: (keyof CambiosLibroMayor)[] = [
    "todasSubcuentas",
    "subcuentaDesde",
    "subcuentaHasta",
];

const TIENE_ORDEN: (keyof CambiosLibroMayor)[] = ["orden", "tipoOrden"];

const alguno = (
    cambios: CambiosLibroMayor,
    claves: (keyof CambiosLibroMayor)[]
): boolean => claves.some((clave) => cambios[clave] !== undefined);

/**
 * El rango y el orden viajan completos aunque solo cambie una pieza: la API
 * los recibe como objeto. Por eso se pasa también el informe de referencia.
 */
export const cambiosLibroMayorAApi = (
    cambios: CambiosLibroMayor,
    informe: LibroMayor
) => {
    const api: Record<string, unknown> = {};
    if (cambios.descripcion !== undefined)
        api.descripcion = cambios.descripcion;
    if (cambios.ejercicioId !== undefined)
        api.ejercicio_id = cambios.ejercicioId;
    if (cambios.fechaDesde !== undefined)
        api.fecha_desde = textoONulo(cambios.fechaDesde);
    if (cambios.fechaHasta !== undefined)
        api.fecha_hasta = textoONulo(cambios.fechaHasta);
    if (cambios.saldoInicial !== undefined)
        api.saldo_inicial = cambios.saldoInicial;
    if (cambios.excluirPartidasCero !== undefined)
        api.excluir_partidas_cero = cambios.excluirPartidasCero;
    if (alguno(cambios, TIENE_RANGO)) api.subcuentas = subcuentasAApi(informe);
    if (alguno(cambios, TIENE_ORDEN))
        api.orden = ordenAApi(informe.orden, informe.tipoOrden);
    return api;
};

export const getListaLibroMayor: GetListaLibroMayor = async (criteria) =>
    RestAPI.getQuery<LibroMayor, LibroMayorApi>(
        baseUrl,
        criteria,
        libroMayorDesdeApi
    );

export const getLibroMayor: GetLibroMayor = async (id) =>
    RestAPI.getItem<LibroMayor, LibroMayorApi>(
        `${baseUrl}/${id}`,
        libroMayorDesdeApi
    );

export const getResultadoLibroMayor: GetResultadoLibroMayor = async (id) =>
    RestAPI.getItem<ResultadoLibroMayor, ResultadoLibroMayorApi>(
        urls.LIBRO_MAYOR_DATOS(id),
        resultadoDesdeApi,
        tContabilidad("libro_mayor.errorAlCalcularElLibroMayor")
    );

export const postLibroMayor: PostLibroMayor = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevoLibroMayorAApi(nuevo),
        tContabilidad("libro_mayor.errorAlCrearElLibroMayor")
    );
    return String(respuesta.id);
};

export const patchLibroMayor: PatchLibroMayor = async (informe, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${informe.id}`,
        cambiosLibroMayorAApi(cambios, informe),
        tContabilidad("libro_mayor.errorAlGuardarElLibroMayor")
    );
};

export const deleteLibroMayor: DeleteLibroMayor = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tContabilidad("libro_mayor.errorAlBorrarElLibroMayor"));
};

export const getReportLibroMayor: GetReportLibroMayor = async (id) =>
    RestAPI.blob(
        urls.LIBRO_MAYOR_REPORT(id),
        tContabilidad("libro_mayor.errorAlDescargarElPdfDel")
    );
