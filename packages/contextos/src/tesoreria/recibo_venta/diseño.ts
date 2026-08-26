import { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.ts";

export interface ReciboVenta extends Entidad {
    id: string;
    facturaId: string;
    codigo: string;
    fechaEmision: Date | null;
    fechaVencimiento: Date | null;
    estado: string;
    importe: number;
    clienteId: string;
    idFiscal: string;
}

export type GetReciboVenta = (id: string) => Promise<ReciboVenta>;

export type GetRecibosVenta = (criteria: Criteria) => RespuestaLista<ReciboVenta>;

export type PagoReciboVenta = {
    cuentaPagoId: string;
    fecha: string;
};

export type PatchPagarReciboVenta = (id: string, pago: PagoReciboVenta) => Promise<void>;
