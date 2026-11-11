import { MetaTabla } from "@olula/componentes/index.js";
import { cambioClienteVentaVacio, clienteVentaVacio, ventaVacia, widgetsDocumentoVenta } from "../venta/dominio.ts";
import { CambioClientePedido, Pedido } from "./diseño.ts";

export const metaTablaPedido: MetaTabla<Pedido> = [
    {
        id: "codigo",
        cabecera: "Código",
    },
    {
        id: "nombre_cliente",
        cabecera: "Cliente",
        render: (p) => p.cliente.nombre_cliente,
    },
    {
        id: "total",
        cabecera: "Total",
        tipo: "moneda",
        divisa: (pedido) => pedido.divisa_id,
    },
];

export const pedidoVacio = (): Pedido => ({
    ...ventaVacia,
    cliente: clienteVentaVacio,
    servido: 'No',
    por_comision: 0,
    fecha_salida: null,
    almacen_id: '',
    nombre_almacen: '',
    lineas: [],
});

export const cambioClientePedidoVacio: CambioClientePedido = cambioClienteVentaVacio;

export const cambioCliente = (pedido: Pedido): CambioClientePedido => ({
    cliente_id: pedido.cliente.cliente_id ?? "",
    direccion_id: pedido.cliente.direccion_id ?? "",
});

export const pedidoEsEditable = (pedido: { servido?: string }): boolean => {
    const servido = pedido.servido?.toUpperCase();
    return servido !== 'TOTAL' && servido !== 'SERVIDO';
};

/** Sin nada servido todavía. El servidor solo admite cambiar o borrar líneas,
 * cambiar el cliente o el grupo de IVA, o borrar el pedido en este estado.
 * El detalle devuelve PENDIENTE/PARCIAL/TOTAL y el listado No/Parcial/Sí. */
export const pedidoPendiente = (pedido: { servido?: string }): boolean => {
    const servido = pedido.servido?.toUpperCase() ?? '';
    return servido === '' || servido === 'PENDIENTE' || servido === 'NO';
};

/** Widgets por defecto del maestro de pedidos (totales según el filtro activo). */
export const widgetsPedido = widgetsDocumentoVenta("ventas.pedido", {
    plural: "Pedidos",
    total: "Importe total",
    medio: "Pedido medio",
});
