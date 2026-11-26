/** Textos de los componentes comunes de los contextos (`#/comun`, `#/valores`). Referencia: español. */
export const es = {
    tipoIdFiscal: {
        etiqueta: "Tipo Id Fiscal",
        opciones: { nif: "N.I.F.", vat: "V.A.T.", otro: "OTRO" },
        errorNif: "El NIF debe tener 9 caracteres",
        errorVat: "El VAT debe cumplir ESXXXXXXXXXX",
        errorTipo: "El tipo debe ser N.I.F., V.A.T. u OTRO",
    },
    divisa: "Divisa",
    formaPago: "Forma de Pago",
    grupoIvaNegocio: "Grupo IVA negocio",
    pais: "Seleccionar país",
    pantallaConfig: {
        guardar: "Guardar",
        guardando: "Guardando…",
        sinOpciones: "Todavía no hay opciones en este apartado.",
    },
} as const;
