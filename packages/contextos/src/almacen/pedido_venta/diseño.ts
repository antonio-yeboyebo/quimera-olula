import { Entidad, Filtro, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export type DisponibilidadPedido = 'total' | 'parcial' | 'sin_stock' | 'en_salida' | 'parcial_salida';

export type DisponibilidadLinea = 'total' | 'parcial' | 'sin_stock' | 'en_salida';

export type PosicionCompetidor = 'delante' | 'detras' | 'en_salida';

export interface CompetidorLinea {
    pedidoId: string;
    codigo: string;
    fecha: Date;
    cliente: string;
    lineaId: string;
    pendiente: number;
    asignado: number;
    posicion: PosicionCompetidor;
    prioritaria: boolean;
}

export interface EstadoLinea {
    lineaId: string;
    pendiente: number;
    asignado: number;
    estado: DisponibilidadLinea;
    prioritaria: boolean;
    competidores: CompetidorLinea[];
}

export interface ItemPedidoVenta extends Entidad {
    id: string;
    fecha: Date;
    cliente: string;
    codigo: string;
    disponibilidad?: DisponibilidadPedido;
}

export interface LineaPedidoVenta extends Entidad {
    id: string;
    referencia: string;
    descripcion: string;
    cantidad: number;
    pvpUnitario: number;
    pvpTotal: number;
    servida: number;
    cerrada: boolean;
    prioritaria: boolean;
}

export interface PedidoVenta extends ItemPedidoVenta {
    observaciones: string;
    lineas: LineaPedidoVenta[];
}

export type GetPedidosVenta = (filtro: Filtro, orden: Orden, paginacion?: Paginacion) => RespuestaLista<ItemPedidoVenta>;

export type GetPedidoVenta = (id: string) => Promise<PedidoVenta>;

export type GenerarSalidaDesdePedidos = (pedidoIds: number[], ubicacionDestinoId: number) => Promise<void>;

export type GenerarSalidaVentaDesdePedidos = (pedidoIds: number[], zonas: number[]) => Promise<string>;

export type CambiarPrioridadLinea = (pedidoId: string, lineaId: string, prioritaria: boolean) => Promise<void>;

export type CambiarPrioridadPedido = (pedidoId: string, prioritaria: boolean) => Promise<void>;

export type ComprobarReservas = (
    zonas: number[],
) => Promise<{ pedido_id: number; estado: DisponibilidadPedido }[]>;

export type ComprobarReservasLineas = (
    pedidoId: string,
    zonas: number[],
) => Promise<EstadoLinea[]>;
