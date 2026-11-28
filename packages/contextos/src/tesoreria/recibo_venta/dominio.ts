import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { MovimientoRecibo, ReciboVenta } from "./diseño.ts";
import { textoEstado } from "../comun/estados.ts";

/**
 * Estados en los que el recibo admite cobro. El servidor manda el estado como
 * texto libre, así que se compara sin distinguir mayúsculas ni espacios.
 */
const ESTADOS_PAGABLES = ["emitido", "devuelto"];

/** El recibo no está en la divisa de la empresa: el cobro y la devolución piden tasa de cambio. */
export const enDivisaExtranjera = (recibo: ReciboVenta): boolean =>
    !!recibo.divisaEmpresaId && !!recibo.divisaId && recibo.divisaEmpresaId !== recibo.divisaId;

export const reciboPagable = (recibo: ReciboVenta): boolean =>
    ESTADOS_PAGABLES.includes(recibo.estado.trim().toLowerCase());

/** Solo un recibo cobrado admite devolución. */
export const reciboDevolvible = (recibo: ReciboVenta): boolean =>
    recibo.estado.trim().toLowerCase() === "pagado";

const esDevolucion = (movimiento: MovimientoRecibo): boolean =>
    movimiento.tipo.trim().toLowerCase().startsWith("devol");

/**
 * Cuenta del último pago del recibo. La devolución tiene que salir por la
 * misma cuenta por la que se cobró. No se filtra por `estado`: el servidor
 * lo rellena con `pagosdevolcli.editable`, que solo marca el último movimiento.
 */
export const cuentaUltimoPago = (
    recibo: ReciboVenta
): { id: string; nombre: string } | null => {
    const pagos = recibo.pagos
        .filter((movimiento) => !esDevolucion(movimiento))
        .sort((a, b) => (a.fecha?.getTime() ?? 0) - (b.fecha?.getTime() ?? 0));
    const ultimo = pagos[pagos.length - 1];

    return ultimo?.cuentaPagoId
        ? { id: ultimo.cuentaPagoId, nombre: ultimo.nombreCuentaPago }
        : null;
};

export const puedenAgruparse = (recibos: ReciboVenta[]): boolean =>
    recibos.length > 0 &&
    recibos.every((recibo) => !recibo.grupoId) &&
    recibos.every((recibo) => recibo.clienteId === recibos[0].clienteId);

export const yaAgrupados = (recibos: ReciboVenta[]): ReciboVenta[] =>
    recibos.filter((recibo) => !!recibo.grupoId);

const PREFIJO_GRUPO = "GRC";

export const esGrupoDeRecibos = (recibo: ReciboVenta): boolean =>
    !recibo.facturaId &&
    recibo.codigo.trim().toUpperCase().startsWith(PREFIJO_GRUPO);

export const reciboDesagrupable = (recibo: ReciboVenta): boolean =>
    esGrupoDeRecibos(recibo) && recibo.estado.trim().toLowerCase() === "emitido";

export const ESTADOS_RECIBO_VENTA = [
    "Emitido",
    "Pagado",
    "Devuelto",
    "Agrupado",
    "Remesado",
] as const;

export const ESTADOS_RECIBO_VENTA_DEFECTO = ESTADOS_RECIBO_VENTA.filter(
    (estado) => estado !== "Pagado" && estado !== "Agrupado"
);

export const opcionesEstadoReciboVenta = ESTADOS_RECIBO_VENTA.map((estado) => ({
    valor: estado,
    get descripcion() { return textoEstado(estado); },
}));

const comoLista = (valor: unknown): string[] =>
    Array.isArray(valor)
        ? valor.map(String).filter(Boolean)
        : typeof valor === "string"
            ? valor.split(",").map((v) => v.trim()).filter(Boolean)
            : [];

export const filtroEstadoReciboVenta = (valor: unknown): ClausulaFiltro | null => {
    const estados = comoLista(valor);
    if (!estados.length) return null;

    return ["estado", "in", estados as unknown as string] as ClausulaFiltro;
};

export const estadosDesdeFiltro = (filtro: ClausulaFiltro[]): string[] => {
    const clausula = filtro.find(([campo, operador]) => campo === "estado" && operador === "in");

    return clausula ? comoLista(clausula[2]) : [];
};

export type VarianteEstado = "neutro" | "error" | "exito" | "advertencia" | "gris";

const VARIANTES_ESTADO_RECIBO_VENTA: Record<string, VarianteEstado> = {
    emitido: "neutro",
    devuelto: "error",
    pagado: "exito",
    remesado: "advertencia",
    agrupado: "gris",
};

// Sin estado en las filas de relleno que pinta el listado mientras carga.
export const varianteEstadoReciboVenta = (estado: string | undefined): VarianteEstado =>
    VARIANTES_ESTADO_RECIBO_VENTA[(estado ?? "").trim().toLowerCase()] ?? "neutro";
