import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { fechaDesdeApi } from "../comun/infraestructura.js";
import ApiUrls from "../comun/urls.js";
import { MovimientoReciboApi } from "../recibo_venta/infraestructura.js";
import {
    GetReciboCompra,
    GetRecibosCompra,
    MovimientoReciboCompra,
    PatchAnularPagoReciboCompra,
    PatchDevolverReciboCompra,
    PatchPagarReciboCompra,
    ReciboCompra,
} from "./diseño.js";
import { getTraza } from "#/comun/componentes/traza/infraestructura.ts";
import { tTesoreria } from "../i18n/index.ts";

export interface ReciboCompraApi {
    cuenta_domiciliacion_id?: string | null;
    nombre_cuenta_domiciliacion?: string;
    id: string;
    factura_id: string | null;
    codigo: string;
    fecha_emision: string | null;
    fecha_vencimiento: string | null;
    estado: string;
    importe: number;
    proveedor_id: string | null;
    nombre_proveedor: string;
    id_fiscal: string;
    divisa_id?: string;
    divisa_empresa_id?: string | null;
    pagos?: MovimientoReciboApi[];
}

const baseUrl = new ApiUrls().RECIBO_COMPRA;

export const reciboCompraDesdeApi = (api: ReciboCompraApi): ReciboCompra => ({
    cuentaDomiciliacionId: api.cuenta_domiciliacion_id ?? null,
    nombreCuentaDomiciliacion: api.nombre_cuenta_domiciliacion ?? "",
    id: api.id,
    facturaId: api.factura_id,
    codigo: api.codigo,
    fechaEmision: fechaDesdeApi(api.fecha_emision),
    fechaVencimiento: fechaDesdeApi(api.fecha_vencimiento),
    estado: api.estado,
    importe: api.importe,
    proveedorId: api.proveedor_id,
    nombreProveedor: api.nombre_proveedor,
    idFiscal: api.id_fiscal,
    divisaId: api.divisa_id ?? "",
    divisaEmpresaId: api.divisa_empresa_id ?? null,
    pagos: (api.pagos ?? []).map((pago) => ({
        id: pago.id,
        fecha: fechaDesdeApi(pago.fecha),
        tipo: pago.tipo,
        estado: pago.estado,
        cuentaPagoId: pago.cuenta_pago_id ?? "",
        nombreCuentaPago: pago.nombre_cuenta_pago ?? "",
        // Los pagos de proveedor no pasan por pasarela (Stripe).
        pasarela: null,
        modoPasarela: null,
        urlPanel: null,
        incidenciaPasarela: null,
    })),
});

export const getReciboCompra: GetReciboCompra = async (id) => {
    return await RestAPI.getItem<ReciboCompra, ReciboCompraApi>(
        `${baseUrl}/${id}`,
        reciboCompraDesdeApi,
        tTesoreria("recibo_compra.errorAlObtenerElReciboDe")
    );
};

export const getRecibosCompra: GetRecibosCompra = async (criteria) => {
    return await RestAPI.getQuery<ReciboCompra, ReciboCompraApi>(
        baseUrl,
        criteria,
        reciboCompraDesdeApi,
        tTesoreria("recibo_compra.errorAlObtenerLosRecibosDe")
    );
};

export const getTrazaReciboCompra = (id: string): Promise<unknown> => getTraza(`${baseUrl}/${id}`);

export type OrdenPagoReciboCompraApi = {
    /** Solo si `requiere_autorizacion`: página del banco donde autorizar el pago. */
    url: string | null;
    pago_id: string;
    referencia: string;
    requiere_autorizacion: boolean;
    ordenante: { nombre: string; iban: string };
    beneficiario: { nombre: string; iban: string };
};

/** La empresa paga el recibo al proveedor desde su cuenta `cuentaBancoId`. */
export const postOrdenarPagoReciboCompra = async (
    id: string,
    cuentaBancoId: string,
): Promise<OrdenPagoReciboCompraApi> => {
    return await RestAPI.query(
        `${baseUrl}/${id}/ordenar_pago`,
        { cuenta_banco_id: cuentaBancoId },
        tTesoreria("recibo_compra.errorAlOrdenarElPagoAl")
    );
};

const movimientoApi = (movimiento: MovimientoReciboCompra) => ({
    cuenta_pago_id: movimiento.cuentaPagoId,
    fecha: movimiento.fecha,
    ...(movimiento.tasaConversion !== undefined && {
        tasa_conversion: String(movimiento.tasaConversion),
    }),
});

/** TES-02: pago manual del recibo, sin pasar por el banco. */
export const patchPagarReciboCompra: PatchPagarReciboCompra = async (id, pago) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/pagar`,
        movimientoApi(pago),
        tTesoreria("recibo_compra.errorAlPagarElReciboDe")
    );
};

export const patchDevolverReciboCompra: PatchDevolverReciboCompra = async (id, devolucion) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/devolver`,
        movimientoApi(devolucion),
        tTesoreria("recibo_compra.errorAlDevolverElReciboDe")
    );
};

/** Borra el último pago o devolución del recibo y su asiento. */
export const patchAnularPagoReciboCompra: PatchAnularPagoReciboCompra = async (id) => {
    await RestAPI.patch(
        `${baseUrl}/${id}/anular_pago`,
        {},
        tTesoreria("recibo_compra.errorAlAnularElUltimoPago")
    );
};

/** TES-06: vencimiento, cuenta de domiciliación e importe (si baja, el recibo se divide). */
export const patchCambiarReciboCompra = async (
    id: string,
    cambios: { fechaVencimiento: string; cuentaDomiciliacionId: string; importe?: number },
): Promise<void> => {
    await RestAPI.patch(
        `${baseUrl}/${id}`,
        {
            fecha_vencimiento: cambios.fechaVencimiento,
            cuenta_domiciliacion_id: cambios.cuentaDomiciliacionId,
            ...(cambios.importe !== undefined && { importe: String(cambios.importe) }),
        },
        tTesoreria("recibo_compra.errorAlGuardarElRecibo")
    );
};
