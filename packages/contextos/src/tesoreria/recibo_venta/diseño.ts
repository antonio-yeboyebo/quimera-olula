import { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.ts";

export interface MovimientoRecibo extends Entidad {
    id: string;
    fecha: Date | null;
    tipo: string;
    estado: boolean;
    cuentaPagoId: string;
    nombreCuentaPago: string;
    /** Pasarela (Stripe) por la que pasó el pago o su reembolso; null si no. */
    pasarela: string | null;
    modoPasarela: "test" | "live" | null;
    /** El pago en el panel de la pasarela. */
    urlPanel: string | null;
    incidenciaPasarela: string | null;
}

export interface ReciboVenta extends Entidad {
    id: string;
    facturaId: string;
    grupoId: string;
    codigo: string;
    fechaEmision: Date | null;
    fechaVencimiento: Date | null;
    estado: string;
    importe: number;
    clienteId: string;
    nombreCliente: string;
    idFiscal: string;
    divisaId: string;
    /** Divisa de la empresa: si es otra, cobrar o devolver pide la tasa de cambio. */
    divisaEmpresaId: string | null;
    pagos: MovimientoRecibo[];
    recibosAgrupados: ReciboVenta[];
}

export type GetReciboVenta = (id: string) => Promise<ReciboVenta>;

export type GetRecibosVenta = (criteria: Criteria) => RespuestaLista<ReciboVenta>;

export type PagoReciboVenta = {
    cuentaPagoId: string;
    fecha: string;
    tasaConversion?: number;
};

export type PatchPagarReciboVenta = (id: string, pago: PagoReciboVenta) => Promise<void>;

export type AgruparRecibosVenta = (id: string, reciboIds: string[]) => Promise<string>;

export type DesagruparReciboVenta = (id: string) => Promise<string>;

export type DevolucionReciboVenta = {
    cuentaPagoId: string;
    fecha: string;
    tasaConversion?: number;
    /** Devolver también el dinero en Stripe (recibo cobrado con tarjeta). */
    reembolsarEnPasarela?: boolean;
};

export type PatchDevolverReciboVenta = (id: string, devolucion: DevolucionReciboVenta) => Promise<void>;
