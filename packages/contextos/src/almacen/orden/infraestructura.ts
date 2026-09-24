import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import {
    CambiosLineaOrdenAlmacen,
    CambiosOrdenAlmacen,
    DeleteLineasOrden,
    DeleteOrden,
    GetOrden,
    GetOrdenes,
    ItemOrdenAlmacen,
    LecturaCajaOrden,
    LecturaLineaOrden,
    LineaOrdenAlmacen,
    NuevaEntradaDesdePedido,
    NuevaLecturaCajaOrden,
    NuevaLecturaOrden,
    NuevaLecturaUbicacionOrden,
    NuevaLineaOrdenAlmacen,
    NuevaOrdenAlmacen,
    OrdenAlmacen,
    PatchLineaOrden,
    PatchOrden,
    PostEntradaDesdePedido,
    PostLineasOrden,
    PostOrden,
    TerminarOrden,
    GetReportEtiquetasOrden,
} from "./diseño.ts";


// Tipos API (snake_case)

interface LecturaCajaOrdenApi {
    id: string;
    caja_id: string;
    lpn: string;
    ubicacion_destino_id: string | null;
    ubicacion_destino: string | null;
    caja_destino_id: string | null;
    caja_destino: string | null;
    caja_completa: boolean;
    fecha_hora: string;
}

interface OrdenAlmacenApi {
    id: string;
    fecha: string;
    tipo: "ENTRADA" | "SALIDA" | "TRASPASO";
    almacen_id: string;
    almacen: string;
    abierta: boolean;
    estado: string;
    descripcion: string;
    ubicacion_origen_id: string | null;
    ubicacion_origen: string | null;
    caja_origen_id: string | null;
    ubicacion_destino_id: string | null;
    ubicacion_destino: string | null;
    caja_destino_id: string | null;
    lineas: LineaOrdenAlmacenApi[];
    lecturas_caja: LecturaCajaOrdenApi[];
}

interface LecturaLineaOrdenApi {
    id: string;
    sku: string;
    lote_id: string | null;
    cantidad: number;
    ubicacion_origen_id: string | null;
    ubicacion_origen: string | null;
    caja_origen_id: string | null;
    caja_origen: string | null;
    ubicacion_destino_id: string | null;
    ubicacion_destino: string | null;
    caja_destino_id: string | null;
    caja_destino: string | null;
    fecha_hora: string;
    lectura_caja_id: string | null;
}

export interface LineaOrdenAlmacenApi {
    id: string;
    sku: string;
    articulo: string;
    lote_id: string | null;
    por_lotes: boolean;
    cantidad_prevista: number;
    cantidad_real?: number;
    ubicacion_origen_id: string | null;
    ubicacion_origen: string | null;
    caja_origen_id: string | null;
    caja_origen: string | null;
    ubicacion_destino_id: string | null;
    ubicacion_destino: string | null;
    caja_destino_id: string | null;
    caja_destino: string | null;
    linea_pick_id: string | null;
    lecturas: LecturaLineaOrdenApi[];
}

interface NuevaLineaOrdenAlmacenApi {
    sku: string;
    lote_id: string | null;
    cantidad_prevista: number;
    ubicacion_origen_id: string | null;
    caja_origen_id: string | null;
    ubicacion_destino_id: string | null;
    caja_destino_id: string | null;
}

export interface ItemOrdenApi {
    id: string;
    fecha: string;
    tipo: string;
    abierta: boolean;
    estado: string;
    descripcion: string;
    ubicacion_origen_id: string | null;
    caja_origen_id: string | null;
    ubicacion_destino_id: string | null;
    caja_destino_id: string | null;
    responsable_id: string | null;
}

const baseUrl = `/almacen/orden`;

// Mappers API → dominio

export const lecturaCajaOrdenDesdeApi = (api: LecturaCajaOrdenApi): LecturaCajaOrden => ({
    id: api.id,
    idCaja: api.caja_id,
    lpn: api.lpn,
    idUbicacionDestino: api.ubicacion_destino_id,
    ubicacionDestino: api.ubicacion_destino,
    idCajaDestino: api.caja_destino_id,
    cajaDestino: api.caja_destino,
    cajaCompleta: api.caja_completa,
    fechaHora: new Date(api.fecha_hora),
});

export const ordenDesdeApi = (api: OrdenAlmacenApi): OrdenAlmacen => ({
    id: api.id,
    fecha: api.fecha,
    tipo: api.tipo,
    almacenId: api.almacen_id,
    almacen: api.almacen,
    abierta: api.abierta,
    estado: api.estado,
    descripcion: api.descripcion,
    idUbicacionOrigen: api.ubicacion_origen_id,
    ubicacionOrigen: api.ubicacion_origen,
    idCajaOrigen: api.caja_origen_id,
    idUbicacionDestino: api.ubicacion_destino_id,
    ubicacionDestino: api.ubicacion_destino,
    idCajaDestino: api.caja_destino_id,
    lineas: api.lineas.map(lineaOrdenDesdeApi),
    lecturasCaja: (api.lecturas_caja ?? []).map(lecturaCajaOrdenDesdeApi),
});

export const lecturaLineaOrdenDesdeApi = (api: LecturaLineaOrdenApi): LecturaLineaOrden => ({
    id: api.id,
    sku: api.sku,
    loteId: api.lote_id,
    cantidad: api.cantidad,
    idUbicacionOrigen: api.ubicacion_origen_id,
    ubicacionOrigen: api.ubicacion_origen,
    idCajaOrigen: api.caja_origen_id,
    cajaOrigen: api.caja_origen,
    idUbicacionDestino: api.ubicacion_destino_id,
    ubicacionDestino: api.ubicacion_destino,
    idCajaDestino: api.caja_destino_id,
    cajaDestino: api.caja_destino,
    fechaHora: new Date(api.fecha_hora),
    idLecturaCaja: api.lectura_caja_id,
});

export const lineaOrdenDesdeApi = (api: LineaOrdenAlmacenApi): LineaOrdenAlmacen => ({
    id: api.id,
    sku: api.sku,
    articulo: api.articulo,
    loteId: api.lote_id,
    porLotes: api.por_lotes,
    cantidadPrevista: api.cantidad_prevista,
    ...(api.cantidad_real !== undefined ? { cantidadReal: api.cantidad_real } : {}),
    idUbicacionOrigen: api.ubicacion_origen_id,
    ubicacionOrigen: api.ubicacion_origen,
    idCajaOrigen: api.caja_origen_id,
    cajaOrigen: api.caja_origen,
    idUbicacionDestino: api.ubicacion_destino_id,
    ubicacionDestino: api.ubicacion_destino,
    idCajaDestino: api.caja_destino_id,
    cajaDestino: api.caja_destino,
    idLineaPick: api.linea_pick_id,
    lecturas: api.lecturas.map(lecturaLineaOrdenDesdeApi),
});

// Mappers dominio → API

// export const lineaOrdenAApi = (linea: LineaOrdenAlmacen): LineaOrdenAlmacenApi => ({
//     id: linea.id,
//     sku: linea.sku,
//     articulo: linea.articulo,
//     lote_id: linea.loteId,
//     cantidad_prevista: linea.cantidadPrevista,
//     ...(linea.cantidadReal !== undefined ? { cantidad_real: linea.cantidadReal } : {}),
//     ubicacion_origen_id: linea.idUbicacionOrigen,
//     ubicacion_origen: linea.ubicacion_origen,
//     caja_origen_id: linea.idCajaOrigen,
//     ubicacion_destino_id: linea.idUbicacionDestino,
//     caja_destino_id: linea.idCajaDestino,
//     lecturas: linea.lecturas
//         ? linea.lecturas.map((lectura) => ({
//             id: lectura.id,
//             sku: lectura.sku,
//             lote_id: lectura.loteId,
//             cantidad: lectura.cantidad,
//             ubicacion_origen_id: lectura.idUbicacionOrigen,
//             ubicacion_origen: lectura.ubicacionOrigen,
//             caja_origen_id: lectura.idCajaOrigen,
//             caja_origen: lectura.cajaOrigen,
//             ubicacion_destino_id: lectura.idUbicacionDestino,
//             ubicacion_destino: lectura.ubicacionDestino,
//             caja_destino_id: lectura.idCajaDestino,
//             caja_destino: lectura.cajaDestino,
//             fecha_hora: lectura.fechaHora.toISOString(),
//             lectura_caja_id: lectura.idLecturaCaja,
//         }))
//         : [],
// });

const nuevaLineaOrdenAApi = (linea: NuevaLineaOrdenAlmacen): NuevaLineaOrdenAlmacenApi => ({
    sku: linea.sku,
    lote_id: linea.loteId,
    cantidad_prevista: linea.cantidadPrevista,
    ubicacion_origen_id: linea.idUbicacionOrigen,
    caja_origen_id: linea.idCajaOrigen,
    ubicacion_destino_id: linea.idUbicacionDestino,
    caja_destino_id: linea.idCajaDestino,
});

export const itemOrdenDesdeApi = (api: ItemOrdenApi): ItemOrdenAlmacen => ({
    id: api.id,
    fecha: api.fecha,
    tipo: api.tipo,
    abierta: api.abierta,
    estado: api.estado,
    descripcion: api.descripcion,
    idUbicacionOrigen: api.ubicacion_origen_id,
    idCajaOrigen: api.caja_origen_id,
    idUbicacionDestino: api.ubicacion_destino_id,
    idCajaDestino: api.caja_destino_id,
    idResponsable: api.responsable_id,
});

const nuevaOrdenAApi = (orden: NuevaOrdenAlmacen) => ({
    // fecha: (orden.fecha as Date).toISOString().slice(0, 10),
    tipo_orden: orden.tipoOrden,
    almacen_id: orden.almacenId,
    abierta: orden.abierta,
});

const cambiosOrdenAApi = (cambios: CambiosOrdenAlmacen) => {
    const payload: Record<string, unknown> = {};
    if (cambios.idCajaOrigen !== undefined) payload.caja_origen_id = cambios.idCajaOrigen;
    if (cambios.idUbicacionOrigen !== undefined) payload.ubicacion_origen_id = cambios.idUbicacionOrigen;
    if (cambios.idCajaDestino !== undefined) payload.caja_destino_id = cambios.idCajaDestino;
    if (cambios.idUbicacionDestino !== undefined) payload.ubicacion_destino_id = cambios.idUbicacionDestino;
    if (cambios.descripcion !== undefined) payload.descripcion = cambios.descripcion;
    return payload;
};

const cambiosLineaOrdenAApi = (cambios: CambiosLineaOrdenAlmacen) => {
    const payload: Record<string, unknown> = {};
    if (cambios.sku !== undefined) payload.sku = cambios.sku;
    if (cambios.loteId !== undefined) payload.lote_id = cambios.loteId;
    if (cambios.cantidadPrevista !== undefined) payload.cantidad_prevista = cambios.cantidadPrevista;
    if (cambios.idUbicacionOrigen !== undefined) payload.ubicacion_origen_id = cambios.idUbicacionOrigen;
    if (cambios.idCajaOrigen !== undefined) payload.caja_origen_id = cambios.idCajaOrigen;
    if (cambios.idUbicacionDestino !== undefined) payload.ubicacion_destino_id = cambios.idUbicacionDestino;
    if (cambios.idCajaDestino !== undefined) payload.caja_destino_id = cambios.idCajaDestino;
    return payload;
};

// Funciones CRUD

export const getOrdenes: GetOrdenes = (filtro, orden, paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    return RestAPI.get<{ datos: ItemOrdenApi[]; total: number }>(baseUrl + q).then((respuesta) => ({
        datos: respuesta.datos.map(itemOrdenDesdeApi),
        total: respuesta.total,
    }));
};

export const getOrden: GetOrden = async (id) => {
    const respuesta = await RestAPI.get<{ datos: OrdenAlmacenApi }>(`${baseUrl}/${id}`);
    return ordenDesdeApi(respuesta.datos);
};

export const postOrden: PostOrden = async (nuevaOrden) => {
    const respuesta = await RestAPI.post(baseUrl, nuevaOrdenAApi(nuevaOrden), "Error al crear la orden");
    return respuesta.id as string;
};

export const patchOrden: PatchOrden = async (id, cambios) => {
    await RestAPI.patch(`${baseUrl}/${id}`, cambiosOrdenAApi(cambios), "Error al actualizar la orden");
};

export const deleteOrden: DeleteOrden = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, "Error al borrar la orden");
};

export const postLineasOrden: PostLineasOrden = async (id, lineas) => {
    const payload = lineas.map(nuevaLineaOrdenAApi);
    await RestAPI.post(`${baseUrl}/${id}/linea`, payload, "Error al crear líneas de la orden");
};

export const patchLineaOrden: PatchLineaOrden = async (id, lineaId, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/linea/${lineaId}`,
        cambiosLineaOrdenAApi(cambios),
        "Error al actualizar la línea"
    );
};

export const deleteLineasOrden: DeleteLineasOrden = async (id, lineaIds) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/linea/borrar`,
        { linea_ids: lineaIds },
        "Error al borrar líneas de la orden"
    );
};

interface SkuLoteApi {
    id: string;
    descripcion: string;
    lote_id: string | null;
}

export const getSkuLote = async (codigo: string) => {
    const respuesta = await RestAPI.get<{ datos: SkuLoteApi }>(
        `/almacen/articulo/sku_lote/${codigo}`
    );
    return {
        sku: respuesta.datos.id,
        descripcion: respuesta.datos.descripcion,
        loteId: respuesta.datos.lote_id,
    };
};

export const registrarLecturaOrden = async (
    id: string,
    lectura: NuevaLecturaOrden
): Promise<void> => {

    await RestAPI.post(
        `${baseUrl}/${id}/lectura`,
        {
            sku: lectura.sku,
            lote_id: lectura.idLote,
            linea_id: lectura.idLinea,
            cantidad: lectura.cantidad,
            ubicacion_origen_id: lectura.idUbicacionOrigen,
            caja_origen_id: lectura.idCajaOrigen,
            caja_completa: lectura.cajaCompleta,
            ubicacion_destino_id: lectura.idUbicacionDestino,
            caja_destino_id: lectura.idCajaDestino,
        },
        "Error al registrar lectura de la orden"
    );
};

export const registrarLecturaCajaOrden = async (
    id: string,
    lectura: NuevaLecturaCajaOrden
): Promise<void> => {
    await RestAPI.post(
        `${baseUrl}/${id}/lectura_caja`,
        {
            caja_id: lectura.cajaId,
            caja_completa: lectura.cajaCompleta,
            ubicacion_destino_id: lectura.idUbicacionDestino,
            caja_destino_id: lectura.idCajaDestino,
        },
        "Error al registrar lectura de caja de la orden"
    );
};


export const deleteLecturaOrden = async (id: string, lecturaId: string): Promise<void> => {
    await RestAPI.delete(`${baseUrl}/${id}/lectura/${lecturaId}`, "Error al borrar la lectura");
};

export const registrarLecturaUbicacionOrden = async (
    id: string,
    lectura: NuevaLecturaUbicacionOrden
): Promise<void> => {
    await RestAPI.post(
        `${baseUrl}/${id}/lectura_ubicacion`,
        {
            ubicacion_id: lectura.idUbicacion,
            ubicacion_destino_id: lectura.idUbicacionDestino,
            caja_destino_id: lectura.idCajaDestino,
        },
        "Error al registrar lectura de ubicación de la orden"
    );
};

export const postEntradaDesdePedido: PostEntradaDesdePedido = async (nueva: NuevaEntradaDesdePedido) => {
    const respuesta = await RestAPI.post(
        `${baseUrl}/desde_pedido_compra`,
        { ubicacion_id: nueva.ubicacionId, pedido_id: nueva.pedidoCompraId },
        "Error al crear entrada desde pedido de compra"
    );
    return respuesta.id as string;
};

export const terminarOrden: TerminarOrden = async (id) => {
    await RestAPI.patch(`${baseUrl}/${id}/terminar`, {}, "Error al terminar la orden");
};

export const getReportEtiquetasOrden: GetReportEtiquetasOrden = async (id) =>
    RestAPI.blob(`/almacen/caja/report-por-orden-origen/${id}`, "Error al obtener el report de etiquetas");