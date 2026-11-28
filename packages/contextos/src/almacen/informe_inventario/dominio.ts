import { formatearFechaString, formatearNumero } from "@olula/lib/dominio.ts";
import { FichaInforme, PestañaInforme } from "#/comun/informe_documentos/diseño.ts";
import { FormatoHoja, ResultadoInventario } from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

/** Las opciones guardan el valor de Eneboo (en español) y enseñan su traducción. */
const TEXTO_OPCION: Record<string, () => string> = {
    "No ordenar": () => tAlmacen("informe_inventario.noOrdenar"),
    "Código": () => tAlmacen("informe_inventario.codigo"),
    "Nombre": () => tAlmacen("informe_inventario.nombre"),
    "Ascendente": () => tAlmacen("informe_inventario.ascendente"),
    "Descendente": () => tAlmacen("informe_inventario.descendente"),
    "Coste medio": () => tAlmacen("informe_inventario.costeMedio"),
    "PVP": () => tAlmacen("informe_inventario.pvp"),
    "Coste Prov.": () => tAlmacen("informe_inventario.costeProv"),
};

export const descripcionOpcionInventario = (valor: string): string => TEXTO_OPCION[valor]?.() ?? valor;

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
        partes.push(tAlmacen("informe_inventario.valoracionTipovaloracionRecargo", { tipoValoracion: descripcionOpcionInventario(resultado.tipoValoracion), recargo }));
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
