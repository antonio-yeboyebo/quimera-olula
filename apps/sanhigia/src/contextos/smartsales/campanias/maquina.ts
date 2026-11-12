import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoNuevaCampania, EstadoNuevaCampania } from "./diseño.ts";
import { cambiarProceso, crearProceso, fijarAgenteProceso, previsualizarProceso, volverProceso } from "./dominio.ts";

export const getMaquina = (): Maquina<EstadoNuevaCampania, ContextoNuevaCampania> => ({
    DEFINIENDO: {
        cambiar: cambiarProceso,
        fijar_agente: fijarAgenteProceso,
        previsualizar: previsualizarProceso,
    },
    REVISANDO: {
        volver: volverProceso,
        crear: crearProceso,
    },
    CREADA: {},
});
