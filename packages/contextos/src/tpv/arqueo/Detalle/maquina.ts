import { Maquina } from "@olula/lib/diseño.js";
import { publicar } from "@olula/lib/dominio.js";
import { ArqueoTpv } from "../diseño.ts";
import { ContextoArqueoTpv, EstadoArqueoTpv } from "./diseño.ts";
import {
    cargarContexto,
    getContextoVacio,
    refrescarArqueo
} from "./dominio.ts";


export const getMaquina: () => Maquina<EstadoArqueoTpv, ContextoArqueoTpv> = () => {

    return {

        INICIAL: {

            id_arqueo_cambiado: [cargarContexto],

            arqueo_deseleccionado: [
                getContextoVacio,
                publicar('arqueo_deseleccionado', null)
            ]
        },

        ABIERTO: {

            arqueo_guardado: [refrescarArqueo],

            borrar_solicitado: "BORRANDO_ARQUEO",

            borrado_de_movimiento_solicitado: "BORRANDO_MOVIMIENTO",

            recuento_solicitado: "RECONTANDO",

            cierre_solicitado: "CERRANDO",

            creacion_de_movimiento_solicitada: "CREANDO_MOVIMIENTO",

        },

        BORRANDO_MOVIMIENTO: {

            movimiento_borrado: [refrescarArqueo, "ABIERTO"],

            borrado_de_movimiento_cancelado: "ABIERTO",

        },

        CERRADO: {

            reapertura_solicitada: "REABRIENDO",
        },

        CREANDO_MOVIMIENTO: {

            movimiento_creado: [refrescarArqueo, "ABIERTO"],

            creacion_de_movimiento_cancelada: "ABIERTO",

        },

        RECONTANDO: {

            "recuento_cancelado": "ABIERTO",

            "recuento_hecho": [refrescarArqueo, "ABIERTO"],
        },

        CERRANDO: {

            cierre_cancelado: "ABIERTO",

            cierre_hecho: [refrescarArqueo, "CERRADO"],

        },

        REABRIENDO: {

            reapertura_cancelada: "CERRADO",

            reapertura_hecha: [refrescarArqueo, "ABIERTO"],

        },

        BORRANDO_ARQUEO: {

            borrado_de_arqueo_cancelado: "ABIERTO",

            arqueo_borrado: [
                getContextoVacio,
                publicar('arqueo_borrado', (_, arqueo) => (arqueo as ArqueoTpv).id)
            ]
        },
    }
}