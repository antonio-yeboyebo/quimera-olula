import { empresaActual } from "#/valores/empresaActual.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Direccion, Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import { FactoryObj } from "@olula/lib/factory_ctx.tsx";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { direccionVacia, payloadCambioCliente } from "../venta/dominio.ts";
import { articuloDeLinea, NuevaLineaVentaApiReq, NuevaLineaVentaApiRes, peticionNuevaLineaApi, respuestaNuevaLineaApi } from "../venta/infraestructura.ts";
import { DeleteLinea, GetLineasPedido, GetPedido, GetPedidos, GetReportPedido, LineaPedido, PatchArticuloLinea, PatchCambiarAgente, PatchCambiarDivisa, PatchCantidadLinea, PatchClientePedido, PatchLinea, Pedido, PostLinea, PostPedido, QueryNuevaLinea } from "./diseño.ts";
import { getTraza } from "#/comun/componentes/traza/infraestructura.ts";
import { tVentas } from "../i18n/index.ts";

export interface LineaPedidoApi {
    id: string;
    referencia: string | null;
    descripcion: string;
    descripcion_articulo: string | null
    cantidad: number;
    pvp_unitario: number;
    dto_porcentual: number;
    dto_lineal: number;
    pvp_total: number;
    grupo_iva_producto_id: string;
    iva_incluido: boolean;
    tipo_irpf: number;
    tipo_recargo: number;
    tipo_iva: number;
    por_comision: number;
    importe_comision: number;
    por_lotes: boolean;
    servida: number;
};

interface PedidoApi {
    id: string;
    codigo: string;
    fecha: string;
    fecha_salida: string | null;
    almacen_id: string;
    nombre_almacen: string;
    cliente_id: string;
    nombre_cliente: string;
    id_fiscal: string;
    direccion_id: string;
    direccion: Direccion;
    agente_id: string;
    nombre_agente: string;
    divisa_id: string;
    tasa_conversion: number;
    total: number;
    neto: number;
    total_iva: number;
    total_irpf: number;
    total_recargo: number;
    total_divisa_empresa: number;
    por_descuento: number;
    neto_sin_dto: number;
    forma_pago_id: string;
    nombre_forma_pago: string;
    grupo_iva_negocio_id: string;
    serie_id: string;
    por_comision: number;
    observaciones: string;
    servido: string;
}

const baseUrl = new ApiUrls().PEDIDO;

type LineaPedidoDesdeApi = (l: LineaPedidoApi) => LineaPedido;

export interface VentasPedidoInfra {
    linea_desde_api: LineaPedidoDesdeApi
}

const getInfra = (): VentasPedidoInfra => FactoryObj.app.Ventas?.pedido_infraestructura as VentasPedidoInfra

const lineaPedidoDesdeApi: LineaPedidoDesdeApi = (l) => {
    const infra = getInfra();
    return (infra?.linea_desde_api ?? lineaPedidoDesdeApiBase)(l)
};

const lineaPedidoDesdeApiBase: LineaPedidoDesdeApi = (l) => ({
    ...l,
    descripcionArticulo: l.descripcion_articulo,
    porLotes: l.por_lotes,
    servida: l.servida,
} as LineaPedido);

export const ventasPedidoInfra: VentasPedidoInfra = {
    linea_desde_api: lineaPedidoDesdeApiBase
}

export const pedidoDesdeAPI = (p: PedidoApi): Pedido => ({
    ...p,
    fecha: new Date(Date.parse(p.fecha)),
    fecha_salida: p.fecha_salida ? new Date(Date.parse(p.fecha_salida)) : null,
    dtoPorcentual: p.por_descuento,
    netoSinDto: p.neto_sin_dto,
    serie_id: p.serie_id ?? "",
    cliente: {
        cliente_id: p.cliente_id ?? null,
        nombre_cliente: p.nombre_cliente ?? "",
        id_fiscal: p.id_fiscal ?? "",
        direccion_id: p.direccion_id ?? null,
        direccion: p.direccion ?? direccionVacia(),
    },
    lineas: [],
})

export const getPedido: GetPedido = async (id) => {
    return RestAPI.get<{ datos: PedidoApi }>(
        `${baseUrl}/${id}`).then((respuesta) => {
            return pedidoDesdeAPI(respuesta.datos);
        });
}

export interface OrdenAlmacenDePedido {
    id: string;
    tipo: string;
    estado: string;
}

/** Órdenes de almacén (no terminadas) en las que se está preparando el pedido. */
export const getOrdenesAlmacenDePedido = async (pedidoId: string): Promise<OrdenAlmacenDePedido[]> => {
    const respuesta = await RestAPI.get<{ datos: OrdenAlmacenDePedido[] }>(
        `/almacen/orden/de_pedido_venta/${pedidoId}`
    );
    return respuesta.datos;
};

export const getReportPedido: GetReportPedido = async (id) =>
    RestAPI.blob(`${baseUrl}/${id}/report`, tVentas("pedido.errores.report"));

export const getPedidos: GetPedidos = async (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
) => {
    const q = criteriaQuery(filtro, orden, paginacion);

    const respuesta = await RestAPI.get<{ datos: PedidoApi[]; total: number }>(baseUrl + q);
    return { datos: respuesta.datos.map(pedidoDesdeAPI), total: respuesta.total };
};

export const postPedido: PostPedido = async (pedido) => {
    const payload = {
        cliente: payloadCambioCliente(pedido),
        empresa_id: pedido.empresa_id || empresaActual()
    }
    return await RestAPI.post(baseUrl, payload, tVentas("pedido.errores.crear")).then((respuesta) => respuesta.id);
}


export const patchCambiarCliente: PatchClientePedido = async (id, cambio) => {
    await RestAPI.patch(`${baseUrl}/${id}`, {
        cambios: { cliente: payloadCambioCliente(cambio) }
    }, tVentas("pedido.errores.cambiarCliente"));
}

export const patchCambiarDescuento = async (id: string, dto_porcentual: number): Promise<void> => {
    await RestAPI.patch(`${baseUrl}/${id}`, {
        cambios: {
            por_descuento: dto_porcentual,
        }
    }, tVentas("pedido.errores.cambiarDescuento"));
}

export const patchCambiarDivisa: PatchCambiarDivisa = async (id, cambio) => {
    await RestAPI.patch(`${baseUrl}/${id}`, {
        cambios: {
            divisa: {
                divisa_id: cambio.divisa_id,
                tasa_conversion: cambio.tasa_conversion,
            }
        }
    }, tVentas("pedido.errores.cambiarDivisa"));
}

export const patchCambiarAgente: PatchCambiarAgente = async (id, cambio) => {
    await RestAPI.patch(`${baseUrl}/${id}`, {
        cambios: {
            agente_id: cambio.agente_id,
            por_comision: cambio.por_comision,
        }
    }, tVentas("pedido.errores.cambiarAgente"));
}

export const getLineas: GetLineasPedido = async (id) =>
    await RestAPI.get<{ datos: LineaPedidoApi[] }>(
        `${baseUrl}/${id}/linea`).then((respuesta) => {
            const lineas = respuesta.datos.map((d) => lineaPedidoDesdeApi(d));
            return lineas
        });

// export const getCambiosLineaPedido: GetCambiosLineaPedido = async (linea, _campo, _contexto) => {
//     // Mock: en producción, llamar al servidor usando _contexto.pedidoId para
//     // resolver tarifas del cliente, almacén, etc.
//     // Campos disparadores actuales: 'referencia'
//     if (linea.referencia === 'R1') {
//         return {
//             ...linea,
//             descripcion: 'Artículo R1 - Descripción del servidor',
//             pvp_unitario: 10.0,
//             grupo_iva_producto_id: 'GENERAL',
//             tipo_iva: 21,
//             pvp_total: linea.cantidad * linea.pvp_unitario
//         };
//     }
//     if (linea.referencia === 'R2') {
//         return {
//             ...linea,
//             descripcion: 'Artículo R2 - Descripción del servidor',
//             pvp_unitario: 25.5,
//             grupo_iva_producto_id: 'REDUCIDO',
//             tipo_iva: 10,
//             pvp_total: linea.cantidad * linea.pvp_unitario
//         };
//     }
//     return linea;
// }

export const postLinea: PostLinea = async (id, linea, { dryRun = false } = {}) => {
    const lineaApi = peticionNuevaLineaApi(linea);
    const respuesta = await RestAPI.post(`${baseUrl}/${id}/linea`, {
        lineas: [lineaApi],
        dry_run: dryRun,
    }, tVentas("pedido.errores.crearLinea"))
    const miRespuesta = respuesta as unknown as NuevaLineaVentaApiRes[];
    const lineaActualizada = respuestaNuevaLineaApi(linea, miRespuesta[0]);
    return { ...lineaActualizada, id: miRespuesta[0].id } as unknown as typeof linea;
}

export const queryNuevaLinea: QueryNuevaLinea = async (id, linea) => {
    const lineaApi = peticionNuevaLineaApi(linea);
    // Cambiar POST a QUERY cuando fastapi lo soporte
    const respuesta = await RestAPI.query<NuevaLineaVentaApiReq, NuevaLineaVentaApiRes>(
        `${baseUrl}/${id}/nueva_linea`, lineaApi,
        tVentas("pedido.errores.obtenerLinea"))
    const lineaActualizada = respuestaNuevaLineaApi(linea, respuesta);
    return lineaActualizada;
}
// export const postLineaDry: PostLineaDryRun = async (id, linea, druRun = false) => {
//     return await RestAPI.post(`${baseUrl}/${id}/linea`, {
//         lineas: [peticionNuevaLineaApi(linea)],
//         dry_run: true
//     }, "Error al crear linea de pedido").then((respuesta) => {
//         const miRespuesta = respuesta as unknown as NuevaLineaVentaApiRes[];
//         return respuestaNuevaLineaApi(linea, miRespuesta[0]);
//     });
// }


export const patchArticuloLinea: PatchArticuloLinea = async (id, lineaId, referencia) => {
    const payload = {
        cambios: {
            articulo: {
                articulo_id: referencia
            },
        },
    }
    await RestAPI.patch(`${baseUrl}/${id}/linea/${lineaId}`, payload, tVentas("pedido.errores.cambiarArticuloLinea"));
}

export const patchLinea: PatchLinea = async (id, linea) => {
    const payload = {
        cambios: {
            articulo: articuloDeLinea(linea),
            cantidad: linea.cantidad,
            pvp_unitario: linea.pvp_unitario,
            dto_porcentual: linea.dto_porcentual,
            dto_lineal: linea.dto_lineal,
            grupo_iva_producto_id: linea.grupo_iva_producto_id,
            iva_incluido: linea.iva_incluido,
            tipo_irpf: linea.tipo_irpf,
            comision: linea.por_comision,
        },
    }
    await RestAPI.patch(`${baseUrl}/${id}/linea/${linea.id}`, payload, tVentas("pedido.errores.cambiarLinea"));
}

export const patchCantidadLinea: PatchCantidadLinea = async (id, linea, cantidad) => {
    const payload = {
        cambios: {
            cantidad: cantidad,
        },
    }
    await RestAPI.patch(`${baseUrl}/${id}/linea/${linea.id}`, payload, tVentas("pedido.errores.cambiarCantidadLinea"));
}

export const deleteLinea: DeleteLinea = async (id: string, lineaId: string): Promise<void> => {
    await RestAPI.patch(`${baseUrl}/${id}/linea/borrar`, {
        lineas: [lineaId]
    }, tVentas("pedido.errores.borrarLinea"));
}

export const patchPedido = async (id: string, pedido: Pedido) => {
    const api_payloadPatchPedido = FactoryObj.app.Ventas.api_payloadPatchPedido as (p: Pedido) => unknown;

    const payload = api_payloadPatchPedido(pedido) as Record<string, unknown>;

    await RestAPI.patch(`${baseUrl}/${id}`, payload,
        tVentas("pedido.errores.guardar")
    );
};


export { payloadPatchPedido } from "./infraestructura_base.ts";

export const borrarPedido = async (id: string) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tVentas("pedido.errores.borrar"));
}

export const postAlbaranarPedidos = async (pedidoIds: string[]): Promise<{ id: string; codigo: string }> => {
    const respuesta = (await RestAPI.post(
        `${new ApiUrls().ALBARAN}/desde-pedidos`,
        { pedido_ids: pedidoIds },
        tVentas("pedido.errores.albaranarVarios")
    )) as unknown as
        | { datos: { albaran_id: string; codigo?: string } }
        | { albaran_id: string; codigo?: string };
    const datos = "datos" in respuesta ? respuesta.datos : respuesta;
    const id = String(datos.albaran_id ?? "");
    return { id, codigo: String(datos.codigo ?? id) };
};

export const getTrazaPedido = (id: string): Promise<unknown> => getTraza(`${baseUrl}/${id}`);
