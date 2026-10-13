import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroHitlCola, EstadoMaestroHitlCola } from "./diseño.js";
import { cambiarFiltroEstado, quitarTareaActiva, recargarTareas, Tareas } from "./maestro.js";

export const getMaquina: () => Maquina<EstadoMaestroHitlCola, ContextoMaestroHitlCola> = () => {
    return {
        INICIAL: {
            tarea_seleccionada: [Tareas.activar],
            tarea_deseleccionada: [Tareas.desactivar],

            recarga_solicitada: recargarTareas,

            filtro_estado_cambiado: [cambiarFiltroEstado],

            resolver_solicitado: 'RESOLVIENDO',
            rechazar_solicitado: 'RECHAZANDO',
        },

        RESOLVIENDO: {
            tarea_resuelta: [quitarTareaActiva, recargarTareas, 'INICIAL'],
            resolucion_cancelada: 'INICIAL',
        },

        RECHAZANDO: {
            tarea_rechazada: [quitarTareaActiva, recargarTareas, 'INICIAL'],
            rechazo_cancelado: 'INICIAL',
        },
    };
};
