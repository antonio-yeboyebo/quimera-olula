import { tComun } from "#/comun/i18n/index.ts";

export const opcionesTipoIdFiscal = [
    { valor: "NIF", descripcion: "N.I.F." },
    { valor: "NIF/IVA", descripcion: "V.A.T." },
    { valor: "Otro", descripcion: "OTRO" },
]

/** Las mismas opciones con su descripción en el idioma activo. */
export const opcionesTipoIdFiscalTraducidas = () => [
    { valor: "NIF", descripcion: tComun("tipoIdFiscal.opciones.nif") },
    { valor: "NIF/IVA", descripcion: tComun("tipoIdFiscal.opciones.vat") },
    { valor: "Otro", descripcion: tComun("tipoIdFiscal.opciones.otro") },
]

const TIPOS_ACEPTADOS = [...opcionesTipoIdFiscal.map((o) => o.valor), "PASAPORTE"];

export const idFiscalValido = (tipo: string) => (valor: string) => {
    if (tipo === "NIF") {
        return valor.length === 9 || tComun("tipoIdFiscal.errorNif");
    }
    if (tipo === "NIF/IVA") {
        return (valor.length === 11 && valor[0] === "E" && valor[1] === "S") || tComun("tipoIdFiscal.errorVat");
    }
    return true;
}
export const tipoIdFiscalValido = (tipo: string): string | boolean => {
    return TIPOS_ACEPTADOS.includes(tipo) || tComun("tipoIdFiscal.errorTipo");
}
