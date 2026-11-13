import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { CambiarPrioridadLinea, CambiarPrioridadPedido, CompetidorLinea, ComprobarReservas, ComprobarReservasLineas, DisponibilidadLinea, DisponibilidadPedido, EstadoLinea, GenerarSalidaDesdePedidos, GenerarSalidaVentaDesdePedidos, GetPedidoVenta, GetPedidosVenta, ItemPedidoVenta, LineaPedidoVenta, PedidoVenta } from "./diseño.ts";


interface ItemPedidoVentaApi {
    id: string;
    fecha: string;
    codigo: string;
    cliente: string;
}

interface PedidoVentaApi extends ItemPedidoVentaApi {
    nombre_cliente: string;
    observaciones: string;
}

interface LineaPedidoVentaApi {
    id: string;
    referencia: string;
    descripcion: string;
    cantidad: number;
    pvp_unitario: number;
    pvp_total: number;
    servida: number;
    cerrada: boolean;
    prioritaria?: boolean;
}

interface OrdenDesdePedidosVentaApi {
    pedido_ids: number[];
    ubicacion_destino_id: number;
}

const baseUrl = `/almacen/pedido_venta`;

export const itemPedidoVentaDesdeApi = (api: ItemPedidoVentaApi): ItemPedidoVenta => ({
    id: api.id,
    fecha: new Date(Date.parse(api.fecha)),
    codigo: api.codigo,
    cliente: api.cliente,
});

const lineaPedidoVentaDesdeApi = (api: LineaPedidoVentaApi): LineaPedidoVenta => ({
    id: api.id,
    referencia: api.referencia,
    descripcion: api.descripcion,
    cantidad: api.cantidad,
    pvpUnitario: api.pvp_unitario,
    pvpTotal: api.pvp_total,
    servida: api.servida,
    cerrada: api.cerrada,
    prioritaria: !!api.prioritaria,
});

const pedidoVentaDesdeApi = (pedido: PedidoVentaApi, lineas: LineaPedidoVentaApi[]): PedidoVenta => ({
    ...itemPedidoVentaDesdeApi(pedido),
    cliente: pedido.nombre_cliente || pedido.cliente,
    observaciones: pedido.observaciones,
    lineas: lineas.map(lineaPedidoVentaDesdeApi),
});

export const getPedidoVenta: GetPedidoVenta = async (id) => {
    const [pedidoResp, lineasResp] = await Promise.all([
        RestAPI.get<{ datos: PedidoVentaApi }>(`/ventas/pedido/${id}`),
        RestAPI.get<{ datos: LineaPedidoVentaApi[] }>(`/ventas/pedido/${id}/linea`),
    ]);
    return pedidoVentaDesdeApi(pedidoResp.datos, lineasResp.datos);
};

export const getPedidosVenta: GetPedidosVenta = (filtro, orden, paginacion) => {
    const q = criteriaQuery(filtro, orden, paginacion);
    return RestAPI.get<{ datos: ItemPedidoVentaApi[]; total: number }>(baseUrl + q).then((respuesta) => ({
        datos: respuesta.datos.map(itemPedidoVentaDesdeApi),
        total: respuesta.total,
    }));
};

export const generarSalidaDesdePedidos: GenerarSalidaDesdePedidos = async (pedidoIds, ubicacionDestinoId) => {
    const payload: OrdenDesdePedidosVentaApi = {
        pedido_ids: pedidoIds,
        ubicacion_destino_id: ubicacionDestinoId,
    };
    await RestAPI.post(
        `/almacen/orden/desde_pedidos_venta`,
        payload,
        "Error al generar salida desde pedidos de venta"
    );
};

interface SalidaVentaDesdePedidosApi {
    pedido_ids: number[];
    zonas: number[];
}

export const generarSalidaVentaDesdePedidos: GenerarSalidaVentaDesdePedidos = async (pedidoIds, zonas) => {
    const payload: SalidaVentaDesdePedidosApi = {
        pedido_ids: pedidoIds,
        zonas,
    };
    const respuesta = await RestAPI.post(
        `/almacen/orden/salida_desde_pedidos_venta`,
        payload,
        "Error al generar salida de venta desde pedidos"
    );
    return respuesta.id;
};

export const comprobarReservas: ComprobarReservas = async (zonas) => {
    const respuesta = await RestAPI.query<{ zonas: number[] }, { pedido_id: number; estado: DisponibilidadPedido }[]>(
        `${baseUrl}/comprobar_reservas`,
        { zonas },
        'Error al comprobar reservas de pedidos'
    );
    return respuesta;
};

interface CompetidorLineaApi {
    pedido_id: number;
    codigo: string;
    fecha: string;
    cliente: string;
    linea_id: number;
    pendiente: number;
    asignado: number;
    posicion: CompetidorLinea['posicion'];
    prioritaria?: boolean;
}

export interface EstadoLineaApi {
    linea_id: number;
    sku: string;
    pendiente: number;
    asignado: number;
    estado: DisponibilidadLinea;
    prioritaria?: boolean;
    competidores: CompetidorLineaApi[];
}

const competidorLineaDesdeApi = (api: CompetidorLineaApi): CompetidorLinea => ({
    pedidoId: String(api.pedido_id),
    codigo: api.codigo,
    fecha: new Date(Date.parse(api.fecha)),
    cliente: api.cliente,
    lineaId: String(api.linea_id),
    pendiente: api.pendiente,
    asignado: api.asignado,
    posicion: api.posicion,
    prioritaria: !!api.prioritaria,
});

export const estadoLineaDesdeApi = (api: EstadoLineaApi): EstadoLinea => ({
    lineaId: String(api.linea_id),
    pendiente: api.pendiente,
    asignado: api.asignado,
    estado: api.estado,
    prioritaria: !!api.prioritaria,
    competidores: api.competidores.map(competidorLineaDesdeApi),
});

export const comprobarReservasLineas: ComprobarReservasLineas = async (pedidoId, zonas) => {
    const respuesta = await RestAPI.query<{ zonas: number[] }, EstadoLineaApi[]>(
        `${baseUrl}/${pedidoId}/comprobar_reservas_lineas`,
        { zonas },
        'Error al comprobar la disponibilidad de las líneas'
    );
    return respuesta.map(estadoLineaDesdeApi);
};

export const cambiarPrioridadLinea: CambiarPrioridadLinea = async (pedidoId, lineaId, prioritaria) => {
    await RestAPI.patch(
        `/ventas/pedido/${pedidoId}/linea/${lineaId}/prioridad`,
        { prioritaria },
        'Error al cambiar la prioridad de la línea'
    );
};

export const cambiarPrioridadPedido: CambiarPrioridadPedido = async (pedidoId, prioritaria) => {
    await RestAPI.patch(
        `/ventas/pedido/${pedidoId}/prioridad`,
        { prioritaria },
        'Error al cambiar la prioridad del pedido'
    );
};
