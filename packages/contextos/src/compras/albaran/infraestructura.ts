import { tCompras } from "#/compras/i18n/index.ts";
import { empresaActual } from "#/valores/empresaActual.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import ApiUrls from "../comun/urls.ts";
import {
    ArticuloLineaCompraApi,
    articuloLineaApi,
    ProveedorCompraApi,
    proveedorCompraApi,
} from "../comun/infraestructura.ts";
import {
    Albaran,
    AlbaranarPedidos,
    BorrarLineasAlbaran,
    CambiosAlbaran,
    CambiosLineaAlbaran,
    DeleteAlbaran,
    GetAlbaran,
    GetAlbaranes,
    GetReportAlbaran,
    GetLineaAlbaran,
    GetLineasAlbaran,
    LineaAlbaran,
    NuevaLineaAlbaran,
    NuevoAlbaran,
    NuevoAlbaranProveedorNoRegistrado,
    PatchAlbaran,
    PatchLineaAlbaran,
    PostAlbaran,
    PostLineasAlbaran,
    QueryNuevaLineaAlbaran,
} from "./diseño.ts";
import { getTraza } from "#/comun/componentes/traza/infraestructura.ts";

const baseUrl = new ApiUrls().ALBARAN;

export interface AlbaranApi {
    id: string;
    codigo: string;
    ejercicio_id: string;
    serie_id: string;
    numero: string;
    fecha: string;
    hora: string;
    numero_proveedor: string | null;
    proveedor_id: string | null;
    nombre_proveedor: string;
    id_fiscal: string;
    almacen_id: string | null;
    nombre_almacen: string | null;
    forma_pago_id: string | null;
    nombre_forma_pago: string | null;
    grupo_iva_negocio_id: string;
    divisa_id: string;
    tasa_conversion: number;
    neto: number;
    total_iva: number;
    total_recargo: number;
    total_irpf: number;
    total: number;
    total_divisa_empresa: number;
    recargo_financiero: number;
    factura_id: string | null;
    pendiente_factura: boolean;
    observaciones: string | null;
}

export interface LineaAlbaranApi {
    id: string;
    albaran_id: string;
    pedido_id: string | null;
    linea_pedido_id: string | null;
    referencia: string | null;
    descripcion: string;
    descripcion_articulo: string | null;
    cantidad: number;
    pvp_unitario: number;
    dto_porcentual: number;
    dto_lineal: number;
    pvp_sin_dto: number;
    pvp_total: number;
    grupo_iva_producto_id: string;
    tipo_iva: number;
    tipo_recargo: number;
    tipo_irpf: number;
}

interface NuevaLineaAlbaranApi {
    articulo: ArticuloLineaCompraApi;
    cantidad: number;
    pvp_unitario?: number;
    dto_porcentual?: number;
    dto_lineal?: number;
    grupo_iva_producto_id?: string;
    tipo_irpf?: number;
}

interface QueryNuevaLineaAlbaranApiReq extends NuevaLineaAlbaranApi {
    iva_incluido?: boolean;
}

interface QueryNuevaLineaAlbaranApiRes {
    id?: string;
    articulo_id: string | null;
    descripcion: string;
    cantidad: number;
    pvp_unitario: number;
    dto_porcentual: number;
    dto_lineal: number;
    pvp_total: number;
    grupo_iva_producto_id: string;
    tipo_iva: number;
    tipo_recargo: number;
    tipo_irpf: number;
    iva_incluido: boolean;
}

interface NuevoAlbaranApi {
    proveedor: ProveedorCompraApi;
    fecha: string;
    empresa_id: string;
    numero_proveedor?: string | null;
    almacen_id?: string | null;
    observaciones?: string | null;
}

interface CambiosAlbaranApi {
    proveedor?: ProveedorCompraApi;
    fecha?: string;
    hora?: string;
    numero_proveedor?: string | null;
    divisa?: { id: string; tasa_conversion?: number };
    grupo_iva_negocio_id?: string;
    forma_pago_id?: string;
    almacen_id?: string | null;
    observaciones?: string | null;
}

interface CambiosLineaAlbaranApi {
    articulo?: ArticuloLineaCompraApi;
    cantidad?: number;
    pvp_unitario?: number;
    dto_porcentual?: number;
    dto_lineal?: number;
    grupo_iva_producto_id?: string;
    tipo_irpf?: number;
}

const fechaAApi = (fecha: Date): string => fecha.toISOString().slice(0, 10);

const horaDesdeApi = (hora: string | null): string => (hora ?? "").slice(0, 8);

const horaAApi = (hora: string): string =>
    hora.length === 5 ? `${hora}:00` : hora.slice(0, 8);

export const albaranDesdeApi = (api: AlbaranApi): Albaran => ({
    id: api.id,
    codigo: api.codigo,
    ejercicioId: api.ejercicio_id,
    serieId: api.serie_id,
    numero: api.numero,
    fecha: new Date(Date.parse(api.fecha)),
    hora: horaDesdeApi(api.hora),
    numeroProveedor: api.numero_proveedor,
    proveedorId: api.proveedor_id,
    nombreProveedor: api.nombre_proveedor,
    idFiscal: api.id_fiscal,
    almacenId: api.almacen_id,
    nombreAlmacen: api.nombre_almacen,
    formaPagoId: api.forma_pago_id,
    nombreFormaPago: api.nombre_forma_pago,
    grupoIvaNegocioId: api.grupo_iva_negocio_id,
    divisaId: api.divisa_id,
    tasaConversion: api.tasa_conversion,
    neto: api.neto,
    totalIva: api.total_iva,
    totalRecargo: api.total_recargo,
    totalIrpf: api.total_irpf,
    total: api.total,
    totalDivisaEmpresa: api.total_divisa_empresa,
    recargoFinanciero: api.recargo_financiero,
    facturaId: api.factura_id,
    pendienteFactura: api.pendiente_factura,
    observaciones: api.observaciones,
});

export const lineaAlbaranDesdeApi = (api: LineaAlbaranApi): LineaAlbaran => ({
    id: api.id,
    albaranId: api.albaran_id,
    pedidoId: api.pedido_id,
    lineaPedidoId: api.linea_pedido_id,
    referencia: api.referencia,
    descripcion: api.descripcion,
    descripcionArticulo: api.descripcion_articulo,
    cantidad: api.cantidad,
    pvpUnitario: api.pvp_unitario,
    dtoPorcentual: api.dto_porcentual,
    dtoLineal: api.dto_lineal,
    pvpSinDto: api.pvp_sin_dto,
    pvpTotal: api.pvp_total,
    grupoIvaProductoId: api.grupo_iva_producto_id,
    tipoIva: api.tipo_iva,
    tipoRecargo: api.tipo_recargo,
    tipoIrpf: api.tipo_irpf,
});

const esProveedorNoRegistrado = (
    albaran: NuevoAlbaran | NuevoAlbaranProveedorNoRegistrado
): albaran is NuevoAlbaranProveedorNoRegistrado =>
    (albaran as NuevoAlbaranProveedorNoRegistrado).nombre !== undefined;

const proveedorAApi = (
    albaran: NuevoAlbaran | NuevoAlbaranProveedorNoRegistrado
): ProveedorCompraApi =>
    esProveedorNoRegistrado(albaran)
        ? { nombre: albaran.nombre, id_fiscal: albaran.idFiscal }
        : { proveedor_id: albaran.proveedorId };

const nuevoAlbaranAApi = (
    albaran: NuevoAlbaran | NuevoAlbaranProveedorNoRegistrado
): NuevoAlbaranApi => ({
    proveedor: proveedorAApi(albaran),
    fecha: fechaAApi(albaran.fecha),
    empresa_id: empresaActual(),
    ...(albaran.numeroProveedor ? { numero_proveedor: albaran.numeroProveedor } : {}),
    ...(albaran.almacenId ? { almacen_id: albaran.almacenId } : {}),
    ...(albaran.observaciones ? { observaciones: albaran.observaciones } : {}),
});

const cambiosAlbaranAApi = (a: CambiosAlbaran): CambiosAlbaranApi => {
    const cambios: CambiosAlbaranApi = {};
    if (a.proveedorId !== undefined || a.nombreProveedor !== undefined) {
        cambios.proveedor = proveedorCompraApi(a);
    }
    if (a.fecha !== undefined) cambios.fecha = fechaAApi(a.fecha);
    if (a.hora !== undefined) cambios.hora = horaAApi(a.hora);
    if (a.numeroProveedor !== undefined) cambios.numero_proveedor = a.numeroProveedor;
    if (a.divisaId) {
        cambios.divisa = {
            id: a.divisaId,
            ...(a.tasaConversion !== undefined ? { tasa_conversion: a.tasaConversion } : {}),
        };
    }
    if (a.grupoIvaNegocioId !== undefined) cambios.grupo_iva_negocio_id = a.grupoIvaNegocioId;
    if (a.formaPagoId) cambios.forma_pago_id = a.formaPagoId;
    if (a.almacenId) cambios.almacen_id = a.almacenId;
    if (a.observaciones !== undefined) cambios.observaciones = a.observaciones;
    return cambios;
};

/**
 * Los importes a cero se omiten: el servidor distingue «ausente» (toma la
 * condición del proveedor) de «presente con 0» (la pisa), así que mandarlos
 * siempre borraría el descuento de `articulosprov`.
 */
const nuevaLineaAApi = (linea: NuevaLineaAlbaran): NuevaLineaAlbaranApi => ({
    articulo: articuloLineaApi(linea),
    cantidad: linea.cantidad,
    ...(linea.pvpUnitario === null ? {} : { pvp_unitario: linea.pvpUnitario }),
    ...(linea.dtoPorcentual ? { dto_porcentual: linea.dtoPorcentual } : {}),
    ...(linea.dtoLineal ? { dto_lineal: linea.dtoLineal } : {}),
    ...(linea.grupoIvaProductoId === null
        ? {}
        : { grupo_iva_producto_id: linea.grupoIvaProductoId }),
    ...(linea.tipoIrpf ? { tipo_irpf: linea.tipoIrpf } : {}),
});

const queryNuevaLineaAApi = (
    linea: NuevaLineaAlbaran
): QueryNuevaLineaAlbaranApiReq => ({
    ...nuevaLineaAApi(linea),
    iva_incluido: linea.ivaIncluido,
});

const queryNuevaLineaDesdeApi = (
    anterior: NuevaLineaAlbaran,
    api: QueryNuevaLineaAlbaranApiRes
): NuevaLineaAlbaran => ({
    ...anterior,
    ...(anterior.tipoArticulo === "generico" ? {} : { descripcion: api.descripcion }),
    cantidad: api.cantidad,
    pvpUnitario: api.pvp_unitario,
    dtoPorcentual: api.dto_porcentual,
    dtoLineal: api.dto_lineal,
    pvpTotal: api.pvp_total,
    grupoIvaProductoId: api.grupo_iva_producto_id,
    ivaIncluido: api.iva_incluido,
    tipoIva: api.tipo_iva,
    tipoRecargo: api.tipo_recargo,
    tipoIrpf: api.tipo_irpf,
});

const cambiosLineaAApi = (linea: CambiosLineaAlbaran): CambiosLineaAlbaranApi => {
    const cambios: CambiosLineaAlbaranApi = {};
    if (linea.tipoArticulo !== undefined) {
        cambios.articulo = articuloLineaApi({
            tipoArticulo: linea.tipoArticulo,
            referencia: linea.referencia ?? null,
            descripcion: linea.descripcion ?? "",
            descripcionArticulo: linea.descripcionArticulo ?? null,
        });
    }
    if (linea.cantidad !== undefined) cambios.cantidad = linea.cantidad;
    if (linea.pvpUnitario !== undefined) cambios.pvp_unitario = linea.pvpUnitario;
    if (linea.dtoPorcentual !== undefined) cambios.dto_porcentual = linea.dtoPorcentual;
    if (linea.dtoLineal !== undefined) cambios.dto_lineal = linea.dtoLineal;
    if (linea.grupoIvaProductoId !== undefined) {
        cambios.grupo_iva_producto_id = linea.grupoIvaProductoId;
    }
    if (linea.tipoIrpf !== undefined) cambios.tipo_irpf = linea.tipoIrpf;
    return cambios;
};

export const getAlbaran: GetAlbaran = async (id) =>
    await RestAPI.getItem<Albaran, AlbaranApi>(
        `${baseUrl}/${id}`,
        albaranDesdeApi,
        tCompras("albaran.errores.obtener")
    );

export const getAlbaranes: GetAlbaranes = async (criteria) =>
    await RestAPI.getQuery<Albaran, AlbaranApi>(
        baseUrl,
        criteria,
        albaranDesdeApi,
        tCompras("albaran.errores.obtenerLista")
    );

export const postAlbaran: PostAlbaran = async (nuevoAlbaran) => {
    const respuesta = await RestAPI.post<NuevoAlbaranApi>(
        baseUrl,
        nuevoAlbaranAApi(nuevoAlbaran),
        tCompras("albaran.errores.crear")
    );
    return respuesta.id;
};

export const albaranarPedidos: AlbaranarPedidos = async (pedidoIds, lineas) => {
    const respuesta = (await RestAPI.post(
        `${baseUrl}/desde-pedidos`,
        {
            pedido_ids: pedidoIds,
            ...(lineas
                ? {
                    lineas: lineas.map((l) => ({
                        linea_pedido_id: l.lineaPedidoId,
                        cantidad: l.cantidad,
                    })),
                }
                : {}),
        },
        tCompras("albaran.errores.albaranarPedidos")
    )) as unknown as { albaran_id: string; codigo: string };
    return { id: respuesta.albaran_id, codigo: respuesta.codigo };
};

export const patchAlbaran: PatchAlbaran = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        { cambios: cambiosAlbaranAApi(cambios) },
        tCompras("albaran.errores.guardar")
    );
};

export const deleteAlbaran: DeleteAlbaran = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tCompras("albaran.errores.borrar"));
};

export const getReportAlbaran: GetReportAlbaran = async (id) =>
    await RestAPI.blob(`${baseUrl}/${id}/report`, tCompras("albaran.errores.report"));

export const getLineasAlbaran: GetLineasAlbaran = async (id) =>
    await RestAPI.getLista<LineaAlbaran, LineaAlbaranApi>(
        `${baseUrl}/${id}/linea`,
        lineaAlbaranDesdeApi,
        tCompras("albaran.errores.obtenerLineas")
    );

export const getLineaAlbaran: GetLineaAlbaran = async (id, lineaId) =>
    await RestAPI.getItem<LineaAlbaran, LineaAlbaranApi>(
        `${baseUrl}/${id}/linea/${lineaId}`,
        lineaAlbaranDesdeApi,
        tCompras("albaran.errores.obtenerLinea")
    );

export const postLineasAlbaran: PostLineasAlbaran = async (id, lineas) => {
    const respuesta = await RestAPI.post<{ lineas: NuevaLineaAlbaranApi[] }>(
        `${baseUrl}/${id}/linea`,
        { lineas: lineas.map(nuevaLineaAApi) },
        tCompras("albaran.errores.crearLineas")
    );
    const { lineas: ids } = respuesta as unknown as { lineas: string[] };
    return ids;
};

export const postLineaAlbaran = async (
    id: string,
    linea: NuevaLineaAlbaran
): Promise<string> => {
    const [lineaId] = await postLineasAlbaran(id, [linea]);
    return lineaId;
};

export const queryNuevaLineaAlbaran: QueryNuevaLineaAlbaran = async (id, linea) => {
    const respuesta = await RestAPI.query<
        QueryNuevaLineaAlbaranApiReq,
        QueryNuevaLineaAlbaranApiRes
    >(
        `${baseUrl}/${id}/nueva_linea`,
        queryNuevaLineaAApi(linea),
        tCompras("albaran.errores.nuevaLinea")
    );
    return queryNuevaLineaDesdeApi(linea, respuesta);
};

export const patchLineaAlbaran: PatchLineaAlbaran = async (id, lineaId, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/linea/${lineaId}`,
        { cambios: cambiosLineaAApi(cambios) },
        tCompras("albaran.errores.actualizarLinea")
    );
};

export const borrarLineasAlbaran: BorrarLineasAlbaran = async (id, lineas) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/linea/borrar`,
        { lineas },
        tCompras("albaran.errores.borrarLineas")
    );
};

export const getTrazaAlbaran = (id: string): Promise<unknown> => getTraza(`${baseUrl}/${id}`);
