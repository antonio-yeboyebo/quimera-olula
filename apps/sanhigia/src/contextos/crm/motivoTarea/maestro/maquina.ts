import { Maquina } from "@olula/lib/diseño.js";
import {
    ContextoMaestroMotivoTarea,
    EstadoMaestroMotivoTarea,
} from "./diseño.ts";
import {
    ampliarMotivosTarea,
    MotivosTarea,
    recargarMotivosTarea,
} from "./dominio.ts";

export const getMaquina: () => Maquina<
    EstadoMaestroMotivoTarea,
    ContextoMaestroMotivoTarea
> = () => ({
    INICIAL: {
        motivo_tarea_cambiado: [MotivosTarea.cambiar],
        motivo_tarea_seleccionado: [MotivosTarea.activar],
        motivo_tarea_deseleccionado: MotivosTarea.desactivar,
        motivo_tarea_borrado: MotivosTarea.quitar,
        recarga_de_motivos_tarea_solicitada: recargarMotivosTarea,
        criteria_cambiado: [MotivosTarea.filtrar, recargarMotivosTarea],
        siguiente_pagina: [MotivosTarea.filtrar, ampliarMotivosTarea],
        creacion_motivo_tarea_solicitada: "CREANDO_MOTIVO_TAREA",
    },
    CREANDO_MOTIVO_TAREA: {
        creacion_motivo_tarea_cancelada: "INICIAL",
        motivo_tarea_creado: [
            MotivosTarea.incluir,
            MotivosTarea.activar,
            "INICIAL",
        ],
    },
});
