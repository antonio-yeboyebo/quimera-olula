import { empresaActual } from "#/valores/empresaActual.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Direccion, Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import ApiUrls from "../comun/urls.ts";
import { direccionVacia, payloadCambioCliente } from "../venta/dominio.ts";
import { articuloDeLinea, NuevaLineaVentaApiReq, NuevaLineaVentaApiRes, peticionNuevaLineaApi, respuestaNuevaLineaApi } from "../venta/infraestructura.ts";
import { DeleteLinea, EstadoExpedicion, Factura, GetFactura, GetFacturas, GetLineasFactura, GetRecibosFactura, GetReportFactura, LineaFactura, PatchArticuloLinea, PatchCambiarAgente, PatchCambiarDivisa, PatchCantidadLinea, PatchClienteFactura, PatchEmitirFactura, PatchLinea, PostFactura, PostLinea, QueryNuevaLinea, ReciboFactura } from "./diseño.ts";
import { getTraza } from "#/comun/componentes/traza/infraestructura.ts";
import { tVentas } from "../i18n/index.ts";

const baseUrl = new ApiUrls().FACTURA;

interface LineaFacturaApi extends Omit<LineaFactura, 'descripcionArticulo'> {
    descripcion_articulo: string | null;
}

interface FacturaAPI {
    id: string;
    codigo: string;
    fecha: string;
    hora: string;
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
    almacen_id: string;
    nombre_almacen: string;
    automatica: boolean;
    servicios: boolean;
    rectificativa_id: string | null;
    asiento_id: string | null;
    grupo_iva_negocio_id: string;
    serie_id: string;
    por_comision?: number;
    por_comision_agente?: number | null;
    observaciones: string;
    editable?: boolean;
    estado_expedicion: EstadoExpedicion;
}
export const facturaDesdeAPI = (p: FacturaAPI): Factura => ({
    ...p,
    fecha: new Date(Date.parse(p.fecha)),
    dtoPorcentual: p.por_descuento,
    netoSinDto: p.neto_sin_dto,
    serie_id: p.serie_id ?? "",
    por_comision: p.por_comision ?? p.por_comision_agente ?? 0,
    estadoExpedicion: p.estado_expedicion,
    cliente: {
        cliente_id: p.cliente_id ?? null,
        nombre_cliente: p.nombre_cliente ?? "",
        id_fiscal: p.id_fiscal ?? "",
        direccion_id: p.direccion_id ?? null,
        direccion: p.direccion ?? direccionVacia(),
    },
    lineas: [],
});
export const lineaFacturaDesdeApi = (l: LineaFacturaApi): LineaFactura => ({
    ...l,
    descripcionArticulo: l.descripcion_articulo,
} as unknown as LineaFactura);

export const getFactura: GetFactura = async (id) => {
    return RestAPI.get<{ datos: FacturaAPI }>(
        `${baseUrl}/${id}`).then((respuesta) => {
            return facturaDesdeAPI(respuesta.datos);
        });
};


export const getFacturas: GetFacturas = async (
    filtro: Filtro,
    orden: Orden,
    paginacion: Paginacion
) => {
    const q = criteriaQuery(filtro, orden, paginacion);

    const respuesta = await RestAPI.get<{ datos: FacturaAPI[]; total: number }>(baseUrl + q);
    return { datos: respuesta.datos.map(facturaDesdeAPI), total: respuesta.total };
};

export const patchEmitirFactura: PatchEmitirFactura = async (id) => {
    await RestAPI.patch(`${baseUrl}/${id}/emitir`, {}, tVentas("factura.errores.emitir"));
};

export const getReportFactura: GetReportFactura = async (id) =>
    RestAPI.blob(`${baseUrl}/${id}/report`, tVentas("factura.errores.report"));

export const postFactura: PostFactura = async (factura) => {
    const cliente = factura.cliente_id
        ? { cliente_id: factura.cliente_id }
        : {
            nombre_cliente: factura.nombre_cliente || "",
            id_fiscal: factura.id_fiscal || "",
            direccion: {
                tipo_via: factura.tipo_via || "",
                nombre_via: factura.nombre_via || "",
                numero: factura.numero || "",
                otros: factura.otros || "",
                cod_postal: factura.cod_postal || "",
                ciudad: factura.ciudad || "",
                pais_id: factura.pais_id || "",
                apartado: factura.apartado || "",
                telefono: factura.telefono || ""
            }
        };

    const payload = {
        cliente,
        empresa_id: factura.empresa_id || empresaActual()
    };
    return await RestAPI.post(baseUrl, payload, tVentas("factura.errores.crear")).then((respuesta) => respuesta.id);
};

export const patchCambiarCliente: PatchClienteFactura = async (id, cambio) => {
    await RestAPI.patch(`${baseUrl}/${id}`, {
        cambios: { cliente: payloadCambioCliente(cambio) }
    }, tVentas("factura.errores.cambiarCliente"));
};

export const getLineas: GetLineasFactura = async (id) =>
    await RestAPI.get<{ datos: LineaFacturaApi[] }>(
        `${baseUrl}/${id}/linea`).then((respuesta) => {
            const lineas = respuesta.datos.map((d) => lineaFacturaDesdeApi(d));
            return lineas;
        });

export const postLinea: PostLinea = async (id, linea) => {
    const lineaApi = peticionNuevaLineaApi(linea);
    const respuesta = await RestAPI.post(`${baseUrl}/${id}/linea`, {
        lineas: [lineaApi],
    }, tVentas("factura.errores.crearLinea"));
    const miRespuesta = respuesta as unknown as NuevaLineaVentaApiRes[];
    const lineaActualizada = respuestaNuevaLineaApi(linea, miRespuesta[0]);
    return { ...lineaActualizada, id: miRespuesta[0].id } as unknown as typeof linea;
};

export const queryNuevaLinea: QueryNuevaLinea = async (id, linea) => {
    const lineaApi = peticionNuevaLineaApi(linea);
    const respuesta = await RestAPI.query<NuevaLineaVentaApiReq, NuevaLineaVentaApiRes>(
        `${baseUrl}/${id}/nueva_linea`, lineaApi,
        tVentas("factura.errores.obtenerLinea"))
    const lineaActualizada = respuestaNuevaLineaApi(linea, respuesta);
    return lineaActualizada;
};

export const patchArticuloLinea: PatchArticuloLinea = async (id, lineaId, referencia) => {
    const payload = {
        cambios: {
            articulo: {
                articulo_id: referencia
            },
        },
    };
    await RestAPI.patch(`${baseUrl}/${id}/linea/${lineaId}`, payload, tVentas("factura.errores.cambiarArticuloLinea"));
};

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
    };
    await RestAPI.patch(`${baseUrl}/${id}/linea/${linea.id}`, payload, tVentas("factura.errores.cambiarLinea"));
};

export const patchCantidadLinea: PatchCantidadLinea = async (id, linea, cantidad) => {
    const payload = {
        cambios: {
            cantidad: cantidad,
        },
    };
    await RestAPI.patch(`${baseUrl}/${id}/linea/${linea.id}`, payload, tVentas("factura.errores.cambiarCantidadLinea"));
};

export const deleteLinea: DeleteLinea = async (id: string, lineaId: string): Promise<void> => {
    await RestAPI.patch(`${baseUrl}/${id}/linea/borrar`, {
        lineas: [lineaId]
    }, tVentas("factura.errores.borrarLinea"));
};

export const patchFactura = async (id: string, factura: Factura) => {
    const payload = {
        cambios: {
            agente_id: factura.agente_id,
            divisa: {
                divisa_id: factura.divisa_id,
                tasa_conversion: factura.tasa_conversion,
            },
            fecha: factura.fecha,
            hora: factura.hora,
            cliente_id: factura.cliente.cliente_id,
            nombre_cliente: factura.cliente.nombre_cliente,
            id_fiscal: factura.cliente.id_fiscal,
            direccion_id: factura.cliente.direccion_id,
            forma_pago_id: factura.forma_pago_id,
            almacen_id: factura.almacen_id,
            grupo_iva_negocio_id: factura.grupo_iva_negocio_id,
            por_comision: factura.por_comision,
            observaciones: factura.observaciones,
        },
    };

    await RestAPI.patch(`${baseUrl}/${id}`, payload,
        tVentas("factura.errores.guardar")
    );
};

export const borrarFactura = async (id: string) => {
    await RestAPI.delete(`${baseUrl}/${id}`, tVentas("factura.errores.borrar"));
}

export const patchCambiarDescuento = async (id: string, dto_porcentual: number): Promise<void> => {
    await RestAPI.patch(`${baseUrl}/${id}`, {
        cambios: {
            por_descuento: dto_porcentual,
        }
    }, tVentas("factura.errores.cambiarDescuento"));
};

export const patchCambiarDivisa: PatchCambiarDivisa = async (id, cambio) => {
    await RestAPI.patch(`${baseUrl}/${id}`, {
        cambios: {
            divisa: {
                divisa_id: cambio.divisa_id,
                tasa_conversion: cambio.tasa_conversion,
            }
        }
    }, tVentas("factura.errores.cambiarDivisa"));
};

export const patchCambiarAgente: PatchCambiarAgente = async (id, cambio) => {
    await RestAPI.patch(`${baseUrl}/${id}`, {
        cambios: {
            agente_id: cambio.agente_id,
            por_comision: cambio.por_comision,
        }
    }, tVentas("factura.errores.cambiarAgente"));
};

interface ReciboFacturaAPI {
    id: string;
    factura_id: string;
    codigo: string;
    fecha_emision: string;
    fecha_vencimiento: string;
    estado: string;
    importe: number;
    cliente_id: string;
    id_fiscal: string;
}

export const getRecibosFactura: GetRecibosFactura = async (facturaId) => {
    return RestAPI.get<{ datos: ReciboFacturaAPI[] }>(
        `/tesoreria/recibo_cobro/por_factura/${facturaId}`
    ).then((respuesta) => respuesta.datos.map((r): ReciboFactura => ({
        id: r.id,
        codigo: r.codigo,
        fecha_emision: r.fecha_emision,
        fecha_vencimiento: r.fecha_vencimiento,
        estado: r.estado,
        importe: r.importe,
    })));
};

export const getTrazaFactura = (id: string): Promise<unknown> => getTraza(`${baseUrl}/${id}`);
