import { Maquina } from "@olula/lib/diseño.js";
import { ContextoAlbaranarPedido, EstadoAlbaranarPedido } from "./diseño.ts";
import {
    actualizarEstadoCerradoLinea,
    actualizarTramos,
    albaranarPedido,
    cambiarLinea,
    cancelarSeleccion,
    cargarDatos,
    seleccionarLinea
} from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoAlbaranarPedido, ContextoAlbaranarPedido> = () => {
    return {
        INICIAL: {
            cargar: [cargarDatos],
        },

        VACIO: {},

        CARGANDO: {},

        LISTO: {
            linea_seleccionada: seleccionarLinea,

            linea_cambiada: cambiarLinea,

            tramos_actualizados: actualizarTramos,

            linea_cerrada_actualizada: actualizarEstadoCerradoLinea,

            seleccion_cancelada: cancelarSeleccion,

            albaranado_solicitado: "CONFIRMANDO_ALBARANADO",
        },

        CONFIRMANDO_ALBARANADO: {
            albaranado_cancelado: "LISTO",

            albaranado_confirmado: [
                albaranarPedido,
                "ALBARANADO_COMPLETADO"
            ],
        },

        ALBARANADO_COMPLETADO: {
            albaranado_completado_cerrado: "LISTO",
        },

        ALBARANANDO: {},
    };
};
