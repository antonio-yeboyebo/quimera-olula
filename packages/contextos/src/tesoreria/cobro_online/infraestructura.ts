import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { CobroOnline, CobroQr, EnlacePago, ReembolsoPasarela } from "./diseño.ts";

interface EnlacePagoApi {
    id: string;
    url: string;
    estado: EnlacePago["estado"];
    importe: number | string;
    divisa_id: string;
    modo: "test" | "live";
    enviado_a: string | null;
}

interface CobroOnlineApi {
    id: string;
    url: string | null;
    estado: CobroOnline["estado"];
    importe: number;
    importe_reembolsado: number | null;
    divisa_id: string;
    modo: "test" | "live";
    incidencia: string | null;
    creado_en: string;
    pagado_en: string | null;
    url_panel?: string | null;
}

export const enlacePagoDesdeApi = (r: EnlacePagoApi): EnlacePago => ({
    id: r.id,
    url: r.url,
    estado: r.estado,
    importe: Number(r.importe),
    divisaId: r.divisa_id,
    modo: r.modo,
    enviadoA: r.enviado_a ?? null,
});

export const cobroOnlineDesdeApi = (r: CobroOnlineApi): CobroOnline => ({
    id: r.id,
    url: r.url,
    estado: r.estado,
    importe: r.importe,
    importeReembolsado: r.importe_reembolsado,
    divisaId: r.divisa_id,
    modo: r.modo,
    incidencia: r.incidencia,
    creadoEn: r.creado_en,
    pagadoEn: r.pagado_en,
    urlPanel: r.url_panel ?? null,
});

const postEnlace = async (url: string, email?: string): Promise<EnlacePago> => {
    const r = (await RestAPI.post(
        url,
        email ? { email } : {},
        email ? "Error al enviar el enlace de pago" : "Error al generar el enlace de pago",
    )) as unknown as EnlacePagoApi;
    return enlacePagoDesdeApi(r);
};

const getCobros = async (url: string): Promise<CobroOnline[]> => {
    const r = await RestAPI.get<{ datos: CobroOnlineApi[] }>(url, "Error al leer los cobros con tarjeta");
    return r.datos.map(cobroOnlineDesdeApi);
};

export const postEnlacePagoRecibo = (reciboId: string, email?: string) =>
    postEnlace(`/tesoreria/recibo_cobro/${reciboId}/enlace_pago`, email);

export const postEnlacePagoFactura = (facturaId: string, email?: string) =>
    postEnlace(`/ventas/factura/${facturaId}/enlace_pago`, email);

export const getCobrosOnlineFactura = (facturaId: string) =>
    getCobros(`/ventas/factura/${facturaId}/cobros_online`);

interface ReembolsoPasarelaApi {
    cobro_id: string;
    importe: number | string;
    divisa_id: string;
    modo: "test" | "live";
    total: boolean;
}

export const reembolsoPasarelaDesdeApi = (r: ReembolsoPasarelaApi | null): ReembolsoPasarela | null =>
    r && {
        cobroId: r.cobro_id,
        importe: Number(r.importe),
        divisaId: r.divisa_id,
        modo: r.modo,
        total: r.total,
    };

/** Si al devolver el recibo se puede devolver también el dinero en Stripe; null si no. */
export const getReembolsoPasarelaRecibo = async (reciboId: string): Promise<ReembolsoPasarela | null> =>
    reembolsoPasarelaDesdeApi((await RestAPI.get<{ datos: ReembolsoPasarelaApi | null }>(
        `/tesoreria/recibo_cobro/${reciboId}/reembolso_pasarela`,
        "Error al consultar el reembolso con tarjeta",
    )).datos);

interface CobroQrApi {
    id: string;
    url: string | null;
    estado: CobroQr["estado"];
    importe: number | string;
    divisa_id: string;
    modo: "test" | "live";
    incidencia?: string | null;
}

export const cobroQrDesdeApi = (r: CobroQrApi): CobroQr => ({
    id: r.id,
    url: r.url,
    estado: r.estado,
    importe: Number(r.importe),
    divisaId: r.divisa_id,
    modo: r.modo,
    incidencia: r.incidencia ?? null,
});

/** Sesión de pago por el pendiente de la venta, para mostrarla como QR. */
export const postCobroQr = async (ventaId: string): Promise<CobroQr> =>
    cobroQrDesdeApi((await RestAPI.post(
        `/tpv/venta/${ventaId}/cobro_qr`, {}, "Error al generar el QR de pago",
    )) as unknown as CobroQrApi);

/** Estado del QR; `pagado` cuando el pago de la venta ya está creado. */
export const getCobroQr = async (cobroId: string): Promise<CobroQr> =>
    cobroQrDesdeApi((await RestAPI.get<{ datos: CobroQrApi }>(
        `/tpv/cobro_qr/${cobroId}`, "Error al consultar el pago con QR",
    )).datos);

/** El cliente desiste: el QR deja de admitir pagos. */
export const postCancelarCobroQr = async (cobroId: string): Promise<CobroQr> =>
    cobroQrDesdeApi((await RestAPI.post(
        `/tpv/cobro_qr/${cobroId}/cancelar`, {}, "Error al cancelar el pago con QR",
    )) as unknown as CobroQrApi);
