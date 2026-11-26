import { formatearFechaString, formatearNumero } from "@olula/lib/dominio.ts";
import { FichaInforme, PestañaInforme } from "#/comun/informe_documentos/diseño.ts";
import { FormatoHoja, ResultadoInventario } from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

/** Nombre del fichero descargado: clave del informe y descripción de la ficha. */
export const nombreFicheroInventario = (
    pestaña: Pick<PestañaInforme, "clave">,
    ficha: Pick<FichaInforme, "descripcion">,
    extension: "pdf" | FormatoHoja
): string => {
    const base = `${pestaña.clave}-${ficha.descripcion || "informe"}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return `${base}.${extension}`;
};

/** Línea bajo el título: fecha del stock y, en el valorado, la valoración. */
export const criteriosResultado = (resultado: ResultadoInventario): string => {
    const partes = [resultado.fecha ? tAlmacen("informe_inventario.stockAFecha", { fecha: formatearFechaString(resultado.fecha) }) : tAlmacen("informe_inventario.stockActual")];
    if (resultado.valorado && resultado.tipoValoracion) {
        const recargo = resultado.porPvp ? ` + ${formatearNumero(resultado.porPvp)} %` : "";
        partes.push(tAlmacen("informe_inventario.valoracionTipovaloracionRecargo", { tipoValoracion: resultado.tipoValoracion, recargo }));
    }
    const articulos = resultado.totalArticulos;
    partes.push(`${formatearNumero(articulos)} ${articulos === 1 ? tAlmacen("informe_inventario.articulo") : tAlmacen("informe_inventario.articulos")}`);
    return partes.join(" · ");
};

/** Importe con dos decimales (precio, valor y totales); vacío si no hay. */
export const importe = (valor: number | null): string =>
    valor === null ? "" : formatearNumero(valor, 2);

/** Cantidad en formato español, con los decimales que tenga. */
export const cantidad = (valor: number): string => formatearNumero(valor);
