export const opcionesTipoIdFiscal = [
    { valor: "NIF", descripcion: "N.I.F." },
    { valor: "VAT", descripcion: "V.A.T." },
]

export const idFiscalValido = (tipo: string) => (valor: string) => {
    if (tipo === "NIF") {
        return valor.length === 9 || "El NIF debe tener 9 caracteres";
    }
    if (tipo === "VAT") {
        return (valor.length === 11 && valor[0] === "E" && valor[1] === "S") || "El VAT debe cumplir ESXXXXXXXXXX";
    }
    return false;
}
export const tipoIdFiscalValido = (tipo: string): string | boolean => {
    return tipo === "NIF" || tipo === "VAT" || "El tipo debe ser NIF o VAT";
}