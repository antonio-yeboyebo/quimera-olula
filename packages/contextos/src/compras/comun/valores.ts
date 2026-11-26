import { tCompras } from "#/compras/i18n/index.ts";

const TIPOS_ID_FISCAL_COMPRAS = ["NIF", "NIFIVA", "PASAPORTE", "OTRO"];

/** Tipos de id fiscal de compras: el valor se guarda tal cual; la descripción, en el idioma activo. */
export const opcionesTipoIdFiscalCompras = (t = tCompras) => [
    { valor: "NIF", descripcion: t("comun.tipoIdFiscal.nif") },
    { valor: "NIFIVA", descripcion: t("comun.tipoIdFiscal.nifIva") },
    { valor: "PASAPORTE", descripcion: t("comun.tipoIdFiscal.pasaporte") },
    { valor: "OTRO", descripcion: t("comun.tipoIdFiscal.otro") },
];

export const tipoIdFiscalCompraValido = (tipo: string): string | boolean =>
    TIPOS_ID_FISCAL_COMPRAS.includes(tipo) || tCompras("comun.tipoIdFiscal.errorTipo");

export const idFiscalCompraValido = (tipo: string) => (valor: string): string | boolean => {
    if (valor.length === 0) return tCompras("comun.tipoIdFiscal.errorRequerido");
    if (tipo === "NIF") {
        return valor.length === 9 || tCompras("comun.tipoIdFiscal.errorNif");
    }
    return true;
};
