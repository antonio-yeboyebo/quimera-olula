import { getTraza } from "#/comun/componentes/traza/infraestructura.js";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { fechaDesdeApi } from "../comun/infraestructura.js";
import ApiUrls from "../comun/urls.js";
import { AgruparRecibosVenta, DesagruparReciboVenta, GetReciboVenta, GetRecibosVenta, MovimientoRecibo, PatchDevolverReciboVenta, PatchPagarReciboVenta, ReciboVenta } from "./diseño.js";

export interface MovimientoReciboApi {
    id: string;
    fecha: string | null;
    tipo: string;
    estado: boolean;
    cuenta_pago_id?: string | null;
    nombre_cuenta_pago?: string | null;
    pasarela?: string | null;
    modo_pasarela?: "test" | "live" | null;
    url_panel?: string | null;
    incidencia_pasarela?: string | null;
}

export interface ReciboVentaApi {
    id: string;
    factura_id: string | null;
    grupo_id: string | null;
    codigo: string;
    fecha_emision: string | null;
    fecha_vencimiento: string | null;
    estado: string;
    importe: number;
    cliente_id: string;
    nombre_cliente: string;
    id_fiscal: string;
    divisa_id?: string;
    divisa_empresa_id?: string | null;
    pagos?: MovimientoReciboApi[];
    recibos_agrupados?: ReciboVentaApi[];
}

const baseUrl = new ApiUrls().RECIBO_VENTA;

const movimientoReciboDesdeApi = (api: MovimientoReciboApi): MovimientoRecibo => ({
    id: api.id,
    fecha: fechaDesdeApi(api.fecha),
    tipo: api.tipo,
    estado: api.estado,
    cuentaPagoId: api.cuenta_pago_id ?? "",
    nombreCuentaPago: api.nombre_cuenta_pago ?? "",
    pasarela: api.pasarela ?? null,
    modoPasarela: api.modo_pasarela ?? null,
    urlPanel: api.url_panel ?? null,
    incidenciaPasarela: api.incidencia_pasarela ?? null,
});

export const reciboVentaDesdeApi = (api: ReciboVentaApi): ReciboVenta => ({
    id: api.id,
    facturaId: api.factura_id ?? "",
    grupoId: api.grupo_id ?? "",
    codigo: api.codigo,
    fechaEmision: fechaDesdeApi(api.fecha_emision),
    fechaVencimiento: fechaDesdeApi(api.fecha_vencimiento),
    estado: api.estado,
    importe: api.importe,
    clienteId: api.cliente_id,
    nombreCliente: api.nombre_cliente,
    idFiscal: api.id_fiscal,
    divisaId: api.divisa_id ?? "",
    divisaEmpresaId: api.divisa_empresa_id ?? null,
    pagos: (api.pagos ?? []).map(movimientoReciboDesdeApi),
    recibosAgrupados: (api.recibos_agrupados ?? []).map(reciboVentaDesdeApi),
});

export const getReciboVenta: GetReciboVenta = async (id) => {
    return await RestAPI.getItem<ReciboVenta, ReciboVentaApi>(
        `${baseUrl}/${id}`,
        reciboVentaDesdeApi,
        "Error al obtener el recibo de cobro"
    );
};

export const getRecibosVenta: GetRecibosVenta = async (criteria) => {
    return await RestAPI.getQuery<ReciboVenta, ReciboVentaApi>(
        baseUrl,
        criteria,
        reciboVentaDesdeApi,
        "Error al obtener los recibos de cobro"
    );
};

export type EnlaceCobroReciboVentaApi = {
    url: string;
    pago_id: string;
    referencia: string;
    pagador: { nombre: string };
    beneficiario: { nombre: string; iban: string };
};

/** Enlace para que el cliente del recibo pague a la empresa en `cuentaBancoId`. */
export const postEnlaceCobroReciboVenta = async (
    id: string,
    cuentaBancoId: string,
): Promise<EnlaceCobroReciboVentaApi> => {
    return await RestAPI.query(
        `${baseUrl}/${id}/enlace_cobro`,
        { cuenta_banco_id: cuentaBancoId },
        "Error al generar el enlace de cobro"
    );
};

export const patchPagarReciboVenta: PatchPagarReciboVenta = async (id, pago) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/pagar`,
        {
            cuenta_pago_id: pago.cuentaPagoId,
            fecha: pago.fecha,
            ...(pago.tasaConversion !== undefined && { tasa_conversion: String(pago.tasaConversion) }),
        },
        "Error al pagar el recibo de cobro"
    );
};

export const patchDevolverReciboVenta: PatchDevolverReciboVenta = async (id, devolucion) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/devolver`,
        {
            cuenta_pago_id: devolucion.cuentaPagoId,
            fecha: devolucion.fecha,
            ...(devolucion.tasaConversion !== undefined && {
                tasa_conversion: String(devolucion.tasaConversion),
            }),
            ...(devolucion.reembolsarEnPasarela && { reembolsar_en_pasarela: true }),
        },
        "Error al devolver el recibo de cobro"
    );
};

export const agruparRecibosVenta: AgruparRecibosVenta = async (id, reciboIds) => {
    const respuesta = (await RestAPI.patch(
        `${baseUrl}/${id}/agrupar`,
        { recibo_ids: reciboIds },
        "Error al agrupar los recibos"
    )) as unknown as { grupo_id: string };

    return respuesta.grupo_id;
};

export const desagruparReciboVenta: DesagruparReciboVenta = async (id) => {
    const respuesta = (await RestAPI.patch(
        `${baseUrl}/${id}/desagrupar`,
        {},
        "Error al deshacer la agrupación"
    )) as unknown as { grupo_id: string };

    return respuesta.grupo_id;
};

export const getTrazaReciboVenta = (id: string): Promise<unknown> => getTraza(`${baseUrl}/${id}`);
