import { Maquina } from "@olula/lib/diseño.ts";
import {
    ContextoMaestroComparativaVentas,
    EstadoMaestroComparativaVentas,
} from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<
    EstadoMaestroComparativaVentas,
    ContextoMaestroComparativaVentas
> = () => {
    return {
        INICIAL: {
            comparativa_seleccionada: [maestro.Comparativas.activar],
            comparativa_deseleccionada: [maestro.Comparativas.desactivar],

            comparativa_cambiada: [maestro.Comparativas.cambiar],
            comparativa_borrada: [maestro.Comparativas.quitar],

            recarga_de_comparativas_solicitada: maestro.recargarComparativas,

            criteria_cambiado: [
                maestro.Comparativas.filtrar,
                maestro.recargarComparativas,
            ],
            siguiente_pagina: [
                maestro.Comparativas.filtrar,
                maestro.ampliarComparativas,
            ],

            crear_comparativa_solicitada: "CREANDO",
        },

        CREANDO: {
            alta_de_comparativa_cancelada: "INICIAL",
            comparativa_creada: maestro.incluirComparativaCreadaPorId,
        },
    };
};
