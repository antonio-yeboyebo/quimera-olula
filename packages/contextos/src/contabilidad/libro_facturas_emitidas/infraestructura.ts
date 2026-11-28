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
    CambiosLibroFacturasEmitidas,
    DeleteLibroFacturasEmitidas,
    GetLibroFacturasEmitidas,
    GetListaLibroFacturasEmitidas,
    GetReportLibroFacturasEmitidas,
    GetResultadoLibroFacturasEmitidas,
    LibroFacturasEmitidas,
    NuevoLibroFacturasEmitidas,
    PatchLibroFacturasEmitidas,
    PostLibroFacturasEmitidas,
} from "./diseño.ts";
import { tContabilidad } from "../i18n/index.ts";

const urls = new ApiUrls();
const baseUrl = urls.LIBRO_FACTURAS_EMITIDAS;

export interface LibroFacturasEmitidasApi {
    id: number;
    descripcion: string;
    ejercicio_id: string;
    fecha_desde: string | null;
    fecha_hasta: string | null;
    filtro: FiltroIvaApi;
    presentacion: PresentacionIvaApi;
}

export const libroFacturasEmitidasDesdeApi = (
    api: LibroFacturasEmitidasApi
): LibroFacturasEmitidas => ({
    id: String(api.id),
    descripcion: api.descripcion,
    ejercicioId: api.ejercicio_id,
    fechaDesde: api.fecha_desde ?? "",
    fechaHasta: api.fecha_hasta ?? "",
    ...filtroDesdeApi(api.filtro),
    ...presentacionDesdeApi(api.presentacion),
});

const textoONulo = (valor: string): string | null => {
    const limpio = (valor ?? "").trim();
    return limpio === "" ? null : limpio;
};

export const nuevoLibroFacturasEmitidasAApi = (
    nuevo: NuevoLibroFacturasEmitidas
) => ({
    descripcion: nuevo.descripcion,
    ejercicio_id: nuevo.ejercicioId,
    fecha_desde: textoONulo(nuevo.fechaDesde),
    fecha_hasta: textoONulo(nuevo.fechaHasta),
    filtro: filtroAApi(nuevo),
    presentacion: presentacionAApi(nuevo),
});

const CAMPOS_FILTRO: (keyof CambiosLibroFacturasEmitidas)[] = [
    "todos",
    "porcentaje",
    "conIva",
];

const CAMPOS_PRESENTACION: (keyof CambiosLibroFacturasEmitidas)[] = [
    "mostrarTotalFactura",
    "mostrarNif",
    "mostrarDocumento",
    "mostrarAsiento",
    "numeracionAutomatica",
    "numeroDesde",
];

const alguno = (
    cambios: CambiosLibroFacturasEmitidas,
    claves: (keyof CambiosLibroFacturasEmitidas)[]
): boolean => claves.some((clave) => cambios[clave] !== undefined);

/**
 * El filtro y la presentación viajan completos aunque solo cambie una pieza:
 * la API los recibe como objeto. Por eso se pasa el informe de referencia.
 */
export const cambiosLibroFacturasEmitidasAApi = (
    cambios: CambiosLibroFacturasEmitidas,
    informe: LibroFacturasEmitidas
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
    return api;
};

export const getListaLibroFacturasEmitidas: GetListaLibroFacturasEmitidas =
    async (criteria) =>
        RestAPI.getQuery<LibroFacturasEmitidas, LibroFacturasEmitidasApi>(
            baseUrl,
            criteria,
            libroFacturasEmitidasDesdeApi
        );

export const getLibroFacturasEmitidas: GetLibroFacturasEmitidas = async (id) =>
    RestAPI.getItem<LibroFacturasEmitidas, LibroFacturasEmitidasApi>(
        `${baseUrl}/${id}`,
        libroFacturasEmitidasDesdeApi
    );

export const getResultadoLibroFacturasEmitidas: GetResultadoLibroFacturasEmitidas =
    async (id) =>
        RestAPI.getItem<ResultadoLibroIva, ResultadoLibroIvaApi>(
            urls.LIBRO_FACTURAS_EMITIDAS_DATOS(id),
            resultadoLibroIvaDesdeApi,
            tContabilidad("libro_facturas_emitidas.errorAlCalcularElLibroDe")
        );

export const postLibroFacturasEmitidas: PostLibroFacturasEmitidas = async (
    nuevo
) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevoLibroFacturasEmitidasAApi(nuevo),
        tContabilidad("libro_facturas_emitidas.errorAlCrearElLibroDe")
    );
    return String(respuesta.id);
};

export const patchLibroFacturasEmitidas: PatchLibroFacturasEmitidas = async (
    informe,
    cambios
) => {
    await RestAPI.patch(
        `${baseUrl}/${informe.id}`,
        cambiosLibroFacturasEmitidasAApi(cambios, informe),
        tContabilidad("libro_facturas_emitidas.errorAlGuardarElLibroDe")
    );
};

export const deleteLibroFacturasEmitidas: DeleteLibroFacturasEmitidas = async (
    id
) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        tContabilidad("libro_facturas_emitidas.errorAlBorrarElLibroDe")
    );
};

export const getReportLibroFacturasEmitidas: GetReportLibroFacturasEmitidas =
    async (id) =>
        RestAPI.blob(
            urls.LIBRO_FACTURAS_EMITIDAS_REPORT(id),
            tContabilidad("libro_facturas_emitidas.errorAlDescargarElPdfDel")
        );
