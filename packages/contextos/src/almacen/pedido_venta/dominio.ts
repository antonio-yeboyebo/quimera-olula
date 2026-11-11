import { plugin } from "@olula/lib/dominio.js";
import { CompetidorLinea, DisponibilidadPedido, EstadoLinea, ItemPedidoVenta, LineaPedidoVenta, PedidoVenta, PosicionCompetidor } from "./diseño.ts";

export const itemPedidoVentaVacio: ItemPedidoVenta = {
    id: "",
    fecha: new Date(0),
    cliente: "",
    codigo: "",
};

export const lineaPedidoVentaVacia: LineaPedidoVenta = {
    id: "",
    referencia: "",
    descripcion: "",
    cantidad: 0,
    pvpUnitario: 0,
    pvpTotal: 0,
    servida: 0,
    cerrada: false,
    prioritaria: false,
};

export const pedidoVentaVacio: PedidoVenta = {
    ...itemPedidoVentaVacio,
    observaciones: "",
    lineas: [],
};

export const ESTILO_DISPONIBILIDAD: Record<DisponibilidadPedido, { label: string; color: string }> = {
    total:          { label: '✓ Total',        color: '#22c55e' },
    parcial:        { label: '~ Parcial',      color: '#f59e0b' },
    sin_stock:      { label: '✗ Sin stock',    color: '#ef4444' },
    en_salida:      { label: '↗ En salida',    color: '#3b82f6' },
    parcial_salida: { label: '↗ Parc. salida', color: '#8b5cf6' },
};

export const ETIQUETA_POSICION: Record<PosicionCompetidor, string> = {
    en_salida: 'En salida',
    delante: 'Delante',
    detras: 'Detrás',
};

export const estadosPorLinea = (estados: EstadoLinea[]): Record<string, EstadoLinea> =>
    Object.fromEntries(estados.map((e) => [e.lineaId, e]));

export type FilaCompetencia = Omit<CompetidorLinea, 'posicion'> & {
    id: string;
    posicion: PosicionCompetidor | 'propia';
};

const ORDEN_POSICION: Record<FilaCompetencia['posicion'], number> = {
    en_salida: 0,
    delante: 1,
    propia: 2,
    detras: 3,
};

/** Competidores de la línea en orden de prioridad, con la propia línea
 * intercalada en su sitio (tras los que van delante y antes de los de detrás). */
export const filasCompetencia = (pedido: ItemPedidoVenta, estado: EstadoLinea): FilaCompetencia[] => {
    const propia: FilaCompetencia = {
        id: estado.lineaId,
        pedidoId: pedido.id,
        codigo: pedido.codigo,
        fecha: pedido.fecha,
        cliente: pedido.cliente,
        lineaId: estado.lineaId,
        pendiente: estado.pendiente,
        asignado: estado.asignado,
        prioritaria: estado.prioritaria,
        posicion: 'propia',
    };
    const competidores: FilaCompetencia[] = estado.competidores.map((c) => ({ ...c, id: c.lineaId }));
    // sort es estable: dentro de cada grupo se mantiene el orden del servidor
    return [...competidores, propia].sort(
        (a, b) => ORDEN_POSICION[a.posicion] - ORDEN_POSICION[b.posicion]
    );
};

/** La prioridad de líneas solo existe con el plugin SGA activo. */
export const prioridadDisponible = (): boolean => plugin("sga") === "activo";

export const hayLineasPrioritarias = (pedido: PedidoVenta): boolean =>
    pedido.lineas.some((l) => l.prioritaria);
