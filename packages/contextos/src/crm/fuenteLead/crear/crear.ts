import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { FuenteLead } from "../diseño.ts";
import { tCrm } from "../../i18n/index.ts";

export const metaNuevaFuenteLead: MetaModelo<FuenteLead> = {
    campos: {
        id: {
            requerido: true,
            validacion: (fuente: FuenteLead) =>
                !stringNoVacio(fuente.id)
                    ? tCrm("fuenteLead.elCodigoEsObligatorio")
                    : fuente.id.length > 20
                        ? tCrm("fuenteLead.maximo20Caracteres")
                        : true,
        },
        descripcion: { requerido: true, validacion: (fuente: FuenteLead) => stringNoVacio(fuente.descripcion) },
    },
};

export const nuevaFuenteLeadVacia: FuenteLead = {
    id: '',
    descripcion: '',
    valorDefecto: false,
};