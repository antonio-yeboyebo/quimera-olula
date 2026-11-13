import { ReciboVenta } from "../diseño.js";

export type EstadoDetalleReciboVenta =
    | 'INICIAL'
    | 'ABIERTO' | 'VIENDO_TRAZA'
    | 'PAGANDO'
    | 'ENLACE_COBRO'
    | 'ENLACE_TARJETA'
    | 'DESAGRUPANDO'
    | 'DEVOLVIENDO';

export type ContextoDetalleReciboVenta = {
    estado: EstadoDetalleReciboVenta;
    recibo: ReciboVenta;
};
