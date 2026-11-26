import type { Traduccion } from "@olula/lib/i18n/i18n.ts";
import type { es } from "./es.ts";

export const en: Traduccion<typeof es> = {
    tipoIdFiscal: {
        etiqueta: "Tax ID type",
        opciones: { nif: "N.I.F. (Spanish tax ID)", vat: "V.A.T.", otro: "OTHER" },
        errorNif: "The NIF must have 9 characters",
        errorVat: "The VAT number must look like ESXXXXXXXXXX",
        errorTipo: "The type must be N.I.F., V.A.T. or OTHER",
    },
    divisa: "Currency",
    formaPago: "Payment method",
    grupoIvaNegocio: "VAT business group",
    pais: "Select country",
    pantallaConfig: {
        guardar: "Save",
        guardando: "Saving…",
        sinOpciones: "There are no options in this section yet.",
    },
};
