import { Entidad, Filtro, Modelo, Orden, Paginacion, RespuestaLista } from "@olula/lib/diseño.ts";

export type TipoOrden = "ENTRADA" | "SALIDA" | "TRASPASO";

export interface ItemPedidoCompra extends Entidad {
    id: string;
    fecha: Date;
    proveedor: string;
    proveedorId: string;
    codigo: string;
}

export interface LineaPedidoCompra extends Entidad {
    id: string;
    articuloId: string;
    sku: string;
    descripcion: string;
    cantidad: number;
    cantidadRecibida: number;
    cerrada: boolean;
    porLotes: boolean;
}

export interface PedidoCompra extends ItemPedidoCompra {
    lineas: LineaPedidoCompra[];
}

export interface LineaNuevaEntradaDesdePedido {
    linea_pedido_id: string;
    cantidad: number;
    lote_id: string | null;
    tipo_caja_id: string | null;
    num_cajas: number | null;
}

export interface NuevaEntradaDesdePedido extends Modelo {
    pedidoCompraId: string;
    ubicacionId: string;
    lineas?: LineaNuevaEntradaDesdePedido[];
}

export type GetPedidos = (filtro: Filtro, orden: Orden, paginacion?: Paginacion) => RespuestaLista<ItemPedidoCompra>;

export type GetPedido = (id: string) => Promise<PedidoCompra>;

export type PostEntradaDesdePedido = (nueva: NuevaEntradaDesdePedido) => Promise<string>;

export type GetInfoLineasPedidoCompra = (pedidoCompraId: string, foto: File) => Promise<LineaNuevaEntradaDesdePedido[]>;
