import { Maquina as MaquinaEstados } from "@olula/lib/diseño.ts";
import { ContextoMaestroMaquina, EstadoMaestroMaquina } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => MaquinaEstados<EstadoMaestroMaquina, ContextoMaestroMaquina> = () => {
    return {
        INICIAL: {
            maquina_seleccionada: [maestro.Maquinas.activar],
            maquina_deseleccionada: [maestro.Maquinas.desactivar],
            recarga_de_maquinas_solicitada: maestro.recargarMaquinas,
            criteria_cambiado: [maestro.Maquinas.filtrar, maestro.recargarMaquinas],
            siguiente_pagina: [maestro.Maquinas.filtrar, maestro.ampliarMaquinas],
        },
    };
};
