import ApiUrls from "#/contabilidad/comun/urls.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    CambiosLibroDiario,
    CriterioOrden,
    DeleteLibroDiario,
    FilaLibroDiario,
    GetLibroDiario,
    GetListaLibroDiario,
    GetReportLibroDiario,
    GetResultadoLibroDiario,
    LibroDiario,
    LineaLibroDiario,
    NuevoLibroDiario,
    PatchLibroDiario,
    PeriodoResumenMensual,
    PostLibroDiario,
    ResultadoLibroDiario,
    SentidoOrden,
    TipoFilaLibroDiario,
} from "./diseño.ts";
import { ASCENDENTE, NO_ORDENAR } from "./dominio.ts";
import { tContabilidad } from "../i18n/index.ts";

const urls = new ApiUrls();
const baseUrl = urls.LIBRO_DIARIO;

interface RangoAsientosApi {
    todos: boolean;
    desde: number | null;
    hasta: number | null;
}

interface RangoSubcuentasApi {
    todas: boolean;
    desde: string | null;
    hasta: string | null;
}

interface OrdenApi {
    criterio: string;
    sentido: string;
}

export interface LibroDiarioApi {
    id: number;
    descripcion: string;
    tipo: string;
    ejercicio_id: string;
    fecha_desde: string | null;
    fecha_hasta: string | null;
    asientos: RangoAsientosApi;
    subcuentas: RangoSubcuentasApi;
    datos_iva: boolean;
    agrupar_meses: boolean;
    resumen_mensual: boolean;
    ordenes: OrdenApi[];
}

const numeroATexto = (valor: number | null): string =>
    valor === null || valor === undefined ? "" : String(valor);

const nivelDeOrden = (
    ordenes: OrdenApi[],
    nivel: number
): [CriterioOrden, SentidoOrden] => {
    const orden = ordenes[nivel];
    if (!orden) return [NO_ORDENAR, ASCENDENTE];
    return [
        orden.criterio as CriterioOrden,
        (orden.sentido as SentidoOrden) || ASCENDENTE,
    ];
};

export const libroDiarioDesdeApi = (api: LibroDiarioApi): LibroDiario => {
    const [orden1, tipoOrden1] = nivelDeOrden(api.ordenes, 0);
    const [orden2, tipoOrden2] = nivelDeOrden(api.ordenes, 1);
    const [orden3, tipoOrden3] = nivelDeOrden(api.ordenes, 2);

    return {
        id: String(api.id),
        descripcion: api.descripcion,
        tipo: api.tipo,
        ejercicioId: api.ejercicio_id,
        fechaDesde: api.fecha_desde ?? "",
        fechaHasta: api.fecha_hasta ?? "",
        todosAsientos: api.asientos.todos,
        asientoDesde: numeroATexto(api.asientos.desde),
        asientoHasta: numeroATexto(api.asientos.hasta),
        todasSubcuentas: api.subcuentas.todas,
        subcuentaDesde: api.subcuentas.desde ?? "",
        subcuentaHasta: api.subcuentas.hasta ?? "",
        datosIva: api.datos_iva,
        agruparMeses: api.agrupar_meses,
        resumenMensual: api.resumen_mensual,
        orden1,
        tipoOrden1,
        orden2,
        tipoOrden2,
        orden3,
        tipoOrden3,
    };
};

interface LineaLibroDiarioApi {
    partida_id: number;
    asiento_id: number;
    asiento_numero: number;
    fecha: string;
    concepto_asiento: string;
    codigo_subcuenta: string;
    descripcion_subcuenta?: string;
    concepto: string;
    documento?: string;
    debe: number;
    haber: number;
    base_imponible?: number;
    codigo_serie?: string | null;
    factura?: number | null;
    iva?: number;
    recargo?: number;
}

interface PeriodoResumenMensualApi {
    indice: number;
    titulo: string;
    lineas: {
        codigo_subcuenta: string;
        descripcion_subcuenta: string;
        debe: number;
        haber: number;
    }[];
    total_debe: number;
    total_haber: number;
    acumulado_debe: number;
    acumulado_haber: number;
}

export interface FilaLibroDiarioApi {
    tipo: TipoFilaLibroDiario;
    nivel: number;
    titulo: string;
    fecha?: string;
    asiento_numero?: number;
    documento?: string;
    codigo_subcuenta?: string;
    descripcion_subcuenta?: string;
    debe?: number;
    haber?: number;
    descuadre?: number;
    codigo_serie?: string | null;
    factura?: number | null;
    base_imponible?: number;
    iva?: number;
    recargo?: number;
}

export interface ResultadoLibroDiarioApi {
    filas?: FilaLibroDiarioApi[];
    datos: LineaLibroDiarioApi[];
    total: number;
    totales?: { debe: number; haber: number; descuadre: number };
    totales_mes?: {
        mes: string;
        debe: number;
        haber: number;
        descuadre: number;
    }[];
    resumen_mensual?: PeriodoResumenMensualApi[];
}

const fechaDesdeApi = (fecha: string): Date => new Date(`${fecha}T12:00:00`);

const opcional = (valor: number | undefined): number | null =>
    valor === undefined ? null : valor;

export const lineaLibroDiarioDesdeApi = (
    api: LineaLibroDiarioApi
): LineaLibroDiario => ({
    id: String(api.partida_id),
    partidaId: api.partida_id,
    asientoId: api.asiento_id,
    asientoNumero: api.asiento_numero,
    fecha: fechaDesdeApi(api.fecha),
    conceptoAsiento: api.concepto_asiento ?? "",
    codigoSubcuenta: api.codigo_subcuenta,
    descripcionSubcuenta: api.descripcion_subcuenta ?? "",
    concepto: api.concepto ?? "",
    documento: api.documento ?? "",
    debe: api.debe,
    haber: api.haber,
    baseImponible: opcional(api.base_imponible),
    codigoSerie: api.codigo_serie ?? null,
    factura: api.factura ?? null,
    iva: opcional(api.iva),
    recargo: opcional(api.recargo),
});

const periodoDesdeApi = (
    api: PeriodoResumenMensualApi
): PeriodoResumenMensual => ({
    indice: api.indice,
    titulo: api.titulo,
    lineas: api.lineas.map((l) => ({
        codigoSubcuenta: l.codigo_subcuenta,
        descripcionSubcuenta: l.descripcion_subcuenta,
        debe: l.debe,
        haber: l.haber,
    })),
    totalDebe: api.total_debe,
    totalHaber: api.total_haber,
    acumuladoDebe: api.acumulado_debe,
    acumuladoHaber: api.acumulado_haber,
});

export const filaLibroDiarioDesdeApi = (
    api: FilaLibroDiarioApi
): FilaLibroDiario => ({
    tipo: api.tipo,
    nivel: api.nivel,
    titulo: api.titulo ?? "",
    fecha: api.fecha ? fechaDesdeApi(api.fecha) : null,
    asientoNumero: api.asiento_numero ?? null,
    documento: api.documento ?? "",
    codigoSubcuenta: api.codigo_subcuenta ?? "",
    descripcionSubcuenta: api.descripcion_subcuenta ?? "",
    debe: opcional(api.debe),
    haber: opcional(api.haber),
    descuadre: opcional(api.descuadre),
    codigoSerie: api.codigo_serie ?? null,
    factura: api.factura ?? null,
    baseImponible: opcional(api.base_imponible),
    iva: opcional(api.iva),
    recargo: opcional(api.recargo),
});

export const resultadoDesdeApi = (
    api: ResultadoLibroDiarioApi
): ResultadoLibroDiario => ({
    filas: api.filas ? api.filas.map(filaLibroDiarioDesdeApi) : null,
    datos: api.datos.map(lineaLibroDiarioDesdeApi),
    total: api.total,
    totales: api.totales ?? null,
    totalesMes: api.totales_mes ?? [],
    resumenMensual: (api.resumen_mensual ?? []).map(periodoDesdeApi),
});

const textoANumero = (valor: string): number | null => {
    const limpio = (valor ?? "").trim();
    return limpio === "" ? null : Number(limpio);
};

const textoONulo = (valor: string): string | null => {
    const limpio = (valor ?? "").trim();
    return limpio === "" ? null : limpio;
};

type RangosYOrdenes = Pick<
    LibroDiario,
    | "todosAsientos"
    | "asientoDesde"
    | "asientoHasta"
    | "todasSubcuentas"
    | "subcuentaDesde"
    | "subcuentaHasta"
>;

const asientosAApi = (m: RangosYOrdenes): RangoAsientosApi => ({
    todos: m.todosAsientos,
    desde: m.todosAsientos ? null : textoANumero(m.asientoDesde),
    hasta: m.todosAsientos ? null : textoANumero(m.asientoHasta),
});

const subcuentasAApi = (m: RangosYOrdenes): RangoSubcuentasApi => ({
    todas: m.todasSubcuentas,
    desde: m.todasSubcuentas ? null : textoONulo(m.subcuentaDesde),
    hasta: m.todasSubcuentas ? null : textoONulo(m.subcuentaHasta),
});

/** Los niveles «No ordenar» no viajan: el backend los trata como huecos. */
export const ordenesAApi = (
    niveles: [CriterioOrden, SentidoOrden][]
): OrdenApi[] =>
    niveles
        .filter(([criterio]) => criterio && criterio !== NO_ORDENAR)
        .map(([criterio, sentido]) => ({
            criterio,
            sentido: sentido || ASCENDENTE,
        }));

export const nuevoLibroDiarioAApi = (nuevo: NuevoLibroDiario) => ({
    descripcion: nuevo.descripcion,
    ejercicio_id: nuevo.ejercicioId,
    fecha_desde: textoONulo(nuevo.fechaDesde),
    fecha_hasta: textoONulo(nuevo.fechaHasta),
    asientos: asientosAApi(nuevo),
    subcuentas: subcuentasAApi(nuevo),
    datos_iva: nuevo.datosIva,
    agrupar_meses: nuevo.agruparMeses,
    resumen_mensual: nuevo.resumenMensual,
    ordenes: ordenesAApi([
        [nuevo.orden1, nuevo.tipoOrden1],
        [nuevo.orden2, nuevo.tipoOrden2],
        [nuevo.orden3, nuevo.tipoOrden3],
    ]),
});

const TIENE_RANGO_ASIENTOS: (keyof CambiosLibroDiario)[] = [
    "todosAsientos",
    "asientoDesde",
    "asientoHasta",
];

const TIENE_RANGO_SUBCUENTAS: (keyof CambiosLibroDiario)[] = [
    "todasSubcuentas",
    "subcuentaDesde",
    "subcuentaHasta",
];

const TIENE_ORDENES: (keyof CambiosLibroDiario)[] = [
    "orden1",
    "tipoOrden1",
    "orden2",
    "tipoOrden2",
    "orden3",
    "tipoOrden3",
];

const alguno = (
    cambios: CambiosLibroDiario,
    claves: (keyof CambiosLibroDiario)[]
): boolean => claves.some((clave) => cambios[clave] !== undefined);

/**
 * Los rangos y los tres niveles de orden viajan completos aunque solo cambie
 * una pieza: la API los recibe como objeto, no campo a campo. Por eso
 * `guardarInforme` manda siempre el informe entero como referencia.
 */
export const cambiosLibroDiarioAApi = (
    cambios: CambiosLibroDiario,
    informe: LibroDiario
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
    if (cambios.datosIva !== undefined) api.datos_iva = cambios.datosIva;
    if (cambios.agruparMeses !== undefined)
        api.agrupar_meses = cambios.agruparMeses;
    if (cambios.resumenMensual !== undefined)
        api.resumen_mensual = cambios.resumenMensual;
    if (alguno(cambios, TIENE_RANGO_ASIENTOS))
        api.asientos = asientosAApi(informe);
    if (alguno(cambios, TIENE_RANGO_SUBCUENTAS))
        api.subcuentas = subcuentasAApi(informe);
    if (alguno(cambios, TIENE_ORDENES))
        api.ordenes = ordenesAApi([
            [informe.orden1, informe.tipoOrden1],
            [informe.orden2, informe.tipoOrden2],
            [informe.orden3, informe.tipoOrden3],
        ]);
    return api;
};

export const getListaLibroDiario: GetListaLibroDiario = async (criteria) =>
    RestAPI.getQuery<LibroDiario, LibroDiarioApi>(
        baseUrl,
        criteria,
        libroDiarioDesdeApi
    );

export const getLibroDiario: GetLibroDiario = async (id) =>
    RestAPI.getItem<LibroDiario, LibroDiarioApi>(
        `${baseUrl}/${id}`,
        libroDiarioDesdeApi
    );

export const getResultadoLibroDiario: GetResultadoLibroDiario = async (id) =>
    RestAPI.getItem<ResultadoLibroDiario, ResultadoLibroDiarioApi>(
        urls.LIBRO_DIARIO_DATOS(id),
        resultadoDesdeApi,
        tContabilidad("libro_diario.errorAlCalcularElLibroDiario")
    );

export const postLibroDiario: PostLibroDiario = async (nuevo) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevoLibroDiarioAApi(nuevo),
        tContabilidad("libro_diario.errorAlCrearElLibroDiario")
    );
    return String(respuesta.id);
};

export const patchLibroDiario: PatchLibroDiario = async (informe, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${informe.id}`,
        cambiosLibroDiarioAApi(cambios, informe),
        tContabilidad("libro_diario.errorAlGuardarElLibroDiario")
    );
};

export const deleteLibroDiario: DeleteLibroDiario = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tContabilidad("libro_diario.errorAlBorrarElLibroDiario"));
};

export const getReportLibroDiario: GetReportLibroDiario = async (id) =>
    RestAPI.blob(
        urls.LIBRO_DIARIO_REPORT(id),
        tContabilidad("libro_diario.errorAlDescargarElPdfDel")
    );
