import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { EstadoLead } from "../diseño.ts";
import { tCrm } from "../../i18n/index.ts";

export const metaNuevoEstadoLead: MetaModelo<EstadoLead> = {
    campos: {
        id: {
            requerido: true,
            validacion: (estado: EstadoLead) =>
                !stringNoVacio(estado.id)
                    ? tCrm("estadoLead.elCodigoEsObligatorio")
                    : estado.id.length > 10
                        ? tCrm("estadoLead.maximo10Caracteres")
                        : true,
        },
        descripcion: { requerido: true, validacion: (estado: EstadoLead) => stringNoVacio(estado.descripcion) },
    },
};

export const nuevoEstadoLeadVacio: EstadoLead = {
    id: '',
    descripcion: '',
    valorDefecto: false,
};