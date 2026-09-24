import { ItemPedidoCompra, LineaPedidoCompra, PedidoCompra } from "./diseño.ts";

export const lineaPedidoCompraVacia: LineaPedidoCompra = {
    id: "",
    articuloId: "",
    sku: "",
    descripcion: "",
    cantidad: 0,
    cantidadRecibida: 0,
    cerrada: false,
    porLotes: false,
};

export const itemPedidoCompraVacio: ItemPedidoCompra = {
    id: "",
    fecha: new Date(0),
    proveedor: "",
    proveedorId: "",
    codigo: "",
};

export const pedidoCompraVacio: PedidoCompra = {
    ...itemPedidoCompraVacio,
    lineas: [],
};
