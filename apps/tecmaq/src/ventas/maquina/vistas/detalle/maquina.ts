import { Maquina as MaquinaEstados } from "@olula/lib/diseño.ts";
import { cargarContexto } from "./detalle.ts";
import { ContextoDetalleMaquina, EstadoDetalleMaquina } from "./diseño.ts";

export const getMaquina: () => MaquinaEstados<EstadoDetalleMaquina, ContextoDetalleMaquina> = () => {
    return {
        INICIAL: {
            maquina_id_cambiado: [cargarContexto],
        },
        ABIERTO: {
            maquina_id_cambiado: [cargarContexto],
        },
    };
};
