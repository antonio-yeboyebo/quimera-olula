import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { NuevoEstadoOportunidad } from "./diseño.ts";
import { tCrm } from "../../i18n/index.ts";

export const metaNuevoEstadoOportunidad: MetaModelo<NuevoEstadoOportunidad> = {
    campos: {
        id: {
            requerido: true,
            validacion: (estado: NuevoEstadoOportunidad) =>
                !stringNoVacio(estado.id)
                    ? tCrm("estadoOportunidadVenta.elCodigoEsObligatorio")
                    : estado.id.length > 10
                        ? tCrm("estadoOportunidadVenta.maximo10Caracteres")
                        : true,
        },
        descripcion: { requerido: true, validacion: (estado: NuevoEstadoOportunidad) => stringNoVacio(estado.descripcion) },
        probabilidad: { requerido: true, tipo: "numero" },
    },
};

export const nuevoEstadoOportunidadVacio: NuevoEstadoOportunidad = {
    id: '',
    descripcion: '',
    probabilidad: 0,
    valorDefecto: false,
};