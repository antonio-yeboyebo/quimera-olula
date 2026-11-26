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
    BorrarLineasPedido,
    CambiosLineaPedido,
    CambiosPedido,
    CerrarLineaPedido,
    DeletePedido,
    GetLineaPedido,
    GetLineasPedido,
    GetPedido,
    GetPedidos,
    GetReportPedido,
    LineaPedido,
    NuevaLineaPedido,
    NuevoPedido,
    NuevoPedidoProveedorNoRegistrado,
    PatchLineaPedido,
    PatchPedido,
    Pedido,
    PostLineasPedido,
    QueryNuevaLineaPedido,
    PostPedido,
    Recibido,
} from "./diseño.ts";
import { getTraza } from "#/comun/componentes/traza/infraestructura.ts";

const baseUrl = new ApiUrls().PEDIDO;

export interface PedidoApi {
    id: string;
    codigo: string;
    ejercicio_id: string;
    serie_id: string;
    numero: string;
    fecha: string;
    fecha_entrada: string;
    numero_proveedor: string | null;
    proveedor_id: string | null;
    nombre_proveedor: string;
    id_fiscal: string;
    almacen_id: string | null;
    nombre_almacen: string | null;
    forma_pago_id: string;
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
    recibido: string | null;
    observaciones: string | null;
}

export interface LineaPedidoApi {
    id: string;
    pedido_id: string;
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
    cantidad_recibida: number;
    cerrada: boolean;
    por_lotes: boolean;
}

interface NuevaLineaPedidoApi {
    articulo: ArticuloLineaCompraApi;
    cantidad: number;
    pvp_unitario?: number;
    dto_porcentual?: number;
    dto_lineal?: number;
    grupo_iva_producto_id?: string;
    tipo_irpf?: number;
}

interface QueryNuevaLineaPedidoApiReq extends NuevaLineaPedidoApi {
    iva_incluido?: boolean;
}

interface QueryNuevaLineaPedidoApiRes {
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

interface NuevoPedidoApi {
    proveedor: ProveedorCompraApi;
    fecha: string;
    empresa_id: string;
    fecha_entrada?: string;
    numero_proveedor?: string | null;
    almacen_id?: string | null;
    observaciones?: string | null;
}

interface CambiosPedidoApi {
    proveedor?: ProveedorCompraApi;
    fecha?: string;
    fecha_entrada?: string;
    numero_proveedor?: string | null;
    divisa?: { id: string; tasa_conversion?: number };
    grupo_iva_negocio_id?: string;
    forma_pago_id?: string;
    almacen_id?: string | null;
    observaciones?: string | null;
}

interface CambiosLineaPedidoApi {
    articulo?: ArticuloLineaCompraApi;
    cantidad?: number;
    pvp_unitario?: number;
    dto_porcentual?: number;
    dto_lineal?: number;
    grupo_iva_producto_id?: string;
    tipo_irpf?: number;
}

const fechaAApi = (fecha: Date): string => fecha.toISOString().slice(0, 10);

export const pedidoDesdeApi = (api: PedidoApi): Pedido => ({
    id: api.id,
    codigo: api.codigo,
    ejercicioId: api.ejercicio_id,
    serieId: api.serie_id,
    numero: api.numero,
    fecha: new Date(Date.parse(api.fecha)),
    fechaEntrada: new Date(Date.parse(api.fecha_entrada)),
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
    recibido: api.recibido as Recibido | null,
    observaciones: api.observaciones,
});

export const lineaPedidoDesdeApi = (api: LineaPedidoApi): LineaPedido => ({
    id: api.id,
    pedidoId: api.pedido_id,
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
    cantidadRecibida: api.cantidad_recibida,
    cerrada: api.cerrada,
    porLotes: api.por_lotes,
});

const esProveedorNoRegistrado = (
    pedido: NuevoPedido | NuevoPedidoProveedorNoRegistrado
): pedido is NuevoPedidoProveedorNoRegistrado =>
    (pedido as NuevoPedidoProveedorNoRegistrado).nombre !== undefined;

const proveedorAApi = (
    pedido: NuevoPedido | NuevoPedidoProveedorNoRegistrado
): ProveedorCompraApi =>
    esProveedorNoRegistrado(pedido)
        ? { nombre: pedido.nombre, id_fiscal: pedido.idFiscal }
        : { proveedor_id: pedido.proveedorId };

const nuevoPedidoAApi = (
    pedido: NuevoPedido | NuevoPedidoProveedorNoRegistrado
): NuevoPedidoApi => ({
    proveedor: proveedorAApi(pedido),
    fecha: fechaAApi(pedido.fecha),
    empresa_id: empresaActual(),
    ...(pedido.fechaEntrada ? { fecha_entrada: fechaAApi(pedido.fechaEntrada) } : {}),
    ...(pedido.numeroProveedor ? { numero_proveedor: pedido.numeroProveedor } : {}),
    ...(pedido.almacenId ? { almacen_id: pedido.almacenId } : {}),
    ...(pedido.observaciones ? { observaciones: pedido.observaciones } : {}),
});

const cambiosPedidoAApi = (p: CambiosPedido): CambiosPedidoApi => {
    const cambios: CambiosPedidoApi = {};
    if (p.proveedorId !== undefined || p.nombreProveedor !== undefined) {
        cambios.proveedor = proveedorCompraApi(p);
    }
    if (p.fecha !== undefined) cambios.fecha = fechaAApi(p.fecha);
    if (p.fechaEntrada !== undefined) cambios.fecha_entrada = fechaAApi(p.fechaEntrada);
    if (p.numeroProveedor !== undefined) cambios.numero_proveedor = p.numeroProveedor;
    if (p.divisaId !== undefined || p.tasaConversion !== undefined) {
        cambios.divisa = {
            id: p.divisaId ?? "",
            ...(p.tasaConversion !== undefined ? { tasa_conversion: p.tasaConversion } : {}),
        };
    }
    if (p.grupoIvaNegocioId !== undefined) cambios.grupo_iva_negocio_id = p.grupoIvaNegocioId;
    if (p.formaPagoId !== undefined) cambios.forma_pago_id = p.formaPagoId;
    if (p.almacenId !== undefined) cambios.almacen_id = p.almacenId;
    if (p.observaciones !== undefined) cambios.observaciones = p.observaciones;
    return cambios;
};

/**
 * Los importes a cero se omiten: el servidor distingue «ausente» (toma la
 * condición del proveedor) de «presente con 0» (la pisa), así que mandarlos
 * siempre borraría el descuento de `articulosprov`.
 */
const nuevaLineaAApi = (linea: NuevaLineaPedido): NuevaLineaPedidoApi => ({
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
    linea: NuevaLineaPedido
): QueryNuevaLineaPedidoApiReq => ({
    ...nuevaLineaAApi(linea),
    iva_incluido: linea.ivaIncluido,
});

const queryNuevaLineaDesdeApi = (
    anterior: NuevaLineaPedido,
    api: QueryNuevaLineaPedidoApiRes
): NuevaLineaPedido => ({
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

const cambiosLineaAApi = (linea: CambiosLineaPedido): CambiosLineaPedidoApi => {
    const cambios: CambiosLineaPedidoApi = {};
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

export const getPedido: GetPedido = async (id) =>
    await RestAPI.getItem<Pedido, PedidoApi>(
        `${baseUrl}/${id}`,
        pedidoDesdeApi,
        tCompras("pedido.errores.obtener")
    );

export const getPedidos: GetPedidos = async (criteria) =>
    await RestAPI.getQuery<Pedido, PedidoApi>(
        baseUrl,
        criteria,
        pedidoDesdeApi,
        tCompras("pedido.errores.obtenerLista")
    );

export const postPedido: PostPedido = async (nuevoPedido) => {
    const respuesta = await RestAPI.post<NuevoPedidoApi>(
        baseUrl,
        nuevoPedidoAApi(nuevoPedido),
        tCompras("pedido.errores.crear")
    );
    return respuesta.id;
};

export const patchPedido: PatchPedido = async (id, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        { cambios: cambiosPedidoAApi(cambios) },
        tCompras("pedido.errores.guardar")
    );
};

export const deletePedido: DeletePedido = async (id) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tCompras("pedido.errores.borrar"));
};

export const getReportPedido: GetReportPedido = async (id) =>
    await RestAPI.blob(`${baseUrl}/${id}/report`, tCompras("pedido.errores.report"));

export const getLineasPedido: GetLineasPedido = async (id) =>
    await RestAPI.getLista<LineaPedido, LineaPedidoApi>(
        `${baseUrl}/${id}/linea`,
        lineaPedidoDesdeApi,
        tCompras("pedido.errores.obtenerLineas")
    );

export const getLineaPedido: GetLineaPedido = async (id, lineaId) =>
    await RestAPI.getItem<LineaPedido, LineaPedidoApi>(
        `${baseUrl}/${id}/linea/${lineaId}`,
        lineaPedidoDesdeApi,
        tCompras("pedido.errores.obtenerLinea")
    );

export const postLineasPedido: PostLineasPedido = async (id, lineas) => {
    const respuesta = await RestAPI.post<{ lineas: NuevaLineaPedidoApi[] }>(
        `${baseUrl}/${id}/linea`,
        { lineas: lineas.map(nuevaLineaAApi) },
        tCompras("pedido.errores.crearLineas")
    );
    const { lineas: ids } = respuesta as unknown as { lineas: string[] };
    return ids;
};

export const postLineaPedido = async (
    id: string,
    linea: NuevaLineaPedido
): Promise<string> => {
    const [lineaId] = await postLineasPedido(id, [linea]);
    return lineaId;
};

export const queryNuevaLineaPedido: QueryNuevaLineaPedido = async (id, linea) => {
    const respuesta = await RestAPI.query<
        QueryNuevaLineaPedidoApiReq,
        QueryNuevaLineaPedidoApiRes
    >(
        `${baseUrl}/${id}/nueva_linea`,
        queryNuevaLineaAApi(linea),
        tCompras("pedido.errores.nuevaLinea")
    );
    return queryNuevaLineaDesdeApi(linea, respuesta);
};

export const patchLineaPedido: PatchLineaPedido = async (id, lineaId, cambios) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/linea/${lineaId}`,
        { cambios: cambiosLineaAApi(cambios) },
        tCompras("pedido.errores.actualizarLinea")
    );
};

export const cerrarLineaPedido: CerrarLineaPedido = async (id, lineaId, cerrada) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/linea/${lineaId}/cerrar`,
        { cerrada },
        tCompras("pedido.errores.cerrarLinea")
    );
};

export const borrarLineasPedido: BorrarLineasPedido = async (id, lineas) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/linea/borrar`,
        { lineas },
        tCompras("pedido.errores.borrarLineas")
    );
};

export const getTrazaPedido = (id: string): Promise<unknown> => getTraza(`${baseUrl}/${id}`);
