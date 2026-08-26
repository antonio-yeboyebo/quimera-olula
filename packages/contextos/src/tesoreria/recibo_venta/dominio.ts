import { ReciboVenta } from "./diseño.ts";

/**
 * Estados en los que el recibo admite cobro. El servidor manda el estado como
 * texto libre, así que se compara sin distinguir mayúsculas ni espacios.
 */
const ESTADOS_PAGABLES = ["emitido", "devuelto"];

export const reciboPagable = (recibo: ReciboVenta): boolean =>
    ESTADOS_PAGABLES.includes(recibo.estado.trim().toLowerCase());
