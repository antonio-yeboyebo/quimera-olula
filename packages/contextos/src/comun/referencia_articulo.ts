import { tComun } from "./i18n/index.ts";
/** Longitud de `articulos.referencia` en el escritorio (articulos.mtd). */
export const LONGITUD_REFERENCIA_ARTICULO = 18;

/** La referencia del artículo nuevo: obligatoria y como mucho 18 caracteres, como en Eneboo. */
export const referenciaArticuloValida = (referencia: string | undefined): boolean | string => {
    const valor = (referencia ?? "").trim();
    if (!valor) return tComun("referenciaArticulo.laReferenciaEsObligatoria");
    if (valor.length > LONGITUD_REFERENCIA_ARTICULO)
        return tComun("referenciaArticulo.laReferenciaAdmiteComoMuchoLongitud", { LONGITUD_REFERENCIA_ARTICULO });
    return true;
};
