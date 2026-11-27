import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { EstadoImpresora, Impresora } from "../diseño.ts";
import { cargarContexto, guardarEstado, imprimirPrueba, refrescarImpresora } from "./detalle.ts";

export type EstadoDetalleImpresora = "INICIAL" | "ABIERTO" | "COMPROBANDO_ESTADO" | "BORRANDO";

/** `estadoImpresora`: última respuesta de la impresora; null hasta que se pregunta. */
export type ContextoDetalleImpresora = {
    estado: EstadoDetalleImpresora;
    impresora: Impresora;
    estadoImpresora: EstadoImpresora | null;
};

export const getMaquina: () => Maquina<EstadoDetalleImpresora, ContextoDetalleImpresora> = () => ({
    INICIAL: {
        impresora_id_cambiado: [cargarContexto],
        impresora_deseleccionada: [publicar("impresora_deseleccionada", null)],
    },
    ABIERTO: {
        impresora_id_cambiado: [cargarContexto],
        impresora_guardada: [refrescarImpresora],
        estado_solicitado: "COMPROBANDO_ESTADO",
        prueba_solicitada: [imprimirPrueba],
        borrado_solicitado: "BORRANDO",
        impresora_deseleccionada: [publicar("impresora_deseleccionada", null)],
    },
    COMPROBANDO_ESTADO: {
        estado_recibido: [guardarEstado, "ABIERTO"],
        comprobacion_cancelada: "ABIERTO",
    },
    BORRANDO: {
        impresora_borrada: [publicar("impresora_borrada", null), "INICIAL"],
        borrado_cancelado: "ABIERTO",
    },
});
