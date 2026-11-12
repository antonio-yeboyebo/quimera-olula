import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoNavegador, EstadoNavegador } from "./diseño.ts";
import {
    abrirVista,
    alternarNodo,
    borrarVista,
    cambiarCubo,
    cambiarPeticion,
    cambiarPresentacion,
    cargaTerminada,
    cargarCatalogo,
    cerrarVista,
    exportar,
    guardarVista,
    guardarVistaComo,
    irAdelante,
    irAtras,
    recargar,
    refrescarCatalogo,
} from "./navegador.ts";

export const getMaquina: () => Maquina<EstadoNavegador, ContextoNavegador> = () => ({
    CARGANDO: {
        iniciado: [cargarCatalogo],
    },

    SIN_CUBOS: {},

    NAVEGANDO: {
        cubo_cambiado: [cambiarCubo],
        peticion_cambiada: [cambiarPeticion],
        presentacion_cambiada: [cambiarPresentacion],
        nodo_alternado: [alternarNodo],
        exportacion_solicitada: [exportar],
        historial_atras: [irAtras],
        historial_adelante: [irAdelante],
        recarga_solicitada: [recargar],
        catalogo_refrescado: [refrescarCatalogo],
        carga_terminada: [cargaTerminada],
        vista_abierta: [abrirVista],
        vista_cerrada: [cerrarVista],
        vista_guardada: [guardarVista],
        vista_guardada_como: [guardarVistaComo],
        vista_borrada: [borrarVista],
    },
});
