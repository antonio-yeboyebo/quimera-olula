import { MovimientoRecibo } from "../recibo_venta/diseño.ts";
import { ReciboCompra } from "./diseño.ts";
import { textoEstado } from "../comun/estados.ts";

/**
 * Estados en los que el recibo admite pago. El servidor manda el estado como
 * texto libre («Emitido» = pendiente), así que se compara sin mayúsculas.
 */
const ESTADOS_PAGABLES = ["emitido", "devuelto"];

const estadoDe = (recibo: { estado: string }) => recibo.estado.trim().toLowerCase();

export const reciboCompraPagable = (recibo: { estado: string }): boolean =>
    ESTADOS_PAGABLES.includes(estadoDe(recibo));

/** Solo un recibo pagado admite devolución. */
export const reciboCompraDevolvible = (recibo: { estado: string }): boolean =>
    estadoDe(recibo) === "pagado";

/** El recibo no está en la divisa de la empresa: el pago y la devolución piden tasa de cambio. */
export const enDivisaExtranjeraCompra = (recibo: ReciboCompra): boolean =>
    !!recibo.divisaEmpresaId && !!recibo.divisaId && recibo.divisaEmpresaId !== recibo.divisaId;

const ordenMovimiento = (a: MovimientoRecibo, b: MovimientoRecibo) =>
    (a.fecha?.getTime() ?? 0) - (b.fecha?.getTime() ?? 0) || Number(a.id) - Number(b.id);

export const ultimoMovimiento = (recibo: ReciboCompra): MovimientoRecibo | null =>
    [...recibo.pagos].sort(ordenMovimiento).at(-1) ?? null;

/**
 * Se puede anular el último pago o devolución, salvo los de una remesa (se
 * deshacen deshaciendo la remesa: el recibo está «Remesado»).
 */
export const reciboCompraAnulable = (recibo: ReciboCompra): boolean =>
    !!ultimoMovimiento(recibo) && estadoDe(recibo) !== "remesado";

/** La devolución sale por la cuenta del último pago. */
export const cuentaUltimoPagoCompra = (
    recibo: ReciboCompra
): { id: string; nombre: string } | null => {
    const pagos = recibo.pagos
        .filter((movimiento) => !movimiento.tipo.trim().toLowerCase().startsWith("devol"))
        .sort(ordenMovimiento);
    const ultimo = pagos[pagos.length - 1];

    return ultimo?.cuentaPagoId
        ? { id: ultimo.cuentaPagoId, nombre: ultimo.nombreCuentaPago }
        : null;
};

/** Estados del recibo de proveedor (`recibosprov.estado`), para el filtro del maestro. */
export const ESTADOS_RECIBO_COMPRA = ["Emitido", "Pagado", "Devuelto", "Remesado"] as const;

/** Por defecto se ven los pendientes, como en recibos de cobro: todos menos los pagados. */
export const ESTADOS_RECIBO_COMPRA_DEFECTO = ESTADOS_RECIBO_COMPRA.filter((estado) => estado !== "Pagado");

export const opcionesEstadoReciboCompra = ESTADOS_RECIBO_COMPRA.map((estado) => ({
    valor: estado,
    get descripcion() { return textoEstado(estado); },
}));
