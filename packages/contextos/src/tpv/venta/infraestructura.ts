import ApiUrls from "#/tpv/comun/urls.ts";
import Ventas_Urls from "#/ventas/comun/urls.ts";
import { articuloDeLinea, NuevaLineaVentaApiReq, NuevaLineaVentaApiRes, peticionNuevaLineaApi, respuestaNuevaLineaApi } from "#/ventas/venta/infraestructura.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { ClausulaFiltro, Direccion, Filtro } from "@olula/lib/diseño.ts";
import { criteriaQuery } from "@olula/lib/infraestructura.ts";
import { agenteActivo, puntoVentaLocal } from "../comun/infraestructura.ts";
import { DeleteLinea, DeletePago, DeleteVentaTpv, GetLineasFactura, GetPagosVentaTpv, GetReportVale, GetReportVenta, GetVentasTpv, GetVentaTpv, GetVentaTpvADevolver, LineaFactura, LineaParaTiqueRegalo, PagoVentaTpv, PatchArticuloLinea, PatchCantidadLinea, PatchClienteFactura, PatchDevolverVenta, PatchEmitirVenta, PatchFechaVenta, PatchLinea, PatchVenta, PostEmitirVale, PostLinea, PostLineaPorBarcode, PostPago, PostVentaTpv, QueryNuevaLinea, VentaTpv, VentaTpvADevolver } from "./diseño.ts";

const baseUrl = new ApiUrls().VENTA;
const baseUrlFactura = new Ventas_Urls().FACTURA;
const baseUrlVale = new ApiUrls().VALE;


type LineaFacturaAPI = LineaFactura;

interface ClienteVentaTpvApi {
    id: string | null;
    nombre: string;
    id_fiscal: string;
    direccion_id: string;
    direccion: Direccion;
}

type VentaTpvAPI = {
    id: string;
    codigo: string;
    fecha: Date;
    cliente: ClienteVentaTpvApi | null;
    // cliente_id: string;
    // nombre_cliente: string;
    // id_fiscal: string;
    // direccion_id: string;
    // direccion: Direccion;
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
    forma_pago_id: string;
    nombre_forma_pago: string;
    grupo_iva_negocio_id: string;
    observaciones: string;
    por_descuento: number;
    neto_sin_dto: number;
    pendiente: number;
    pagado: number;
    // lineas: LineaFactura[];
    // pagos: PagoVentaTpv[];
    puntoVentaId: string;
    puntoVenta: string;
    agenteId: string;
    agente: string;
    abierta: boolean;
}

type PagoVentaTpvApi = {
    id: string;
    importe: number;
    forma_pago: string;
    fecha: string;
    vale: string | null;
    arqueo_id: string;
    saldo_vale: number | null;
    arqueo_abierto: boolean;
    tipo_tarjeta_id: string | null;
}

interface VentaTpvADevolverAPI extends VentaTpvAPI {
    lineas: LineaFacturaAPI[];
}

export const ventaDesdeAPI = (v: VentaTpvAPI): VentaTpv => ({
    ...v,
    idAgente: v.agente_id,
    fecha: new Date(Date.parse(v.fecha as unknown as string)),
    dtoPorcentual: v.por_descuento,
    netoSinDto: v.neto_sin_dto,
    cliente: v.cliente ? {
        id: v.cliente.id,
        nombre: v.cliente.nombre,
        idFiscal: v.cliente.id_fiscal,
        idDireccion: v.cliente.direccion_id,
        direccion: v.cliente.direccion,
    } : null,
});

export const ventaADevolverDesdeAPI = (venta: VentaTpvADevolverAPI): VentaTpvADevolver => ({
    ...ventaDesdeAPI(venta),
    lineas: venta.lineas.map(l => ({
        ...l,
        aDevolver: 0
    }))
});

export const lineaFacturaFromAPI = (l: LineaFacturaAPI): LineaFactura => l;
export const pagoVentaTpvDesdeAPI = (p: PagoVentaTpvApi): PagoVentaTpv => (
    {
        id: p.id,
        importe: p.importe,
        formaPago: p.forma_pago,
        fecha: new Date(Date.parse(p.fecha)),
        vale: p.vale,
        saldoVale: p.saldo_vale,
        idArqueo: p.arqueo_id,
        arqueoAbierto: p.arqueo_abierto,
        idTipoTarjeta: p.tipo_tarjeta_id
    }
);

export const getVenta: GetVentaTpv = async (id) => {
    return RestAPI.get<{ datos: VentaTpvAPI }>(
        `${baseUrl}/${id}`).then((respuesta) => {
            return ventaDesdeAPI(respuesta.datos);
        });
};

export const getVentaADevolver: GetVentaTpvADevolver = async (codigo) => {
    return RestAPI.get<{ datos: VentaTpvADevolverAPI }>(
        `${baseUrl}/${codigo}/a_devolver`).then((respuesta) => {
            return ventaADevolverDesdeAPI(respuesta.datos);
        });
};

export const getVentas: GetVentasTpv = async (
    filtro, orden, paginacion
) => {
    const miPuntoVentaLocal = puntoVentaLocal.obtenerSeguro();
    const filtroPuntoVenta: ClausulaFiltro = [
        "punto_venta_id",
        "=",
        miPuntoVentaLocal?.id ?? "",
    ];

    const esListaDeClausulas =
        Array.isArray(filtro) && (filtro.length === 0 || Array.isArray(filtro[0]));

    const filtroCombinado: Filtro = esListaDeClausulas
        ? [...(filtro as ClausulaFiltro[]), filtroPuntoVenta]
        : { and: [filtro, [filtroPuntoVenta]] };
    const q = criteriaQuery(filtroCombinado, orden, paginacion);

    const respuesta = await RestAPI.get<{ datos: VentaTpvAPI[]; total: number }>(baseUrl + q);
    return { datos: respuesta.datos.map(ventaDesdeAPI), total: respuesta.total };
};


export const postVenta: PostVentaTpv = async (agenteId?: string) => {
    const payload = {
        agente_id: agenteId ?? agenteActivo.obtener()?.id,
        punto_venta_id: puntoVentaLocal.obtener()?.id,
    };
    return await RestAPI.post(baseUrl, payload, "Error al crear la venta").then((respuesta) => respuesta.id);
};

export const patchCambiarCliente: PatchClienteFactura = async (id, cambio) => {
    await RestAPI.patch(`${baseUrlFactura}/${id}`, {
        cambios: {
            cliente: {
                cliente_id: cambio.cliente_id,
                direccion_id: cambio.direccion_id
            }
        }
    }, "Error al cambiar cliente de la factura");
};

export const deleteVentaTpv: DeleteVentaTpv = async (id) => {
    return await RestAPI.delete(`${baseUrl}/${id}`, "Error al borrar la venta");
};

export const patchDevolverVenta: PatchDevolverVenta = async (id, ventaADevolver) => {
    await RestAPI.patch(`${baseUrl}/${id}/rectificar`, {
        rectificada_id: ventaADevolver.id,
        lineas_rectificadas: ventaADevolver.lineas.filter(
            (l) => l.aDevolver > 0
        ).
            map((l) => ({
                id: l.id,
                cantidad: l.aDevolver * -1
            }))
    }, "Error al devolver la venta");
}

export const postEmitirVale: PostEmitirVale = async (venta) => {
    await RestAPI.post(
        `${baseUrl}/${venta.id}/emitir_vale`,
        {
            punto_venta_id: puntoVentaLocal.obtener().id,
        },
        "Error al emitir el vale"
    );
}

export const getLineas: GetLineasFactura = async (id) =>
    await RestAPI.get<{ datos: LineaFacturaAPI[] }>(
        `${baseUrl}/${id}/lineas`).then((respuesta) => {
            const lineas = respuesta.datos.map((d) => lineaFacturaFromAPI(d));
            return lineas;
        });

export const getPagos: GetPagosVentaTpv = async (id) =>
    await RestAPI.get<{ datos: PagoVentaTpvApi[] }>(
        `${baseUrl}/${id}/pagos`).then((respuesta) => {
            const lineas = respuesta.datos.map((d) => pagoVentaTpvDesdeAPI(d));
            return lineas;
        });

export const postPago: PostPago = async (id, pago) => {
    const body = {
        importe: pago.importe,
        fecha: (new Date().toISOString()).slice(0, 10),
        forma_pago: pago.formaPago,
        vale_id: pago.idVale,
        tipo_tarjeta_id: pago.idTipoTarjeta,
    }
    return await RestAPI.post(`${baseUrl}/${id}/pago`,
        body,
        "Error al crear pago de venta").then((respuesta) => {
            const miRespuesta = respuesta as unknown as { id: string };
            return miRespuesta.id;
        });
};

export const postLinea: PostLinea = async (id, linea) => {
    const lineaApi = peticionNuevaLineaApi(linea);
    const respuesta = await RestAPI.post(`${baseUrl}/${id}/linea`,
        lineaApi, "Error al crear línea de venta");
    return { id: respuesta.id } as unknown as typeof linea;
    // const miRespuesta = respuesta as unknown as NuevaLineaVentaApiRes[];
    // const lineaActualizada = respuestaNuevaLineaApi(linea, miRespuesta[0]);
    // return { ...lineaActualizada, id: miRespuesta[0].id } as unknown as typeof linea;
};

export const queryNuevaLinea: QueryNuevaLinea = async (id, linea) => {
    const lineaApi = peticionNuevaLineaApi(linea);
    const respuesta = await RestAPI.query<NuevaLineaVentaApiReq, NuevaLineaVentaApiRes>(
        `${baseUrl}/${id}/nueva_linea`, lineaApi,
        "Error al obtener la nueva línea de venta")
    const lineaActualizada = respuestaNuevaLineaApi(linea, respuesta);
    return lineaActualizada;
};

export const postLineaPorBarcode: PostLineaPorBarcode = async (id, linea) => {
    const body = {
        barcode: linea.barcode,
        cantidad: linea.cantidad
    }
    return await RestAPI.post(`${baseUrl}/${id}/linea_por_barcode`,
        body,
        "Error al crear linea de venta").then((respuesta) => {
            const miRespuesta = respuesta as unknown as { id: string };
            return miRespuesta.id;
        });
};

export const patchArticuloLinea: PatchArticuloLinea = async (id, lineaId, referencia) => {
    const payload = {
        cambios: {
            articulo: {
                articulo_id: referencia
            },
        },
    };
    await RestAPI.patch(`${baseUrl}/${id}/linea/${lineaId}`, payload, "Error al actualizar artículo de la línea de venta TPV");
};

export const patchLinea: PatchLinea = async (id, linea) => {
    const payload = {
        cambios: {
            articulo: articuloDeLinea(linea),
            cantidad: linea.cantidad,
            pvp_unitario: linea.pvp_unitario,
            iva_incluido: linea.iva_incluido,
            dto_porcentual: linea.dto_porcentual,
            dto_lineal: linea.dto_lineal,
            grupo_iva_producto_id: linea.grupo_iva_producto_id,
        },
    };
    await RestAPI.patch(`${baseUrl}/${id}/linea/${linea.id}`, payload, "Error al actualizar línea de venta TPV");
};

export const patchCantidadLinea: PatchCantidadLinea = async (id, linea, cantidad) => {
    const payload = {
        cambios: {
            articulo: {
                articulo_id: linea.referencia
            },
            cantidad: cantidad,
        },
    };
    await RestAPI.patch(`${baseUrl}/${id}/linea/${linea.id}`, payload, "Error al actualizar cantidad de la línea de venta TPV");
};

export const deleteLinea: DeleteLinea = async (id, lineaId): Promise<void> => {
    await RestAPI.delete(`${baseUrl}/${id}/linea/${lineaId}`,
        "Error al borrar línea de venta"
    );
};

export const getReportVenta: GetReportVenta = async (id) =>
    RestAPI.blob(`${baseUrl}/${id}/report`, "Error al obtener el report de la venta");

export const getReportVale: GetReportVale = async (id) =>
    RestAPI.blob(`${baseUrlVale}/${id}/report`, "Error al obtener el report del vale de la venta");

export const postReportTiqueRegalo = async (id: string, lineas: LineaParaTiqueRegalo[]): Promise<Blob> =>
    RestAPI.postBlob(
        `${baseUrl}/${id}/report_regalo`,
        {
            lineas: lineas
                .filter(l => l.aTiqueRegalo > 0)
                .map(l => ({ linea_id: l.id, cantidad: l.aTiqueRegalo }))
        },
        "Error al generar el tique regalo"
    );

export const deletePago: DeletePago = async (id, idPago): Promise<void> => {
    await RestAPI.delete(`${baseUrl}/${id}/pago/${idPago}`, "Error al borrar pago de factura");
};

export const patchVenta: PatchVenta = async (id, venta) => {

    const payload = {
        agente_id: venta.idAgente,
        // fecha: venta.fecha,
        // fecha: venta.fecha,
        // cliente_id: venta.cliente_id,
        // nombre_cliente: venta.nombre_cliente,
        // id_fiscal: venta.id_fiscal,
        // direccion_id: venta.direccion_id,
        // forma_pago_id: venta.forma_pago_id,
        // grupo_iva_negocio_id: venta.grupo_iva_negocio_id,
        // observaciones: venta.observaciones,

    };

    await RestAPI.patch(`${baseUrl}/${id}`, payload,
        'Error al guardar la venta'
    );
};

export const patchFechaVenta: PatchFechaVenta = async (id, fecha) => {

    const payload = {
        cambios: {
            fecha,
        }
    };

    await RestAPI.patch(`${baseUrlFactura}/${id}`, payload,
        'Error al guardar la venta'
    );
};

export const patchCambiarDescuento = async (id: string, dto_porcentual: number): Promise<void> => {
    await RestAPI.patch(`${baseUrl}/${id}`, {
        por_descuento: dto_porcentual,
    }, "Error al cambiar descuento de la venta");
};

export const patchEmitirVenta: PatchEmitirVenta = async (id) => {
    await RestAPI.patch(`${baseUrlFactura}/${id}/emitir`, {}, "Error al emitir la venta");
};

