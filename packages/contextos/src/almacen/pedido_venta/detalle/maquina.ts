import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { abrirPedidoCompetidor, activarLinea, cambiarPrioridadDeLinea, cambiarPrioridadDePedido, cargarContexto, cerrarPedidoCompetidor } from "./detalle.ts";
import { ContextoDetallePedidoVenta, EstadoDetallePedidoVenta } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetallePedidoVenta, ContextoDetallePedidoVenta> = () => {
    return {
        INICIAL: {
            pedido_id_cambiado: [cargarContexto],
            pedido_deseleccionado: [
                publicar("pedido_deseleccionado", null),
            ],
        },
        ABIERTO: {
            pedido_id_cambiado: [cargarContexto],
            linea_seleccionada: [activarLinea],
            pedido_competidor_solicitado: [abrirPedidoCompetidor],
            prioridad_linea_solicitada: [cambiarPrioridadDeLinea, publicar("prioridad_cambiada", null)],
            prioridad_pedido_solicitada: [cambiarPrioridadDePedido, publicar("prioridad_cambiada", null)],
            pedido_deseleccionado: [
                publicar("pedido_deseleccionado", null),
            ],
        },
        VIENDO_PEDIDO_COMPETIDOR: {
            pedido_id_cambiado: [cargarContexto],
            pedido_competidor_cerrado: [cerrarPedidoCompetidor],
        },
    };
};
