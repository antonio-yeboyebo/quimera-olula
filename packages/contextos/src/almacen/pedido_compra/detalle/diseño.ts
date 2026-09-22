import { LineaNuevaEntradaDesdePedido, PedidoCompra } from "../diseño.ts";

/**
 * Estados posibles en la vista de detalle.
 * INICIAL: sin pedido cargado.
 * ABIERTO: mostrando el pedido.
 * CREANDO_ENTRADA: modal de creación de entrada desde pedido activo.
 * ENTRADA_CREADA: modal de confirmación tras crear la entrada, con opción de navegar a la orden.
 * LEYENDO_ALBARAN: modal de selección de foto para análisis IA.
 * COMPARANDO_ALBARAN: modal de comparativa entre líneas del pedido y lo detectado.
 */
export type EstadoDetallePedidoCompra = "INICIAL" | "ABIERTO" | "ENTRADA_CREADA" | "LEYENDO_ALBARAN" | "COMPARANDO_ALBARAN";

/**
 * Contexto del detalle (visualización de un pedido de compra)
 */
export type ContextoDetallePedidoCompra = {
    estado: EstadoDetallePedidoCompra;
    pedido: PedidoCompra;
    idOrdenCreada: string;
    lineasDetectadas: LineaNuevaEntradaDesdePedido[];
};
