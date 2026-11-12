import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import {
    calcularResultado,
    cargarContexto,
    refrescarComparativa,
} from "./detalle.ts";
import {
    ContextoDetalleComparativaVentas,
    EstadoDetalleComparativaVentas,
} from "./diseño.ts";

export const getMaquina: () => Maquina<
    EstadoDetalleComparativaVentas,
    ContextoDetalleComparativaVentas
> = () => {
    return {
        INICIAL: {
            comparativa_id_cambiado: [cargarContexto],
            comparativa_deseleccionada: [publicar("comparativa_deseleccionada", null)],
        },

        ABIERTO: {
            comparativa_guardada: [refrescarComparativa],
            calculo_solicitado: [calcularResultado],
            borrado_solicitado: "BORRANDO",
            comparativa_id_cambiado: [cargarContexto],
        },

        BORRANDO: {
            comparativa_borrada: [publicar("comparativa_borrada", null), "INICIAL"],
            borrado_cancelado: "ABIERTO",
        },
    };
};
