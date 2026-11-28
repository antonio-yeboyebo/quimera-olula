import { empresaActual } from "#/valores/empresaActual.ts";
import { CambioAgente } from "#/ventas/comun/componentes/moleculas/CambiarAgente/diseño.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Direccion, Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { direccionVacia, payloadCambioCliente } from "../venta/dominio.ts";
import { articuloDeLinea, NuevaLineaVentaApiReq, NuevaLineaVentaApiRes, peticionNuevaLineaApi, respuestaNuevaLineaApi } from "../venta/infraestructura.ts";
import { CambiarArticuloLinea, CambiarCantidadLinea, CambioClientePresupuesto, DeleteLinea, EstadoAprobado, GetPresupuesto, GetPresupuestos, GetReportPresupuesto, LineaPresupuesto, PatchAprobarPresupuesto, PatchCambiarDivisa, PatchLinea, PostLinea, PostPresupuesto, Presupuesto, QueryNuevaLinea } from "./diseño.ts";
import { getTraza } from "#/comun/componentes/traza/infraestructura.ts";
import { tVentas } from "../i18n/index.ts";

type PresupuestoAPI = {
    id: string;
    codigo: string;
    fecha: string;
    fecha_salida: string;
    agente_id: string;
    nombre_agente: string;
    divisa_id: string;
    tasa_conversion: number;
    total: number;
    total_divisa_empresa: number;
    neto: number;
    total_iva: number;
    total_irpf: number;
    total_recargo: number;
    por_descuento: number;
    neto_sin_dto: number;
    forma_pago_id: string;
    nombre_forma_pago: string;
    grupo_iva_negocio_id: string;
    serie_id: string;
    por_comision: number;
    almacen_id: string;
    observaciones: string;
    cliente_id: string | null;
    nombre_cliente: string;
    id_fiscal: string;
    direccion_id: string | null;
    direccion: Direccion;
    estado_aprobado: EstadoAprobado;
};

const baseUrl = new ApiUrls().PRESUPUESTO;

interface LineaPresupuestoApi extends Omit<LineaPresupuesto, 'descripcionArticulo'> {
    descripcion_articulo: string | null;
}

export const lineaPresupuestoDesdeApi = (l: LineaPresupuestoApi): LineaPresupuesto => ({
    ...l,
    descripcionArticulo: l.descripcion_articulo,
} as unknown as LineaPresupuesto);

export const presupuestoFromAPI = (p: PresupuestoAPI): Presupuesto => ({
    ...p,
    fecha: new Date(Date.parse(p.fecha)),
    fecha_salida: new Date(Date.parse(p.fecha_salida)),
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
});

export const getPresupuesto: GetPresupuesto = async (id) =>
    RestAPI.get<{ datos: PresupuestoAPI }>(`${baseUrl}/${id}`).then((respuesta) => {
        return presupuestoFromAPI(respuesta.datos);
    });

export const getReportPresupuesto: GetReportPresupuesto = async (id) =>
    RestAPI.blob(`${baseUrl}/${id}/report`, tVentas("presupuesto.errores.report"));

export const getPresupuestos: GetPresupuestos = async (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
) => {
    const q = criteriaQuery(filtro, orden, paginacion);

    const respuesta = await RestAPI.get<{ datos: PresupuestoAPI[]; total: number }>(baseUrl + q);
    return { datos: respuesta.datos.map(presupuestoFromAPI), total: respuesta.total };
};

export const postPresupuesto: PostPresupuesto = async (presupuesto): Promise<string> => {
    const payload = {
        cliente: payloadCambioCliente(presupuesto),
        empresa_id: presupuesto.empresa_id || empresaActual()
    };

    return await RestAPI.post(baseUrl, payload, tVentas("presupuesto.errores.crear")).then((respuesta) => respuesta.id);
}

export const borrarPresupuesto = async (id: string): Promise<void> => {
    await RestAPI.delete(`${baseUrl}/${id}`, tVentas("presupuesto.errores.borrar"));
}

export const patchCambiarAgente = async (id: string, cambio: CambioAgente) => {
    await RestAPI.patch(`${baseUrl}/${id}`, {
        cambios: {
            agente_id: cambio.agente_id,
            por_comision: cambio.por_comision,
        }
    }, tVentas("presupuesto.errores.cambiarAgente"));
}

export const patchCambiarDivisa: PatchCambiarDivisa = async (id, cambio) => {
    await RestAPI.patch(`${baseUrl}/${id}`, {
        cambios: {
            divisa: {
                divisa_id: cambio.divisa_id,
                tasa_conversion: cambio.tasa_conversion,
            }
        }
    }, tVentas("presupuesto.errores.cambiarDivisa"));
}

export const patchCambiarCliente = async (id: string, cambio: CambioClientePresupuesto): Promise<void> => {
    await RestAPI.patch(`${baseUrl}/${id}`, {
        cambios: { cliente: payloadCambioCliente(cambio) }
    }, tVentas("presupuesto.errores.cambiarCliente"));
}

export const getLineas = async (id: string, orden?: Orden): Promise<LineaPresupuesto[]> => {
    const q = criteriaQuery(undefined, orden);

    return await RestAPI.get<{ datos: LineaPresupuestoApi[] }>(`${baseUrl}/${id}/linea${q}`).then((respuesta) =>
        respuesta.datos.map(lineaPresupuestoDesdeApi)
    );
};


export const postLinea: PostLinea = async (id, linea) => {
    const lineaApi = peticionNuevaLineaApi(linea);
    const respuesta = await RestAPI.post(`${baseUrl}/${id}/linea`, {
        lineas: [lineaApi],
    }, tVentas("presupuesto.errores.crearLinea"));
    const miRespuesta = respuesta as unknown as NuevaLineaVentaApiRes[];
    const lineaActualizada = respuestaNuevaLineaApi(linea, miRespuesta[0]);
    return { ...lineaActualizada, id: miRespuesta[0].id } as unknown as typeof linea;
}

export const queryNuevaLinea: QueryNuevaLinea = async (id, linea) => {
    const lineaApi = peticionNuevaLineaApi(linea);
    const respuesta = await RestAPI.query<NuevaLineaVentaApiReq, NuevaLineaVentaApiRes>(
        `${baseUrl}/${id}/nueva_linea`, lineaApi,
        tVentas("presupuesto.errores.obtenerLinea"))
    const lineaActualizada = respuestaNuevaLineaApi(linea, respuesta);
    return lineaActualizada;
}

export const patchArticuloLinea: CambiarArticuloLinea = async (id, lineaId, referencia) => {
    const payload = {
        cambios: {
            articulo: {
                articulo_id: referencia
            },
        },
    }
    await RestAPI.patch(`${baseUrl}/${id}/linea/${lineaId}`, payload, tVentas("presupuesto.errores.cambiarArticuloLinea"));
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
            tipo_irpf: linea.tipo_irpf,
            comision: linea.por_comision,
        },
    }
    await RestAPI.patch(`${baseUrl}/${id}/linea/${linea.id}`, payload, tVentas("presupuesto.errores.cambiarLinea"));
}


export const patchCantidadLinea: CambiarCantidadLinea = async (id, linea, cantidad) => {
    const payload = {
        cambios: {
            cantidad: cantidad,
        },
    }
    await RestAPI.patch(`${baseUrl}/${id}/linea/${linea.id}`, payload, tVentas("presupuesto.errores.cambiarCantidadLinea"));
}

export const deleteLinea: DeleteLinea = async (id: string, lineaId: string): Promise<void> => {
    await RestAPI.patch(`${baseUrl}/${id}/linea/borrar`, {
        lineas: [lineaId]
    }, tVentas("presupuesto.errores.borrarLinea"));
}

export const patchPresupuesto = async (id: string, presupuesto: Presupuesto) => {
    const payload = {
        cambios: {
            agente_id: presupuesto.agente_id,
            divisa: {
                divisa_id: presupuesto.divisa_id,
                tasa_conversion: presupuesto.tasa_conversion,
            },
            fecha: presupuesto.fecha,
            cliente_id: presupuesto.cliente.cliente_id,
            nombre_cliente: presupuesto.cliente.nombre_cliente,
            id_fiscal: presupuesto.cliente.id_fiscal,
            direccion_id: presupuesto.cliente.direccion_id,
            forma_pago_id: presupuesto.forma_pago_id,
            grupo_iva_negocio_id: presupuesto.grupo_iva_negocio_id,
            por_comision: presupuesto.por_comision,
            almacen_id: presupuesto.almacen_id,
            observaciones: presupuesto.observaciones,
        },
    };

    await RestAPI.patch(`${baseUrl}/${id}`, payload, tVentas("presupuesto.errores.actualizar"));
};


export const aprobarPresupuesto: PatchAprobarPresupuesto = async (id) => {
    const respuesta = (await RestAPI.patch(
        `${baseUrl}/${id}/aprobar`,
        {},
        tVentas("presupuesto.errores.aprobar")
    )) as unknown as { pedido_id: string; codigo?: string };

    const pedidoId = String(respuesta.pedido_id ?? "");
    return { id: pedidoId, codigo: String(respuesta.codigo ?? pedidoId) };
};

export const patchCambiarDescuento = async (id: string, dto_porcentual: number): Promise<void> => {
    await RestAPI.patch(`${baseUrl}/${id}`, {
        cambios: {
            por_descuento: dto_porcentual,
        }
    }, tVentas("presupuesto.errores.cambiarDescuento"));
};

export const getTrazaPresupuesto = (id: string): Promise<unknown> => getTraza(`${baseUrl}/${id}`);
