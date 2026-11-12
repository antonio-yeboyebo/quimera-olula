import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoVisita, EstadoVisita } from "./diseño.ts";
import {
    cambiarProceso,
    cargarProceso,
    cerrarTratoProceso,
    guardarProceso,
    iniciarProceso,
    pedirFinalizacionProceso,
    volverProceso,
} from "./dominio.ts";

export const getMaquina = (): Maquina<EstadoVisita, ContextoVisita> => ({
    CARGANDO: {
        cargar: cargarProceso,
    },
    PENDIENTE: {
        iniciar: iniciarProceso,
        finalizar: pedirFinalizacionProceso,
        cambiar: cambiarProceso,
    },
    EN_CURSO: {
        finalizar: pedirFinalizacionProceso,
        cambiar: cambiarProceso,
    },
    FINALIZANDO: {
        cambiar: cambiarProceso,
        volver: volverProceso,
        guardar: guardarProceso,
    },
    CERRANDO_TRATO: {
        cambiar: cambiarProceso,
        cerrar_trato: cerrarTratoProceso,
        mantener_abierto: "TERMINADA",
    },
    TERMINADA: {},
});
