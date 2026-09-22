import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto } from "./detalle.ts";
import { ContextoDetallePedidoCompra, EstadoDetallePedidoCompra } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetallePedidoCompra, ContextoDetallePedidoCompra> = () => {
    return {
        INICIAL: {
            // Cuando llega un nuevo ID (por prop del maestro)
            pedido_id_cambiado: [cargarContexto],

            // Cuando se deselecciona desde el maestro
            pedido_deseleccionado: [
                publicar("pedido_deseleccionado", null),
            ],
        },

        ABIERTO: {
            // Cambio de ID: recarga el pedido
            pedido_id_cambiado: [cargarContexto],

            // Creación de entrada manual: va directamente a la comparativa con líneas vacías
            crear_entrada_solicitado: async (ctx) => ({
                ...ctx,
                estado: "COMPARANDO_ALBARAN" as const,
                lineasDetectadas: ctx.pedido.lineas.map((l) => ({
                    linea_pedido_id: l.id,
                    cantidad: 0,
                    lote_id: null,
                    tipo_caja_id: null,
                    num_cajas: null,
                })),
            }),

            // Apertura del diálogo de lectura de albarán
            leer_albaran_solicitado: "LEYENDO_ALBARAN",
        },

        LEYENDO_ALBARAN: {
            // La foto se analizó correctamente: guarda las líneas detectadas y pasa a comparativa
            foto_analizada: async (ctx, payload) => ({
                ...ctx,
                estado: "COMPARANDO_ALBARAN" as const,
                lineasDetectadas: payload as import("../diseño.ts").LineaNuevaEntradaDesdePedido[],
            }),

            // El usuario canceló la lectura de albarán
            leer_albaran_cancelado: "ABIERTO",
        },

        COMPARANDO_ALBARAN: {
            // La entrada se creó correctamente desde la comparativa
            entrada_creada: async (ctx, payload) => ({
                ...ctx,
                estado: "ENTRADA_CREADA" as const,
                idOrdenCreada: payload as string,
            }),

            // El usuario canceló desde la comparativa
            leer_albaran_cancelado: "ABIERTO",
        },

        ENTRADA_CREADA: {
            // El usuario quiere ver la orden creada (la navegación la hace el componente)
            ver_orden: "ABIERTO",

            // El usuario cierra la confirmación sin navegar
            cerrar_confirmacion: "ABIERTO",
        },
    };
};
