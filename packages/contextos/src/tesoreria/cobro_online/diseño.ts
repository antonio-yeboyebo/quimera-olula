/** Cobros con tarjeta por la pasarela de pago (plugin `stripe`).
 * Ver comandos/tesoreria/cobro_online en el servidor. */

export type EstadoCobroOnline = "pendiente" | "pagado" | "cancelado" | "caducado" | "reembolsado";

export interface EnlacePago {
    id: string;
    /** Enlace permanente que se comparte con el cliente. */
    url: string;
    estado: EstadoCobroOnline;
    importe: number;
    divisaId: string;
    modo: "test" | "live";
    /** Email al que se ha enviado, si se pidió enviarlo. */
    enviadoA: string | null;
}

export interface CobroOnline {
    id: string;
    url: string | null;
    estado: EstadoCobroOnline;
    importe: number;
    importeReembolsado: number | null;
    divisaId: string;
    modo: "test" | "live";
    incidencia: string | null;
    creadoEn: string;
    pagadoEn: string | null;
    /** El pago en el panel de la pasarela (Stripe), para comprobarlo. */
    urlPanel: string | null;
}

/** Crea (o recupera) el enlace del documento y, con email, lo envía. */
export type GenerarEnlacePago = (email?: string) => Promise<EnlacePago>;

export type GetCobrosOnline = () => Promise<CobroOnline[]>;

/** Lo que se devolvería en la pasarela al devolver un recibo cobrado con tarjeta. */
export interface ReembolsoPasarela {
    cobroId: string;
    importe: number;
    divisaId: string;
    modo: "test" | "live";
    /** Devuelve todo el cobro; si no, solo la parte del recibo (cobro de una factura). */
    total: boolean;
}

/** QR del TPV: la URL es la página de pago de la pasarela. */
export interface CobroQr {
    id: string;
    url: string | null;
    estado: EstadoCobroOnline;
    importe: number;
    divisaId: string;
    modo: "test" | "live";
    incidencia: string | null;
}
