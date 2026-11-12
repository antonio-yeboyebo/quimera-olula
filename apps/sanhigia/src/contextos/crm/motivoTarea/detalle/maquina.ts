import { Maquina } from "@olula/lib/diseño.js";
import { publicar } from "@olula/lib/dominio.js";
import {
    ContextoDetalleMotivoTarea,
    EstadoDetalleMotivoTarea,
} from "./diseño.ts";
import {
    cambiarMotivoTarea,
    cargarContexto,
    getContextoVacio,
} from "./dominio.ts";

export const getMaquina: () => Maquina<
    EstadoDetalleMotivoTarea,
    ContextoDetalleMotivoTarea
> = () => ({
    INICIAL: {
        motivo_tarea_id_cambiado: cargarContexto,
        motivo_tarea_cambiado: cambiarMotivoTarea,
        edicion_motivo_tarea_cancelada: [
            getContextoVacio,
            publicar("motivo_tarea_deseleccionado", null),
        ],
        borrado_motivo_tarea_solicitado: "BORRANDO",
    },
    BORRANDO: {
        borrado_motivo_tarea_cancelado: "INICIAL",
        motivo_tarea_borrado: [
            getContextoVacio,
            publicar("motivo_tarea_borrado", (_, motivoTareaId) =>
                motivoTareaId
            ),
        ],
    },
});
