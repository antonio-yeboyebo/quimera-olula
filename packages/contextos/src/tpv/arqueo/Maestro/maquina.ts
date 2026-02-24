import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroArqueosTpv, EstadoMaestroArqueosTpv } from "./diseño.ts";
import { Arqueos, crearArqueo, recargarArqueos } from "./dominio.ts";


export const getMaquina: () => Maquina<EstadoMaestroArqueosTpv, ContextoMaestroArqueosTpv> = () => {

    return {

        INICIAL: {

            arqueo_cambiado: [Arqueos.cambiar],

            arqueo_seleccionado: [Arqueos.activar],

            arqueo_deseleccionado: [Arqueos.desactivar],

            arqueo_borrado: [Arqueos.quitar],

            recarga_de_arqueos_solicitada: recargarArqueos,

            creacion_de_arqueo_solicitada: crearArqueo,
        },
    }
}

