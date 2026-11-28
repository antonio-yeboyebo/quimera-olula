import ApiUrls from "#/contabilidad/comun/urls.ts";
import {
    FiltroIvaApi,
    PresentacionIvaApi,
    filtroAApi,
    filtroDesdeApi,
    presentacionAApi,
    presentacionDesdeApi,
    resultadoLibroIvaDesdeApi,
    ResultadoLibroIva,
    ResultadoLibroIvaApi,
} from "#/contabilidad/comun/librosIva.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    CambiosLibroFacturasRecibidas,
    DeleteLibroFacturasRecibidas,
    GetLibroFacturasRecibidas,
    GetListaLibroFacturasRecibidas,
    GetReportLibroFacturasRecibidas,
    GetResultadoLibroFacturasRecibidas,
    LibroFacturasRecibidas,
    NuevoLibroFacturasRecibidas,
    PatchLibroFacturasRecibidas,
    PostLibroFacturasRecibidas,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

const urls = new ApiUrls();
const baseUrl = urls.LIBRO_FACTURAS_RECIBIDAS;

export interface LibroFacturasRecibidasApi {
    id: number;
    descripcion: string;
    ejercicio_id: string;
    fecha_desde: string | null;
    fecha_hasta: string | null;
    filtro: FiltroIvaApi;
    presentacion: PresentacionIvaApi;
    codigo_serie: string | null;
}

export const libroFacturasRecibidasDesdeApi = (
    api: LibroFacturasRecibidasApi
): LibroFacturasRecibidas => ({
    id: String(api.id),
    descripcion: api.descripcion,
    ejercicioId: api.ejercicio_id,
    fechaDesde: api.fecha_desde ?? "",
    fechaHasta: api.fecha_hasta ?? "",
    codigoSerie: api.codigo_serie ?? "",
    ...filtroDesdeApi(api.filtro),
    ...presentacionDesdeApi(api.presentacion),
});

const textoONulo = (valor: string): string | null => {
    const limpio = (valor ?? "").trim();
    return limpio === "" ? null : limpio;
};

export const nuevoLibroFacturasRecibidasAApi = (
    nuevo: NuevoLibroFacturasRecibidas
) => ({
    descripcion: nuevo.descripcion,
    ejercicio_id: nuevo.ejercicioId,
    fecha_desde: textoONulo(nuevo.fechaDesde),
    fecha_hasta: textoONulo(nuevo.fechaHasta),
    filtro: filtroAApi(nuevo),
    presentacion: presentacionAApi(nuevo),
    codigo_serie: textoONulo(nuevo.codigoSerie),
});

const CAMPOS_FILTRO: (keyof CambiosLibroFacturasRecibidas)[] = [
    "todos",
    "porcentaje",
    "conIva",
];

const CAMPOS_PRESENTACION: (keyof CambiosLibroFacturasRecibidas)[] = [
    "mostrarTotalFactura",
    "mostrarNif",
    "mostrarDocumento",
    "mostrarAsiento",
    "numeracionAutomatica",
    "numeroDesde",
];

const alguno = (
    cambios: CambiosLibroFacturasRecibidas,
    claves: (keyof CambiosLibroFacturasRecibidas)[]
): boolean => claves.some((clave) => cambios[clave] !== undefined);

/**
 * El filtro y la presentación viajan completos aunque solo cambie una pieza:
 * la API los recibe como objeto. Por eso se pasa el informe de referencia.
 */
export const cambiosLibroFacturasRecibidasAApi = (
    cambios: CambiosLibroFacturasRecibidas,
    informe: LibroFacturasRecibidas
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
    if (alguno(cambios, CAMPOS_FILTRO)) api.filtro = filtroAApi(informe);
    if (alguno(cambios, CAMPOS_PRESENTACION))
        api.presentacion = presentacionAApi(informe);
    if (cambios.codigoSerie !== undefined)
        api.codigo_serie = textoONulo(cambios.codigoSerie);
    return api;
};

export const getListaLibroFacturasRecibidas: GetListaLibroFacturasRecibidas =
    async (criteria) =>
        RestAPI.getQuery<LibroFacturasRecibidas, LibroFacturasRecibidasApi>(
            baseUrl,
            criteria,
            libroFacturasRecibidasDesdeApi
        );

export const getLibroFacturasRecibidas: GetLibroFacturasRecibidas = async (id) =>
    RestAPI.getItem<LibroFacturasRecibidas, LibroFacturasRecibidasApi>(
        `${baseUrl}/${id}`,
        libroFacturasRecibidasDesdeApi
    );

export const getResultadoLibroFacturasRecibidas: GetResultadoLibroFacturasRecibidas =
    async (id) =>
        RestAPI.getItem<ResultadoLibroIva, ResultadoLibroIvaApi>(
            urls.LIBRO_FACTURAS_RECIBIDAS_DATOS(id),
            resultadoLibroIvaDesdeApi,
            tContabilidad("libro_facturas_recibidas.errorAlCalcularElLibroDe")
        );

export const postLibroFacturasRecibidas: PostLibroFacturasRecibidas = async (
    nuevo
) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevoLibroFacturasRecibidasAApi(nuevo),
        tContabilidad("libro_facturas_recibidas.errorAlCrearElLibroDe")
    );
    return String(respuesta.id);
};

export const patchLibroFacturasRecibidas: PatchLibroFacturasRecibidas = async (
    informe,
    cambios
) => {
    await RestAPI.patch(
        `${baseUrl}/${informe.id}`,
        cambiosLibroFacturasRecibidasAApi(cambios, informe),
        tContabilidad("libro_facturas_recibidas.errorAlGuardarElLibroDe")
    );
};

export const deleteLibroFacturasRecibidas: DeleteLibroFacturasRecibidas = async (
    id
) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        tContabilidad("libro_facturas_recibidas.errorAlBorrarElLibroDe")
    );
};

export const getReportLibroFacturasRecibidas: GetReportLibroFacturasRecibidas =
    async (id) =>
        RestAPI.blob(
            urls.LIBRO_FACTURAS_RECIBIDAS_REPORT(id),
            tContabilidad("libro_facturas_recibidas.errorAlDescargarElPdfDel")
        );
