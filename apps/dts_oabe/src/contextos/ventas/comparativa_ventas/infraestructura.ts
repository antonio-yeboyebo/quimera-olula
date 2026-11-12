import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    AGENTE_FACTURA,
    CambiosComparativaVentas,
    ComparativaVentas,
    DeleteComparativaVentas,
    GetComparativaVentas,
    GetListaComparativaVentas,
    GetReportComparativaVentas,
    GetResultadoComparativaVentas,
    NuevaComparativaVentas,
    PatchComparativaVentas,
    PostComparativaVentas,
    ResultadoComparativaVentas,
} from "./diseño.ts";

const baseUrl = "/ventas/comparativa_ventas";

export interface ComparativaVentasApi {
    id: number;
    descripcion: string;
    anio_desde: number;
    anio_hasta: number;
    intervalo_id: string | null;
    fecha_desde: string | null;
    fecha_hasta: string | null;
    cliente_id: string | null;
    nombre_cliente: string | null;
    agente_id: string | null;
    nombre_agente: string | null;
    busqueda_agente: string;
    provincia_id: number | null;
    nombre_provincia: string | null;
    mostrar_objetivo: boolean;
}

interface FilaComparativaVentasApi {
    cliente_id: string;
    nombre: string;
    ventas: number[];
    incrementos: number[];
    objetivo: number | null;
    porcentaje_objetivo: number | null;
}

export interface ResultadoComparativaVentasApi {
    anios: number[];
    mostrar_objetivo: boolean;
    filas: FilaComparativaVentasApi[];
    totales: number[];
    total_objetivo: number | null;
}

export const comparativaVentasDesdeApi = (
    api: ComparativaVentasApi
): ComparativaVentas => ({
    id: String(api.id),
    descripcion: api.descripcion,
    anioDesde: api.anio_desde,
    anioHasta: api.anio_hasta,
    intervaloId: api.intervalo_id ?? "",
    fechaDesde: api.fecha_desde ?? "",
    fechaHasta: api.fecha_hasta ?? "",
    clienteId: api.cliente_id ?? "",
    nombreCliente: api.nombre_cliente ?? "",
    agenteId: api.agente_id ?? "",
    nombreAgente: api.nombre_agente ?? "",
    busquedaAgente: api.busqueda_agente || AGENTE_FACTURA,
    provinciaId: api.provincia_id ? String(api.provincia_id) : "",
    nombreProvincia: api.nombre_provincia ?? "",
    mostrarObjetivo: api.mostrar_objetivo,
});

export const resultadoComparativaVentasDesdeApi = (
    api: ResultadoComparativaVentasApi
): ResultadoComparativaVentas => ({
    anios: api.anios,
    mostrarObjetivo: api.mostrar_objetivo,
    filas: api.filas.map((fila) => ({
        id: fila.cliente_id,
        clienteId: fila.cliente_id,
        nombre: fila.nombre,
        ventas: fila.ventas,
        incrementos: fila.incrementos,
        objetivo: fila.objetivo,
        porcentajeObjetivo: fila.porcentaje_objetivo,
    })),
    totales: api.totales,
    totalObjetivo: api.total_objetivo,
});

const textoONulo = (valor: string): string | null => {
    const limpio = (valor ?? "").trim();
    return limpio === "" ? null : limpio;
};

const enteroONulo = (valor: string): number | null => {
    const limpio = (valor ?? "").trim();
    return limpio === "" ? null : Number(limpio);
};

export const nuevaComparativaVentasAApi = (nueva: NuevaComparativaVentas) => ({
    descripcion: nueva.descripcion,
    anio_desde: Number(nueva.anioDesde),
    anio_hasta: Number(nueva.anioHasta),
    intervalo_id: textoONulo(nueva.intervaloId),
    fecha_desde: textoONulo(nueva.fechaDesde),
    fecha_hasta: textoONulo(nueva.fechaHasta),
    cliente_id: textoONulo(nueva.clienteId),
    agente_id: textoONulo(nueva.agenteId),
    busqueda_agente: nueva.busquedaAgente,
    provincia_id: enteroONulo(nueva.provinciaId),
    mostrar_objetivo: nueva.mostrarObjetivo,
});

export const cambiosComparativaVentasAApi = (
    cambios: CambiosComparativaVentas
) => {
    const api: Record<string, unknown> = {};
    if (cambios.descripcion !== undefined) api.descripcion = cambios.descripcion;
    if (cambios.anioDesde !== undefined) api.anio_desde = Number(cambios.anioDesde);
    if (cambios.anioHasta !== undefined) api.anio_hasta = Number(cambios.anioHasta);
    if (cambios.intervaloId !== undefined) api.intervalo_id = textoONulo(cambios.intervaloId);
    if (cambios.fechaDesde !== undefined) api.fecha_desde = textoONulo(cambios.fechaDesde);
    if (cambios.fechaHasta !== undefined) api.fecha_hasta = textoONulo(cambios.fechaHasta);
    if (cambios.clienteId !== undefined) api.cliente_id = textoONulo(cambios.clienteId);
    if (cambios.agenteId !== undefined) api.agente_id = textoONulo(cambios.agenteId);
    if (cambios.busquedaAgente !== undefined) api.busqueda_agente = cambios.busquedaAgente;
    if (cambios.provinciaId !== undefined) api.provincia_id = enteroONulo(cambios.provinciaId);
    if (cambios.mostrarObjetivo !== undefined) api.mostrar_objetivo = cambios.mostrarObjetivo;
    return api;
};

export const getListaComparativaVentas: GetListaComparativaVentas = async (
    criteria
) =>
    RestAPI.getQuery<ComparativaVentas, ComparativaVentasApi>(
        baseUrl,
        criteria,
        comparativaVentasDesdeApi
    );

export const getComparativaVentas: GetComparativaVentas = async (id) =>
    RestAPI.getItem<ComparativaVentas, ComparativaVentasApi>(
        `${baseUrl}/${id}`,
        comparativaVentasDesdeApi
    );

export const getResultadoComparativaVentas: GetResultadoComparativaVentas =
    async (id) =>
        RestAPI.getItem<ResultadoComparativaVentas, ResultadoComparativaVentasApi>(
            `${baseUrl}/${id}/datos`,
            resultadoComparativaVentasDesdeApi,
            "Error al calcular la comparativa de ventas"
        );

export const postComparativaVentas: PostComparativaVentas = async (nueva) => {
    const respuesta = await RestAPI.post(
        baseUrl,
        nuevaComparativaVentasAApi(nueva),
        "Error al crear la comparativa de ventas"
    );
    return String(respuesta.id);
};

export const patchComparativaVentas: PatchComparativaVentas = async (
    id,
    cambios
) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        cambiosComparativaVentasAApi(cambios),
        "Error al guardar la comparativa de ventas"
    );
};

export const deleteComparativaVentas: DeleteComparativaVentas = async (id) => {
    await RestAPI.delete(
        `${baseUrl}/${id}`,
        "Error al borrar la comparativa de ventas"
    );
};

export const getReportComparativaVentas: GetReportComparativaVentas = async (
    id
) =>
    RestAPI.blob(
        `${baseUrl}/${id}/report`,
        "Error al descargar el PDF de la comparativa de ventas"
    );
