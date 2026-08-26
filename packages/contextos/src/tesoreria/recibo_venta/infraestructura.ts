import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { fechaDesdeApi } from "../comun/infraestructura.js";
import ApiUrls from "../comun/urls.js";
import { GetReciboVenta, GetRecibosVenta, PatchPagarReciboVenta, ReciboVenta } from "./diseño.js";

export interface ReciboVentaApi {
    id: string;
    factura_id: string;
    codigo: string;
    fecha_emision: string | null;
    fecha_vencimiento: string | null;
    estado: string;
    importe: number;
    cliente_id: string;
    id_fiscal: string;
}

const baseUrl = new ApiUrls().RECIBO_VENTA;

export const reciboVentaDesdeApi = (api: ReciboVentaApi): ReciboVenta => ({
    id: api.id,
    facturaId: api.factura_id,
    codigo: api.codigo,
    fechaEmision: fechaDesdeApi(api.fecha_emision),
    fechaVencimiento: fechaDesdeApi(api.fecha_vencimiento),
    estado: api.estado,
    importe: api.importe,
    clienteId: api.cliente_id,
    idFiscal: api.id_fiscal,
});

export const getReciboVenta: GetReciboVenta = async (id) => {
    return await RestAPI.getItem<ReciboVenta, ReciboVentaApi>(
        `${baseUrl}/${id}`,
        reciboVentaDesdeApi,
        "Error al obtener el recibo de venta"
    );
};

export const getRecibosVenta: GetRecibosVenta = async (criteria) => {
    return await RestAPI.getQuery<ReciboVenta, ReciboVentaApi>(
        baseUrl,
        criteria,
        reciboVentaDesdeApi,
        "Error al obtener los recibos de venta"
    );
};

export const patchPagarReciboVenta: PatchPagarReciboVenta = async (id, pago) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/pagar`,
        {
            cuenta_pago_id: pago.cuentaPagoId,
            fecha: pago.fecha,
        },
        "Error al pagar el recibo de venta"
    );
};
